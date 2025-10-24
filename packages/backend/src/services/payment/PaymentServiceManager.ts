import { BasePaymentService } from './BasePaymentService';
import { IyzicoPaymentService } from './IyzicoPaymentService';
import { PayTRPaymentService } from './PayTRPaymentService';
import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentWebhook,
  InstallmentInfo,
  PaymentServiceConfig,
  IyzicoConfig,
  PayTRConfig,
  PaymentServiceResult,
  PaymentError,
  ServicePaymentProvider,
} from '@cargolink/shared/src/types/payment-service.types';
import logger, { paymentLogger } from '../../utils/logger';
import { PaymentServiceMetrics } from './BasePaymentService';

/**
 * Payment Service Manager
 * Manages multiple payment providers and routes requests to appropriate services
 */
export class PaymentServiceManager {
  private readonly services: Map<ServicePaymentProvider, BasePaymentService> = new Map();
  private readonly configs: Map<ServicePaymentProvider, PaymentServiceConfig> = new Map();
  private readonly metrics: Map<ServicePaymentProvider, PaymentServiceMetrics> = new Map();
  private readonly logger = paymentLogger.child({ component: 'PaymentServiceManager' });

  constructor(configs: PaymentServiceConfig[]) {
    this.initializeServices(configs);
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize payment services from configurations
   */
  private initializeServices(configs: PaymentServiceConfig[]): void {
    this.logger.info('Initializing payment services', { 
      providers: configs.map(c => c.provider),
      count: configs.length 
    });

    for (const config of configs) {
      try {
        const service = this.createPaymentService(config);
        if (service) {
          this.services.set(config.provider, service);
          this.configs.set(config.provider, config);
          this.initializeMetrics(config.provider);
          
          this.logger.info(`Payment service initialized`, {
            provider: config.provider,
            enabled: config.enabled,
            sandbox: config.sandbox
          });
        }
      } catch (error) {
        this.logger.error(`Failed to initialize payment service`, {
          provider: config.provider,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    this.logger.info('Payment services initialization complete', {
      totalServices: this.services.size,
      enabledServices: Array.from(this.services.values()).filter(s => s.isEnabled()).length
    });
  }

  /**
   * Create payment service instance based on provider
   */
  private createPaymentService(config: PaymentServiceConfig): BasePaymentService | null {
    switch (config.provider) {
      case ServicePaymentProvider.IYZICO:
        return new IyzicoPaymentService(config as IyzicoConfig);
      
      case ServicePaymentProvider.PAYTR:
        return new PayTRPaymentService(config as PayTRConfig);
      
      case ServicePaymentProvider.STRIPE:
        // TODO: Implement Stripe service
        this.logger.warn('Stripe payment service not implemented yet');
        return null;
      
      case ServicePaymentProvider.PAYPAL:
        // TODO: Implement PayPal service
        this.logger.warn('PayPal payment service not implemented yet');
        return null;
      
      default:
        this.logger.error('Unknown payment provider', { provider: config.provider });
        return null;
    }
  }

  /**
   * Initialize metrics for a provider
   */
  private initializeMetrics(provider: ServicePaymentProvider): void {
    this.metrics.set(provider, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      errorRate: 0
    });
  }

  // =============================================================================
  // PAYMENT OPERATIONS
  // =============================================================================

  /**
   * Initialize payment with specified or optimal provider
   */
  async initializePayment(
    request: PaymentRequest,
    preferredProvider?: ServicePaymentProvider
  ): Promise<PaymentServiceResult<PaymentResponse>> {
    const startTime = Date.now();
    
    try {
      const provider = preferredProvider || this.selectOptimalProvider(request);
      const service = this.getService(provider);

      if (!service) {
        return {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `Payment service ${provider} is not available`,
            retryable: true
          }
        };
      }

      this.logger.info('Initializing payment', {
        provider,
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency
      });

      const result = await service.initializePayment(request);
      
      this.updateMetrics(provider, result.success, Date.now() - startTime);
      
      if (result.success) {
        this.logger.info('Payment initialization successful', {
          provider,
          orderId: request.orderId,
          paymentId: result.data.paymentId
        });
      } else {
        this.logger.warn('Payment initialization failed', {
          provider,
          orderId: request.orderId,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Payment initialization error', {
        orderId: request.orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });

      return {
        success: false,
        error: {
          code: 'PAYMENT_INITIALIZATION_ERROR',
          message: 'Failed to initialize payment',
          details: error,
          retryable: true
        }
      };
    }
  }

  /**
   * Verify payment with appropriate provider
   */
  async verifyPayment(
    paymentId: string,
    provider: ServicePaymentProvider,
    verificationData: Record<string, any>
  ): Promise<PaymentServiceResult<PaymentResponse>> {
    const startTime = Date.now();
    
    try {
      const service = this.getService(provider);

      if (!service) {
        return {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `Payment service ${provider} is not available`,
            retryable: true
          }
        };
      }

      this.logger.info('Verifying payment', {
        provider,
        paymentId
      });

      const result = await service.verifyPayment(paymentId, verificationData);
      
      this.updateMetrics(provider, result.success, Date.now() - startTime);
      
      if (result.success) {
        this.logger.info('Payment verification successful', {
          provider,
          paymentId,
          status: result.data.status
        });
      } else {
        this.logger.warn('Payment verification failed', {
          provider,
          paymentId,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Payment verification error', {
        paymentId,
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });

      return {
        success: false,
        error: {
          code: 'PAYMENT_VERIFICATION_ERROR',
          message: 'Failed to verify payment',
          details: error,
          retryable: true
        }
      };
    }
  }

  /**
   * Get payment status from provider
   */
  async getPaymentStatus(
    paymentId: string,
    provider: ServicePaymentProvider
  ): Promise<PaymentServiceResult<PaymentResponse>> {
    const service = this.getService(provider);

    if (!service) {
      return {
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: `Payment service ${provider} is not available`,
          retryable: true
        }
      };
    }

    return service.getPaymentStatus(paymentId);
  }

  /**
   * Process refund with appropriate provider
   */
  async refundPayment(
    request: RefundRequest,
    provider: ServicePaymentProvider
  ): Promise<PaymentServiceResult<RefundResponse>> {
    const startTime = Date.now();
    
    try {
      const service = this.getService(provider);

      if (!service) {
        return {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `Payment service ${provider} is not available`,
            retryable: true
          }
        };
      }

      this.logger.info('Processing refund', {
        provider,
        paymentId: request.paymentId,
        amount: request.amount
      });

      const result = await service.refundPayment(request);
      
      this.updateMetrics(provider, result.success, Date.now() - startTime);
      
      if (result.success) {
        this.logger.info('Refund processing successful', {
          provider,
          paymentId: request.paymentId,
          refundId: result.data.refundId
        });
      } else {
        this.logger.warn('Refund processing failed', {
          provider,
          paymentId: request.paymentId,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Refund processing error', {
        paymentId: request.paymentId,
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });

      return {
        success: false,
        error: {
          code: 'REFUND_PROCESSING_ERROR',
          message: 'Failed to process refund',
          details: error,
          retryable: true
        }
      };
    }
  }

  /**
   * Process webhook from any provider
   */
  async processWebhook(
    provider: ServicePaymentProvider,
    headers: Record<string, string>,
    body: any
  ): Promise<PaymentServiceResult<PaymentWebhook>> {
    try {
      const service = this.getService(provider);

      if (!service) {
        return {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `Payment service ${provider} is not available`,
            retryable: false
          }
        };
      }

      this.logger.info('Processing webhook', { provider });

      const result = await service.processWebhook(headers, body);
      
      if (result.success) {
        this.logger.info('Webhook processed successfully', {
          provider,
          eventType: result.data.eventType,
          paymentId: result.data.paymentId
        });
      } else {
        this.logger.warn('Webhook processing failed', {
          provider,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      this.logger.error('Webhook processing error', {
        provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: {
          code: 'WEBHOOK_PROCESSING_ERROR',
          message: 'Failed to process webhook',
          details: error,
          retryable: false
        }
      };
    }
  }

  /**
   * Get installment options from provider
   */
  async getInstallmentOptions(
    amount: number,
    currency: string,
    provider?: ServicePaymentProvider,
    cardBin?: string
  ): Promise<PaymentServiceResult<InstallmentInfo[]>> {
    const targetProvider = provider || ServicePaymentProvider.IYZICO; // Default to İyzico for installments
    const service = this.getService(targetProvider);

    if (!service) {
      return {
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: `Payment service ${targetProvider} is not available`,
          retryable: true
        }
      };
    }

    return service.getInstallmentOptions(amount, currency, cardBin);
  }

  // =============================================================================
  // PROVIDER SELECTION & MANAGEMENT
  // =============================================================================

  /**
   * Select optimal payment provider based on request
   */
  private selectOptimalProvider(request: PaymentRequest): ServicePaymentProvider {
    const availableServices = Array.from(this.services.entries())
      .filter(([, service]) => service.isEnabled())
      .map(([provider]) => provider);

    if (availableServices.length === 0) {
      throw new Error('No payment services available');
    }

    // Selection criteria (can be enhanced with more sophisticated logic):
    // 1. Currency support
    // 2. Amount limits
    // 3. Service performance metrics
    // 4. Current load

    for (const provider of availableServices) {
      const service = this.services.get(provider)!;
      const config = this.configs.get(provider)!;

      // Check currency support
      if (!service.supportsCurrency(request.currency)) {
        continue;
      }

      // Check amount limits
      const amountValidation = service.validateAmount(request.amount);
      if (!amountValidation.success) {
        continue;
      }

      // This provider is suitable
      return provider;
    }

    // Fallback to first available service
    if (availableServices.length === 0) {
      throw new Error('No suitable payment service found');
    }
    return availableServices[0]!; // Non-null assertion since we checked length above
  }

  /**
   * Get service instance for provider
   */
  private getService(provider: ServicePaymentProvider): BasePaymentService | undefined {
    const service = this.services.get(provider);
    
    if (!service || !service.isEnabled()) {
      this.logger.warn('Payment service not available', { 
        provider, 
        exists: !!service, 
        enabled: service?.isEnabled() 
      });
      return undefined;
    }

    return service;
  }

  /**
   * Update metrics for provider
   */
  private updateMetrics(provider: ServicePaymentProvider, success: boolean, responseTime: number): void {
    const metrics = this.metrics.get(provider);
    if (!metrics) return;

    metrics.totalRequests++;
    metrics.lastRequestTime = new Date().toISOString();

    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }

    // Update average response time
    metrics.averageResponseTime = 
      (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;

    // Update error rate
    metrics.errorRate = metrics.failedRequests / metrics.totalRequests;

    this.metrics.set(provider, metrics);
  }

  // =============================================================================
  // HEALTH CHECK & MONITORING
  // =============================================================================

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<Record<ServicePaymentProvider, PaymentServiceResult<{ status: string; responseTime: number }>>> {
    const results: Record<string, any> = {};
    
    const healthCheckPromises = Array.from(this.services.entries()).map(async ([provider, service]) => {
      try {
        const result = await service.healthCheck();
        results[provider] = result;
      } catch (error) {
        results[provider] = {
          success: false,
          error: {
            code: 'HEALTH_CHECK_FAILED',
            message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            retryable: true
          }
        };
      }
    });

    await Promise.allSettled(healthCheckPromises);
    
    this.logger.info('Health check completed', {
      results: Object.keys(results).reduce((acc, key) => {
        acc[key] = results[key].success ? 'healthy' : 'unhealthy';
        return acc;
      }, {} as Record<string, string>)
    });

    return results;
  }

  /**
   * Get metrics for all providers
   */
  getMetrics(): Record<ServicePaymentProvider, PaymentServiceMetrics> {
    const result: Record<string, any> = {};
    
    for (const [provider, metrics] of this.metrics.entries()) {
      result[provider] = { ...metrics };
    }
    
    return result;
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): ServicePaymentProvider[] {
    return Array.from(this.services.keys()).filter(provider => {
      const service = this.services.get(provider);
      return service?.isEnabled();
    });
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: ServicePaymentProvider): PaymentServiceConfig | undefined {
    return this.configs.get(provider);
  }

  /**
   * Enable/disable provider
   */
  setProviderStatus(provider: ServicePaymentProvider, enabled: boolean): boolean {
    const config = this.configs.get(provider);
    if (config) {
      config.enabled = enabled;
      this.logger.info(`Provider ${enabled ? 'enabled' : 'disabled'}`, { provider });
      return true;
    }
    return false;
  }
}