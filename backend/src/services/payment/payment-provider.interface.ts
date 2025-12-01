/**
 * Payment provider interface for abstraction
 */
export interface PaymentProvider {
    // Subscription management
    createSubscription(data: CreateSubscriptionData): Promise<ProviderSubscription>;
    cancelSubscription(subscriptionId: string): Promise<void>;
    updateSubscription(subscriptionId: string, data: UpdateSubscriptionData): Promise<ProviderSubscription>;
    getSubscription(subscriptionId: string): Promise<ProviderSubscription>;

    // Webhook handling
    verifyWebhook(payload: any, signature: string): boolean;
    parseWebhookEvent(payload: any): WebhookEvent;

    // Payout management
    createPayout(data: CreatePayoutData): Promise<ProviderPayout>;
    getPayoutStatus(payoutId: string): Promise<PayoutStatus>;
}

/**
 * Data for creating a subscription
 */
export interface CreateSubscriptionData {
    customerId: string;
    customerEmail: string;
    planId: string;
    planName: string;
    planPrice: number;
    returnUrl: string;
    cancelUrl: string;
}

/**
 * Data for updating a subscription
 */
export interface UpdateSubscriptionData {
    planId?: string;
    status?: 'active' | 'canceled';
}

/**
 * Provider subscription response
 */
export interface ProviderSubscription {
    id: string;
    status: 'active' | 'canceled' | 'past_due' | 'pending';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    approvalUrl?: string; // For PayPal - user needs to approve
    customerId?: string;
}

/**
 * Webhook event from provider
 */
export interface WebhookEvent {
    type: string;
    subscriptionId: string;
    paymentId?: string;
    amount?: number;
    status?: string;
    data: any;
}

/**
 * Data for creating a payout
 */
export interface CreatePayoutData {
    creatorId: string;
    amount: number;
    currency: string;
    recipientEmail?: string;
    recipientId?: string;
}

/**
 * Provider payout response
 */
export interface ProviderPayout {
    id: string;
    status: 'pending' | 'processing' | 'paid' | 'failed';
    amount: number;
    currency: string;
}

/**
 * Payout status
 */
export interface PayoutStatus {
    id: string;
    status: 'pending' | 'processing' | 'paid' | 'failed';
    paidAt?: Date;
    failureReason?: string;
}
