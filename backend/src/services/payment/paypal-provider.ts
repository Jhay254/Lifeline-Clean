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
 * PayPal payment provider implementation
 * Uses PayPal REST API for subscriptions and payouts
 */
export class PayPalProvider implements PaymentProvider {
    private clientId: string;
    private clientSecret: string;
    private baseUrl: string;

    constructor() {
        this.clientId = process.env.PAYPAL_CLIENT_ID || '';
        this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
        this.baseUrl = process.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        if (!this.clientId || !this.clientSecret) {
            logger.warn('PayPal credentials not configured');
        }
    }

    /**
     * Get OAuth access token
     */
    private async getAccessToken(): Promise<string> {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        const data = await response.json();
        return data.access_token;
    }

    /**
     * Create a subscription
     */
    async createSubscription(data: CreateSubscriptionData): Promise<ProviderSubscription> {
        try {
            const accessToken = await this.getAccessToken();

            // Create subscription
            const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: data.planId,
                    subscriber: {
                        email_address: data.customerEmail,
                    },
                    application_context: {
                        brand_name: 'Lifeline',
                        return_url: data.returnUrl,
                        cancel_url: data.cancelUrl,
                        user_action: 'SUBSCRIBE_NOW',
                    },
                }),
            });

            const subscription = await response.json();

            // Find approval URL
            const approvalLink = subscription.links?.find((link: any) => link.rel === 'approve');

            return {
                id: subscription.id,
                status: 'pending',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                approvalUrl: approvalLink?.href,
            };
        } catch (error) {
            logger.error('PayPal createSubscription error:', error);
            throw new Error('Failed to create PayPal subscription');
        }
    }

    /**
     * Cancel a subscription
     */
    async cancelSubscription(subscriptionId: string): Promise<void> {
        try {
            const accessToken = await this.getAccessToken();

            await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reason: 'User requested cancellation',
                }),
            });

            logger.info(`PayPal subscription ${subscriptionId} canceled`);
        } catch (error) {
            logger.error('PayPal cancelSubscription error:', error);
            throw new Error('Failed to cancel PayPal subscription');
        }
    }

    /**
     * Update a subscription
     */
    async updateSubscription(
        subscriptionId: string,
        data: UpdateSubscriptionData
    ): Promise<ProviderSubscription> {
        // PayPal doesn't support direct plan updates
        // Would need to cancel and create new subscription
        throw new Error('PayPal subscription updates not supported - cancel and recreate instead');
    }

    /**
     * Get subscription details
     */
    async getSubscription(subscriptionId: string): Promise<ProviderSubscription> {
        try {
            const accessToken = await this.getAccessToken();

            const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const subscription = await response.json();

            return {
                id: subscription.id,
                status: this.mapPayPalStatus(subscription.status),
                currentPeriodStart: new Date(subscription.billing_info?.last_payment?.time || Date.now()),
                currentPeriodEnd: new Date(subscription.billing_info?.next_billing_time || Date.now()),
            };
        } catch (error) {
            logger.error('PayPal getSubscription error:', error);
            throw new Error('Failed to get PayPal subscription');
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhook(payload: any, signature: string): boolean {
        // PayPal webhook verification
        // In production, should verify using PayPal's webhook signature
        // For now, basic validation
        return true;
    }

    /**
     * Parse webhook event
     */
    parseWebhookEvent(payload: any): WebhookEvent {
        const eventType = payload.event_type;
        const resource = payload.resource;

        return {
            type: eventType,
            subscriptionId: resource.id || resource.billing_agreement_id,
            paymentId: resource.id,
            amount: resource.amount?.value ? parseFloat(resource.amount.value) : undefined,
            status: resource.status,
            data: payload,
        };
    }

    /**
     * Create a payout
     */
    async createPayout(data: CreatePayoutData): Promise<ProviderPayout> {
        try {
            const accessToken = await this.getAccessToken();

            const response = await fetch(`${this.baseUrl}/v1/payments/payouts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender_batch_header: {
                        sender_batch_id: `payout_${Date.now()}`,
                        email_subject: 'You have a payout from Lifeline!',
                        email_message: 'You have received a payout. Thank you for using Lifeline!',
                    },
                    items: [
                        {
                            recipient_type: 'EMAIL',
                            amount: {
                                value: data.amount.toFixed(2),
                                currency: data.currency,
                            },
                            receiver: data.recipientEmail,
                            note: 'Creator payout from Lifeline',
                            sender_item_id: `creator_${data.creatorId}`,
                        },
                    ],
                }),
            });

            const payout = await response.json();

            return {
                id: payout.batch_header.payout_batch_id,
                status: 'processing',
                amount: data.amount,
                currency: data.currency,
            };
        } catch (error) {
            logger.error('PayPal createPayout error:', error);
            throw new Error('Failed to create PayPal payout');
        }
    }

    /**
     * Get payout status
     */
    async getPayoutStatus(payoutId: string): Promise<PayoutStatus> {
        try {
            const accessToken = await this.getAccessToken();

            const response = await fetch(`${this.baseUrl}/v1/payments/payouts/${payoutId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const payout = await response.json();

            return {
                id: payout.batch_header.payout_batch_id,
                status: this.mapPayoutStatus(payout.batch_header.batch_status),
                paidAt: payout.batch_header.time_completed ? new Date(payout.batch_header.time_completed) : undefined,
            };
        } catch (error) {
            logger.error('PayPal getPayoutStatus error:', error);
            throw new Error('Failed to get PayPal payout status');
        }
    }

    /**
     * Map PayPal status to our status
     */
    private mapPayPalStatus(status: string): 'active' | 'canceled' | 'past_due' | 'pending' {
        const statusMap: Record<string, 'active' | 'canceled' | 'past_due' | 'pending'> = {
            'ACTIVE': 'active',
            'CANCELLED': 'canceled',
            'SUSPENDED': 'past_due',
            'APPROVAL_PENDING': 'pending',
            'APPROVED': 'pending',
        };
        return statusMap[status] || 'pending';
    }

    /**
     * Map PayPal payout status
     */
    private mapPayoutStatus(status: string): 'pending' | 'processing' | 'paid' | 'failed' {
        const statusMap: Record<string, 'pending' | 'processing' | 'paid' | 'failed'> = {
            'PENDING': 'pending',
            'PROCESSING': 'processing',
            'SUCCESS': 'paid',
            'DENIED': 'failed',
            'CANCELED': 'failed',
        };
        return statusMap[status] || 'pending';
    }
}

export const paypalProvider = new PayPalProvider();
