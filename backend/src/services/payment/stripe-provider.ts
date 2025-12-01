import {
    PaymentProvider,
    CreateSubscriptionData,
    UpdateSubscriptionData,
    ProviderSubscription,
    WebhookEvent,
    CreatePayoutData,
    ProviderPayout,
    PayoutStatus,
} from './payment-provider.interface';
import { logger } from '../../utils/logger';

/**
 * Stripe payment provider implementation (PLACEHOLDER)
 * Will be activated when Stripe credentials are available
 */
export class StripeProvider implements PaymentProvider {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.STRIPE_SECRET_KEY || 'placeholder';

        if (this.apiKey === 'placeholder') {
            logger.warn('Stripe credentials not configured - provider is in placeholder mode');
        }
    }

    async createSubscription(data: CreateSubscriptionData): Promise<ProviderSubscription> {
        throw new Error('Stripe credentials not configured. Please add STRIPE_SECRET_KEY to environment variables.');
    }

    async cancelSubscription(subscriptionId: string): Promise<void> {
        throw new Error('Stripe credentials not configured. Please add STRIPE_SECRET_KEY to environment variables.');
    }

    async updateSubscription(
        subscriptionId: string,
        data: UpdateSubscriptionData
    ): Promise<ProviderSubscription> {
        throw new Error('Stripe credentials not configured. Please add STRIPE_SECRET_KEY to environment variables.');
    }

    async getSubscription(subscriptionId: string): Promise<ProviderSubscription> {
        throw new Error('Stripe credentials not configured. Please add STRIPE_SECRET_KEY to environment variables.');
    }

    verifyWebhook(payload: any, signature: string): boolean {
        throw new Error('Stripe credentials not configured. Please add STRIPE_SECRET_KEY to environment variables.');
    }

    parseWebhookEvent(payload: any): WebhookEvent {
        throw new Error('Stripe credentials not configured. Please add STRIPE_SECRET_KEY to environment variables.');
    }

    async createPayout(data: CreatePayoutData): Promise<ProviderPayout> {
        throw new Error('Stripe credentials not configured. Please add STRIPE_SECRET_KEY to environment variables.');
    }

    async getPayoutStatus(payoutId: string): Promise<PayoutStatus> {
        throw new Error('Stripe credentials not configured. Please add STRIPE_SECRET_KEY to environment variables.');
    }
}

export const stripeProvider = new StripeProvider();
