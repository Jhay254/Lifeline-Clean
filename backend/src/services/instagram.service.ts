import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { mediaQueue } from './queue.service';

const prisma = new PrismaClient();

interface InstagramTokenResponse {
    access_token: string;
    user_id: number;
}

interface InstagramMediaResponse {
    data: Array<{
        id: string;
        caption?: string;
        media_type: string;
        media_url?: string;
        timestamp: string;
        like_count?: number;
    }>;
}

export class InstagramService {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor() {
        this.clientId = process.env.INSTAGRAM_CLIENT_ID || '';
        this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || '';
        this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || '';
    }

    getAuthUrl(): string {
        const scopes = ['user_profile', 'user_media'];
        return `https://api.instagram.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scopes.join(',')}&response_type=code`;
    }

    async exchangeCodeForToken(code: string): Promise<InstagramTokenResponse> {
        const response = await axios.post<InstagramTokenResponse>(
            'https://api.instagram.com/oauth/access_token',
            new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri,
                code,
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );
        return response.data;
    }

    async refreshToken(accessToken: string): Promise<{ access_token: string; expires_in: number }> {
        const response = await axios.get<{ access_token: string; token_type: string; expires_in: number }>(
            'https://graph.instagram.com/refresh_access_token',
            {
                params: {
                    grant_type: 'ig_refresh_token',
                    access_token: accessToken,
                },
            }
        );
        return {
            access_token: response.data.access_token,
            expires_in: response.data.expires_in,
        };
    }

    async fetchMedia(accessToken: string, userId: string): Promise<void> {
        try {
            const response = await axios.get<InstagramMediaResponse>(
                `https://graph.instagram.com/me/media`,
                {
                    params: {
                        fields: 'id,caption,media_type,media_url,timestamp,like_count',
                        access_token: accessToken,
                    },
                }
            );

            for (const media of response.data.data) {
                // Store content metadata
                const content = await prisma.content.upsert({
                    where: {
                        provider_platformId: {
                            provider: 'INSTAGRAM',
                            platformId: media.id,
                        },
                    },
                    update: {
                        text: media.caption || null,
                        mediaUrls: media.media_url ? JSON.stringify([media.media_url]) : null,
                        engagementLikes: media.like_count || 0,
                    },
                    create: {
                        userId,
                        provider: 'INSTAGRAM',
                        platformId: media.id,
                        contentType: media.media_type.toLowerCase(),
                        text: media.caption || null,
                        mediaUrls: media.media_url ? JSON.stringify([media.media_url]) : null,
                        timestamp: new Date(media.timestamp),
                        engagementLikes: media.like_count || 0,
                    },
                });

                // Queue media download
                if (media.media_url) {
                    await mediaQueue.add({
                        url: media.media_url,
                        userId,
                        provider: 'INSTAGRAM',
                        contentId: content.id,
                    });
                }
            }

            console.log(`Fetched ${response.data.data.length} Instagram media items`);
        } catch (error) {
            console.error('Error fetching Instagram media:', error);
            throw error;
        }
    }
}
