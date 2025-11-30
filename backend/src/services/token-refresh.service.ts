import { PrismaClient } from '@prisma/client';
import { InstagramService } from './instagram.service';
import { TwitterService } from './twitter.service';
import { FacebookService } from './facebook.service';
import { LinkedInService } from './linkedin.service';
import { GmailService } from './gmail.service';
import { OutlookService } from './outlook.service';
import Logger from '../utils/logger';

const prisma = new PrismaClient();

export class TokenRefreshService {
    private instagramService: InstagramService;
    private twitterService: TwitterService;
    private facebookService: FacebookService;
    private linkedinService: LinkedInService;
    private gmailService: GmailService;
    private outlookService: OutlookService;

    constructor() {
        this.instagramService = new InstagramService();
        this.twitterService = new TwitterService();
        this.facebookService = new FacebookService();
        this.linkedinService = new LinkedInService();
        this.gmailService = new GmailService();
        this.outlookService = new OutlookService();
    }

    /**
     * Check for expiring tokens and refresh them
     */
    async refreshAllTokens() {
        Logger.info('Starting token refresh cycle...');

        // Find tokens expiring in the next 24 hours
        const expiringThreshold = new Date();
        expiringThreshold.setHours(expiringThreshold.getHours() + 24);

        const accounts = await prisma.socialAccount.findMany({
            where: {
                expiresAt: {
                    lt: expiringThreshold,
                },
            },
        });

        Logger.info(`Found ${accounts.length} accounts with expiring tokens`);

        for (const account of accounts) {
            try {
                await this.refreshAccountToken(account);
            } catch (error: any) {
                Logger.error(`Failed to refresh token for account ${account.id} (${account.provider}): ${error.message}`);
            }
        }

        Logger.info('Token refresh cycle completed');
    }

    private async refreshAccountToken(account: any) {
        Logger.info(`Refreshing token for ${account.provider} account: ${account.platformUsername}`);

        let newTokens: any = null;

        switch (account.provider) {
            case 'INSTAGRAM':
                // Instagram Long-Lived tokens last 60 days and can be refreshed
                newTokens = await this.instagramService.refreshToken(account.accessToken);
                break;

            case 'TWITTER':
                if (account.refreshToken) {
                    // Twitter V2 OAuth tokens expire in 2 hours, need refresh token
                    newTokens = await this.twitterService.refreshToken(account.refreshToken);
                }
                break;

            case 'FACEBOOK':
                // Facebook Long-Lived tokens last 60 days
                newTokens = await this.facebookService.refreshToken(account.accessToken);
                break;

            case 'GMAIL':
                if (account.refreshToken) {
                    // Google tokens need refresh
                    const gmailTokens = await this.gmailService.refreshToken(account.refreshToken);
                    newTokens = {
                        access_token: gmailTokens.access_token,
                        refresh_token: gmailTokens.refresh_token,
                        expires_in: Math.floor((gmailTokens.expiry_date - Date.now()) / 1000),
                    };
                }
                break;

            case 'OUTLOOK':
                if (account.refreshToken) {
                    // Microsoft tokens need refresh
                    newTokens = await this.outlookService.refreshToken(account.refreshToken);
                }
                break;

            case 'LINKEDIN':
                if (account.refreshToken) {
                    // LinkedIn tokens need refresh
                    newTokens = await this.linkedinService.refreshToken(account.refreshToken);
                }
                break;

            default:
                Logger.warn(`No refresh logic for provider: ${account.provider}`);
        }

        if (newTokens) {
            await prisma.socialAccount.update({
                where: { id: account.id },
                data: {
                    accessToken: newTokens.access_token,
                    refreshToken: newTokens.refresh_token || account.refreshToken,
                    expiresAt: new Date(Date.now() + (newTokens.expires_in * 1000)),
                },
            });
            Logger.info(`Successfully refreshed token for ${account.provider}`);
        }
    }
}
