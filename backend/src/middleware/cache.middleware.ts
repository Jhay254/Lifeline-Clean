import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import Logger from '../utils/logger';

/**
 * Cache middleware factory
 * @param ttlSeconds - Time to live in seconds (default: 5 minutes)
 */
export const cacheMiddleware = (ttlSeconds: number = 300) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key from URL and query params
        const cacheKey = `cache:${req.originalUrl || req.url}`;

        try {
            // Try to get from cache
            const cachedResponse = await cacheService.get<any>(cacheKey);

            if (cachedResponse) {
                Logger.debug(`Serving cached response for: ${cacheKey}`);
                return res.json(cachedResponse);
            }

            // Cache miss - intercept response
            const originalJson = res.json.bind(res);

            res.json = function (body: any) {
                // Store in cache
                cacheService.set(cacheKey, body, ttlSeconds).catch(err => {
                    Logger.error(`Failed to cache response: ${err.message}`);
                });

                // Send response
                return originalJson(body);
            };

            next();
        } catch (error: any) {
            Logger.error(`Cache middleware error: ${error.message}`);
            next();
        }
    };
};

/**
 * Invalidate cache by pattern
 */
export const invalidateCache = (pattern: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await cacheService.deletePattern(pattern);
            next();
        } catch (error: any) {
            Logger.error(`Cache invalidation error: ${error.message}`);
            next();
        }
    };
};
