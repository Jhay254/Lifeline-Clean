import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GmailTokenResponse {
    access_token: string;
    refresh_token?: string;
    scope: string;
    token_type: string;
    expiry_date: number;
}

export class GmailService {
    private oauth2Client;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URI
        );
    }

    getAuthUrl(): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            prompt: 'consent',
        });
    }

    async exchangeCodeForToken(code: string): Promise<GmailTokenResponse> {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens as GmailTokenResponse;
    }

    async getUserEmail(accessToken: string): Promise<string> {
        this.oauth2Client.setCredentials({ access_token: accessToken });
        const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
        const { data } = await oauth2.userinfo.get();
        return data.email || '';
    }

    async refreshToken(refreshToken: string): Promise<GmailTokenResponse> {
        this.oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        return credentials as GmailTokenResponse;
    }

    async fetchEmails(accessToken: string, refreshToken: string | undefined, userId: string): Promise<void> {
        try {
            this.oauth2Client.setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

            // Fetch recent emails (last 30 days)
            const response = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 50,
                q: 'newer_than:30d',
            });

            if (!response.data.messages) {
                console.log('No Gmail messages found');
                return;
            }

            for (const message of response.data.messages) {
                if (!message.id) continue;

                const fullMessage = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'metadata',
                    metadataHeaders: ['From', 'To', 'Subject', 'Date'],
                });

                const headers = fullMessage.data.payload?.headers || [];
                const subject = headers.find(h => h.name === 'Subject')?.value || '';
                const from = headers.find(h => h.name === 'From')?.value || '';
                const to = headers.find(h => h.name === 'To')?.value || '';
                const dateStr = headers.find(h => h.name === 'Date')?.value || '';

                const timestamp = dateStr ? new Date(dateStr) : new Date();
                const category = this.categorizeEmail(subject);

                await prisma.emailMetadata.upsert({
                    where: {
                        provider_emailId: {
                            provider: 'GMAIL',
                            emailId: message.id,
                        },
                    },
                    update: {
                        subject,
                        sender: from,
                        recipient: to,
                        timestamp,
                        category,
                    },
                    create: {
                        userId,
                        provider: 'GMAIL',
                        emailId: message.id,
                        subject,
                        sender: from,
                        recipient: to,
                        timestamp,
                        category,
                        hasAttachments: false,
                    },
                });
            }

            console.log(`Fetched ${response.data.messages.length} Gmail messages`);
        } catch (error) {
            console.error('Error fetching Gmail messages:', error);
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
