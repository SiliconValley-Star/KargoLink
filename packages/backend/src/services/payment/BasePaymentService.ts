import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentWebhook,
  InstallmentInfo,
  PaymentServiceConfig,
  PaymentServiceResult,
  PaymentError,
  ServicePaymentProvider,
  ServicePaymentStatus
} from '@cargolink/shared/src/types/payment-service.types';
import logger, { paymentLogger } from '../../utils/logger';
/**
 * Base abstract class for all payment service implementations
 * Provides common functionality and enforces interface consistency
 */
export abstract class BasePaymentService {
  protected readonly config: PaymentServiceConfig;
  protected readonly logger: typeof logger;
  protected readonly provider: ServicePaymentProvider;

  constructor(config: PaymentServiceConfig) {
    this.config = config;
    this.provider = config.provider;
    this.logger = paymentLogger.child({ provider: this.provider });
  }

  // =============================================================================
  // ABSTRACT METHODS - Must be implemented by each provider
  // =============================================================================

  /**
   * Initialize payment request and get payment URL or form
   */
  abstract initializePayment(request: PaymentRequest): Promise<PaymentServiceResult<PaymentResponse>>;

  /**
   * Verify and complete payment after user returns from payment gateway
   */
  abstract verifyPayment(
    paymentId: string, 
    verificationData: Record<string, any>
  ): Promise<PaymentServiceResult<PaymentResponse>>;

  /**
   * Check payment status from provider
   */
  abstract getPaymentStatus(paymentId: string): Promise<PaymentServiceResult<PaymentResponse>>;

  /**
   * Process refund request
   */
  abstract refundPayment(request: RefundRequest): Promise<PaymentServiceResult<RefundResponse>>;

  /**
   * Validate and process incoming webhook
   */
  abstract processWebhook(
    headers: Record<string, string>,
    body: any
  ): Promise<PaymentServiceResult<PaymentWebhook>>;

  /**
   * Get available installment options for given amount and card info
   */
  abstract getInstallmentOptions(
    amount: number,
    currency: string,
    cardBin?: string
  ): Promise<PaymentServiceResult<InstallmentInfo[]>>;

  // =============================================================================
  // CONCRETE METHODS - Shared functionality
  // =============================================================================

  /**
   * Get provider configuration
   */
  public getConfig(): PaymentServiceConfig {
    return { ...this.config };
  }

  /**
   * Get provider name
   */
  public getProvider(): ServicePaymentProvider {
    return this.provider;
  }

  /**
   * Check if provider is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Check if provider supports given currency
   */
  public supportsCurrency(currency: string): boolean {
    return this.config.supportedCurrencies.some(c => c === currency);
  }

  /**
   * Check if provider supports given payment method
   */
  public supportsPaymentMethod(method: string): boolean {
    return this.config.supportedPaymentMethods.some(m => m === method);
  }

  /**
   * Validate payment amount against provider limits
   */
  public validateAmount(amount: number): PaymentServiceResult<boolean> {
    if (amount < this.config.minAmount) {
      return {
        success: false,
        error: {
          code: 'AMOUNT_TOO_LOW',
          message: `Minimum payment amount is ${this.config.minAmount}`,
          details: { minAmount: this.config.minAmount, providedAmount: amount },
          retryable: false
        }
      };
    }

    if (amount > this.config.maxAmount) {
      return {
        success: false,
        error: {
          code: 'AMOUNT_TOO_HIGH',
          message: `Maximum payment amount is ${this.config.maxAmount}`,
          details: { maxAmount: this.config.maxAmount, providedAmount: amount },
          retryable: false
        }
      };
    }

    return { success: true, data: true };
  }

  /**
   * Calculate platform commission for given amount
   */
  public calculateCommission(amount: number): number {
    const commission = amount * this.config.commissionRate;
    return Math.round(commission * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Generate unique transaction ID
   */
  protected generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${this.provider}_${timestamp}_${random}`;
  }

  /**
   * Log payment operation
   */
  protected logPaymentOperation(
    operation: string, 
    paymentId: string, 
    data?: any,
    error?: any
  ): void {
    const logData = {
      operation,
      paymentId,
      provider: this.provider,
      timestamp: new Date().toISOString(),
      ...data
    };

    if (error) {
      this.logger.error(`Payment ${operation} failed`, { ...logData, error });
    } else {
      this.logger.info(`Payment ${operation} completed`, logData);
    }
  }

  /**
   * Handle API errors and convert to standard format
   */
  protected handleApiError(error: any, operation: string): PaymentError {
    this.logger.error(`Payment API error in ${operation}`, error);

    // Default error structure
    const paymentError: PaymentError = {
      code: 'API_ERROR',
      message: 'Payment service temporarily unavailable',
      retryable: true
    };

    // Provider-specific error handling should be implemented in subclasses
    if (error.response) {
      paymentError.code = error.response.status?.toString() || 'HTTP_ERROR';
      paymentError.message = error.response.data?.message || error.message || 'HTTP request failed';
      paymentError.details = error.response.data;
      paymentError.retryable = error.response.status >= 500;
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      paymentError.code = 'CONNECTION_ERROR';
      paymentError.message = 'Unable to connect to payment provider';
      paymentError.retryable = true;
    } else {
      paymentError.message = error.message || 'Unknown payment error';
      paymentError.details = error;
    }

    return paymentError;
  }

  /**
   * Validate webhook signature (to be implemented by providers)
   */
  protected abstract validateWebhookSignature(
    headers: Record<string, string>,
    body: any
  ): boolean;

  /**
   * Create standard payment response
   */
  protected createPaymentResponse(
    paymentId: string,
    orderId: string,
    status: ServicePaymentStatus,
    amount: number,
    currency: string,
    additionalData?: Partial<PaymentResponse>
  ): PaymentResponse {
    return {
      success: status === ServicePaymentStatus.SUCCESS,
      provider: this.provider,
      paymentId,
      orderId,
      status,
      amount,
      currency: currency as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...additionalData
    };
  }

  /**
   * Sanitize sensitive data for logging
   */
  protected sanitizeForLog(data: any): any {
    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'cardNumber', 'cvc', 'cvv', 'password', 'token', 'apiKey', 'secretKey',
      'cardHolderName', 'expiryMonth', 'expiryYear'
    ];

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const result: any = Array.isArray(obj) ? [] : {};
      
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '***REDACTED***';
        } else if (typeof obj[key] === 'object') {
          result[key] = sanitizeObject(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
      
      return result;
    };

    return sanitizeObject(sanitized);
  }

  /**
   * Rate limiting check (basic implementation)
   */
  protected async checkRateLimit(identifier: string): Promise<boolean> {
    // Basic rate limiting - should be implemented with Redis in production
    // For now, just return true (no rate limiting)
    return true;
  }

  /**
   * Health check for payment provider
   */
  public async healthCheck(): Promise<PaymentServiceResult<{ status: string; responseTime: number }>> {
    const startTime = Date.now();
    
    try {
      // Implement provider-specific health check
      await this.performHealthCheck();
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        data: {
          status: 'healthy',
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: { responseTime },
          retryable: true
        }
      };
    }
  }

  /**
   * Provider-specific health check implementation
   */
  protected abstract performHealthCheck(): Promise<void>;
}

/**
 * Payment service factory interface
 */
export interface PaymentServiceFactory {
  createPaymentService(config: PaymentServiceConfig): BasePaymentService;
  getSupportedProviders(): ServicePaymentProvider[];
}

/**
 * Payment service metrics interface
 */
export interface PaymentServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime?: string;
  errorRate: number;
}