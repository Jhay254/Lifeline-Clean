import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OutlookTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
}

interface OutlookUser {
    mail: string;
    displayName: string;
}

interface OutlookMessage {
    id: string;
    subject: string;
    from: {
        emailAddress: {
            address: string;
        };
    };
    toRecipients: Array<{
        emailAddress: {
            address: string;
        };
    }>;
    receivedDateTime: string;
    hasAttachments: boolean;
}

export class OutlookService {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;
    private tenantId: string = 'common'; // Use 'common' for personal and work accounts

    constructor() {
        this.clientId = process.env.OUTLOOK_CLIENT_ID || '';
        this.clientSecret = process.env.OUTLOOK_CLIENT_SECRET || '';
        this.redirectUri = process.env.OUTLOOK_REDIRECT_URI || '';
    }

    getAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            redirect_uri: this.redirectUri,
            response_mode: 'query',
            scope: 'openid profile email Mail.Read offline_access',
            state: 'outlook_auth_state',
        });
        return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
    }

    async exchangeCodeForToken(code: string): Promise<OutlookTokenResponse> {
        const params = new URLSearchParams({
            client_id: this.clientId,
            scope: 'Mail.Read offline_access',
            code,
            redirect_uri: this.redirectUri,
            grant_type: 'authorization_code',
            client_secret: this.clientSecret,
        });

        const response = await axios.post<OutlookTokenResponse>(
            `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        return response.data;
    }

    async getUserInfo(accessToken: string): Promise<OutlookUser> {
        const response = await axios.get<OutlookUser>(
            'https://graph.microsoft.com/v1.0/me',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return response.data;
    }

    async refreshToken(refreshToken: string): Promise<OutlookTokenResponse> {
        const params = new URLSearchParams({
            client_id: this.clientId,
            scope: 'Mail.Read offline_access',
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            client_secret: this.clientSecret,
        });

        const response = await axios.post<OutlookTokenResponse>(
            `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        return response.data;
    }

    async fetchEmails(accessToken: string, userId: string): Promise<void> {
        try {
            const response = await axios.get<{ value: OutlookMessage[] }>(
                'https://graph.microsoft.com/v1.0/me/messages',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        $top: 50,
                        $select: 'id,subject,from,toRecipients,receivedDateTime,hasAttachments',
                        $orderby: 'receivedDateTime desc',
                    },
                }
            );

            if (!response.data.value) {
                console.log('No Outlook messages found');
                return;
            }

            for (const message of response.data.value) {
                const category = this.categorizeEmail(message.subject);

                await prisma.emailMetadata.upsert({
                    where: {
                        provider_emailId: {
                            provider: 'OUTLOOK',
                            emailId: message.id,
                        },
                    },
                    update: {
                        subject: message.subject,
                        sender: message.from.emailAddress.address,
                        recipient: message.toRecipients[0]?.emailAddress.address || '',
                        timestamp: new Date(message.receivedDateTime),
                        hasAttachments: message.hasAttachments,
                        category,
                    },
                    create: {
                        userId,
                        provider: 'OUTLOOK',
                        emailId: message.id,
                        subject: message.subject,
                        sender: message.from.emailAddress.address,
                        recipient: message.toRecipients[0]?.emailAddress.address || '',
                        timestamp: new Date(message.receivedDateTime),
                        hasAttachments: message.hasAttachments,
                        category,
                    },
                });
            }

            console.log(`Fetched ${response.data.value.length} Outlook messages`);
        } catch (error) {
            console.error('Error fetching Outlook messages:', error);
        }
    }

    private categorizeEmail(subject: string): string {
        const lowerSubject = subject.toLowerCase();

        if (lowerSubject.includes('flight') || lowerSubject.includes('boarding pass')) {
            return 'flight';
        }
        if (lowerSubject.includes('hotel') || lowerSubject.includes('reservation')) {
            return 'hotel';
        }
        if (lowerSubject.includes('receipt') || lowerSubject.includes('invoice')) {
            return 'receipt';
        }
        if (lowerSubject.includes('ticket') || lowerSubject.includes('event')) {
            return 'event';
        }

        return 'personal';
    }
}
