import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription/subscription.service';
import { logger } from '../utils/logger';

/**
 * Extended request with user information
 */
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

/**
 * Paywall middleware - protects content behind subscription
 */
export const paywallMiddleware = (requiredTier: 'bronze' | 'gold') => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { creatorId } = req.params;
            const userId = req.user?.id;

            // Check if user is authenticated
            if (!userId) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Please log in to access this content',
                });
            }

            // Check if user is the creator (creators have full access to their own content)
            if (userId === creatorId) {
                return next();
            }

            // Check if user has required subscription
            const hasAccess = await subscriptionService.checkAccess(
                userId,
                creatorId,
                requiredTier
            );

            if (!hasAccess) {
                return res.status(403).json({
                    error: 'Subscription required',
                    message: `This content requires a ${requiredTier} subscription or higher`,
                    requiredTier,
                    upgradeUrl: `/subscribe/${creatorId}`,
                });
            }

            // User has access, proceed
            next();
        } catch (error: any) {
            logger.error('Paywall middleware error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to verify access',
            });
        }
    };
};

/**
 * Optional paywall - allows access but includes subscription info
 */
export const optionalPaywallMiddleware = (requiredTier: 'bronze' | 'gold') => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { creatorId } = req.params;
            const userId = req.user?.id;

            if (!userId || userId === creatorId) {
                return next();
            }

            const hasAccess = await subscriptionService.checkAccess(
                userId,
                creatorId,
                requiredTier
            );

            // Add access info to request
            (req as any).hasSubscription = hasAccess;
            (req as any).requiredTier = requiredTier;

            next();
        } catch (error: any) {
            logger.error('Optional paywall middleware error:', error);
            next();
        }
    };
};
