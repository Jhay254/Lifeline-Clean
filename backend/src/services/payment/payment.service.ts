import { PaymentProvider } from './payment-provider.interface';
import { paypalProvider } from './paypal-provider';
import { stripeProvider } from './stripe-provider';
import { logger } from '../../utils/logger';

/**
 * Payment service factory
 * Provides access to payment providers
 */
export class PaymentService {
    private provider: PaymentProvider;
    private providerType: 'paypal' | 'stripe';

    constructor(providerType: 'paypal' | 'stripe' = 'paypal') {
        this.providerType = providerType;
        this.provider = this.getProvider(providerType);
        logger.info(`PaymentService initialized with ${providerType} provider`);
    }

    /**
     * Get provider instance
     */
    private getProvider(type: 'paypal' | 'stripe'): PaymentProvider {
        switch (type) {
            case 'paypal':
                return paypalProvider;
            case 'stripe':
                return stripeProvider;
            default:
                throw new Error(`Unknown payment provider: ${type}`);
        }
    }

    /**
     * Get the current provider
     */
    getProviderInstance(): PaymentProvider {
        return this.provider;
    }

    /**
     * Get the provider type
     */
    getProviderType(): 'paypal' | 'stripe' {
        return this.providerType;
    }

    /**
     * Switch provider (useful for testing or multi-provider support)
     */
    switchProvider(providerType: 'paypal' | 'stripe'): void {
        this.providerType = providerType;
        this.provider = this.getProvider(providerType);
        logger.info(`Switched to ${providerType} provider`);
    }
}

// Default instance using PayPal (MVP)
export const paymentService = new PaymentService('paypal');
