import Redis from 'ioredis';
import crypto from 'crypto';
import Logger from '../utils/logger';

const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
});

redis.on('error', (err) => {
    Logger.error(`Redis connection error: ${err.message}`);
});

redis.on('connect', () => {
    Logger.info('Redis connected for PKCE storage');
});

interface PKCEData {
    codeVerifier: string;
    userId?: string;
}

export class PKCEService {
    private readonly TTL = 600; // 10 minutes in seconds

    /**
     * Generate a random state parameter
     */
    generateState(): string {
        return crypto.randomBytes(32).toString('base64url');
    }

    /**
     * Store PKCE data with state as key
     */
    async store(state: string, data: PKCEData): Promise<void> {
        try {
            await redis.setex(
                `pkce:${state}`,
                this.TTL,
                JSON.stringify(data)
            );
            Logger.debug(`PKCE data stored for state: ${state}`);
        } catch (error: any) {
            Logger.error(`Failed to store PKCE data: ${error.message}`);
            throw error;
        }
    }

    /**
     * Retrieve and delete PKCE data (one-time use)
     */
    async retrieve(state: string): Promise<PKCEData | null> {
        try {
            const key = `pkce:${state}`;
            const data = await redis.get(key);

            if (!data) {
                Logger.warn(`No PKCE data found for state: ${state}`);
                return null;
            }

            // Delete after retrieval (one-time use)
            await redis.del(key);

            Logger.debug(`PKCE data retrieved and deleted for state: ${state}`);
            return JSON.parse(data);
        } catch (error: any) {
            Logger.error(`Failed to retrieve PKCE data: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate state parameter (CSRF protection)
     */
    async validate(state: string): Promise<boolean> {
        try {
            const exists = await redis.exists(`pkce:${state}`);
            return exists === 1;
        } catch (error: any) {
            Logger.error(`Failed to validate state: ${error.message}`);
            return false;
        }
    }

    /**
     * Clean up expired PKCE data (called by cron)
     */
    async cleanup(): Promise<number> {
        try {
            const keys = await redis.keys('pkce:*');
            let cleaned = 0;

            for (const key of keys) {
                const ttl = await redis.ttl(key);
                if (ttl === -1) {
                    // Key exists but has no TTL (shouldn't happen, but clean it up)
                    await redis.del(key);
                    cleaned++;
                }
            }

            if (cleaned > 0) {
                Logger.info(`Cleaned up ${cleaned} expired PKCE entries`);
            }

            return cleaned;
        } catch (error: any) {
            Logger.error(`Failed to cleanup PKCE data: ${error.message}`);
            return 0;
        }
    }
}

export const pkceService = new PKCEService();
