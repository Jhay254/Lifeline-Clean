import Redis from 'ioredis';
import Logger from '../utils/logger';

const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
});

redis.on('error', (err) => {
    Logger.error(`Redis cache error: ${err.message}`);
});

redis.on('connect', () => {
    Logger.info('Redis cache connected');
});

export class CacheService {
    /**
     * Get cached value
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await redis.get(key);
            if (!value) return null;

            return JSON.parse(value) as T;
        } catch (error: any) {
            Logger.error(`Cache get error for key ${key}: ${error.message}`);
            return null;
        }
    }

    /**
     * Set cached value with TTL
     */
    async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
        try {
            await redis.setex(key, ttlSeconds, JSON.stringify(value));
        } catch (error: any) {
            Logger.error(`Cache set error for key ${key}: ${error.message}`);
        }
    }

    /**
     * Delete cached value
     */
    async delete(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (error: any) {
            Logger.error(`Cache delete error for key ${key}: ${error.message}`);
        }
    }

    /**
     * Delete multiple keys by pattern
     */
    async deletePattern(pattern: string): Promise<void> {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
                Logger.info(`Deleted ${keys.length} cache keys matching pattern: ${pattern}`);
            }
        } catch (error: any) {
            Logger.error(`Cache delete pattern error for ${pattern}: ${error.message}`);
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error: any) {
            Logger.error(`Cache exists error for key ${key}: ${error.message}`);
            return false;
        }
    }

    /**
     * Get or set pattern: Try cache first, fallback to callback
     */
    async getOrSet<T>(
        key: string,
        callback: () => Promise<T>,
        ttlSeconds: number = 3600
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key);
        if (cached !== null) {
            Logger.debug(`Cache hit for key: ${key}`);
            return cached;
        }

        // Cache miss - fetch from source
        Logger.debug(`Cache miss for key: ${key}`);
        const value = await callback();

        // Store in cache
        await this.set(key, value, ttlSeconds);

        return value;
    }
}

export const cacheService = new CacheService();
