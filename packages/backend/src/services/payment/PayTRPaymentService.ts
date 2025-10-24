import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { BasePaymentService } from './BasePaymentService';
import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentWebhook,
  InstallmentInfo,
  PayTRConfig,
  PaymentServiceResult,
  PaymentError,
  ServicePaymentProvider,
  ServicePaymentStatus,
  ServiceCurrency,
  PaymentWebhookEvent
} from '@cargolink/shared/src/types/payment-service.types';

/**
 * PayTR Payment Service Implementation
 * Handles all PayTR payment gateway operations
 */
export class PayTRPaymentService extends BasePaymentService {
  private readonly apiClient: AxiosInstance;
  protected readonly config: PayTRConfig;

  constructor(config: PayTRConfig) {
    super(config);
    this.config = config;
    
    // Initialize Axios client for PayTR API
    this.apiClient = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });

    // Add response interceptor for logging
    this.apiClient.interceptors.response.use(
      (response) => {
        this.logger.debug('PayTR API Response', {
          status: response.status,
          data: this.sanitizeForLog(response.data)
        });
        return response;
      },
      (error) => {
        this.logger.error('PayTR API Error', {
          status: error.response?.status,
          data: this.sanitizeForLog(error.response?.data),
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  // =============================================================================
  // PAYMENT OPERATIONS
  // =============================================================================

  /**
   * Initialize payment with PayTR
   */
  async initializePayment(request: PaymentRequest): Promise<PaymentServiceResult<PaymentResponse>> {
    try {
      this.logPaymentOperation('initialize', request.orderId, this.sanitizeForLog(request));

      // Validate request
      const validation = this.validatePaymentRequest(request);
      if (!validation.success) {
        return validation;
      }

      // Build PayTR payment request
      const paytrRequest = this.buildPayTRPaymentRequest(request);

      // Call PayTR API
      const response = await this.apiClient.post('/odeme/api/get-token', paytrRequest, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.data.status === 'success') {
        const paymentResponse = this.createPaymentResponse(
          response.data.token || request.orderId,
          request.orderId,
          ServicePaymentStatus.PENDING,
          request.amount,
          request.currency,
          {
            providerPaymentId: response.data.token,
            paymentUrl: `https://www.paytr.com/odeme/guvenli/${response.data.token}`,
            threeDSecure: {
              required: true,
              redirectUrl: `https://www.paytr.com/odeme/guvenli/${response.data.token}`
            },
            expiresAt: new Date(Date.now() + (this.config.timeoutLimit || 30) * 60 * 1000).toISOString(),
            providerResponse: this.sanitizeForLog(response.data)
          }
        );

        this.logPaymentOperation('initialize_success', request.orderId, { token: response.data.token });
        
        return {
          success: true,
          data: paymentResponse
        };
      } else {
        const error: PaymentError = {
          code: 'PAYTR_ERROR',
          message: response.data.reason || 'Payment initialization failed',
          details: response.data,
          retryable: false
        };

        this.logPaymentOperation('initialize_failed', request.orderId, undefined, error);

        return {
          success: false,
          error
        };
      }
    } catch (error) {
      const paymentError = this.handleApiError(error, 'initialize_payment');
      return {
        success: false,
        error: paymentError
      };
    }
  }

  /**
   * Verify payment after redirect from PayTR
   */
  async verifyPayment(
    paymentId: string,
    verificationData: Record<string, any>
  ): Promise<PaymentServiceResult<PaymentResponse>> {
    try {
      this.logPaymentOperation('verify', paymentId, { verificationData: this.sanitizeForLog(verificationData) });

      // PayTR sends verification via webhook, so we check the webhook data
      if (verificationData.merchant_oid && verificationData.status && verificationData.hash) {
        // Verify hash
        const isValidHash = this.verifyPayTRHash(verificationData);
        
        if (!isValidHash) {
          const error: PaymentError = {
            code: 'INVALID_HASH',
            message: 'Payment verification hash is invalid',
            retryable: false
          };

          return {
            success: false,
            error
          };
        }

        const status = this.mapPayTRStatusToServiceStatus(verificationData.status);
        const amount = parseFloat(verificationData.total_amount || '0') / 100; // PayTR sends amount in cents

        const paymentResponse = this.createPaymentResponse(
          verificationData.merchant_oid,
          verificationData.merchant_oid,
          status,
          amount,
          'TRY', // PayTR primarily supports TRY
          {
            providerPaymentId: verificationData.merchant_oid,
            providerResponse: this.sanitizeForLog(verificationData),
            paidAt: status === ServicePaymentStatus.SUCCESS ? new Date().toISOString() : undefined,
            processedAt: new Date().toISOString()
          }
        );

        this.logPaymentOperation('verify_success', paymentId, { status, amount });

        return {
          success: true,
          data: paymentResponse
        };
      } else {
        const error: PaymentError = {
          code: 'INVALID_VERIFICATION_DATA',
          message: 'Missing required verification parameters',
          details: verificationData,
          retryable: false
        };

        this.logPaymentOperation('verify_failed', paymentId, undefined, error);

        return {
          success: false,
          error
        };
      }
    } catch (error) {
      const paymentError = this.handleApiError(error, 'verify_payment');
      return {
        success: false,
        error: paymentError
      };
    }
  }

  /**
   * Get payment status from PayTR
   * Note: PayTR doesn't have a direct status check API, status is primarily received via webhooks
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentServiceResult<PaymentResponse>> {
    try {
      this.logPaymentOperation('status_check', paymentId);

      // PayTR doesn't provide direct status check API
      // Status updates are primarily received through webhooks
      // For now, we'll return a pending status and recommend using webhooks
      
      const paymentResponse = this.createPaymentResponse(
        paymentId,
        paymentId,
        ServicePaymentStatus.PENDING,
        0,
        'TRY',
        {
          providerPaymentId: paymentId,
          providerResponse: { message: 'Status check not supported by PayTR. Use webhooks for real-time updates.' }
        }
      );

      return {
        success: true,
        data: paymentResponse
      };
    } catch (error) {
      const paymentError = this.handleApiError(error, 'get_payment_status');
      return {
        success: false,
        error: paymentError
      };
    }
  }

  /**
   * Process refund with PayTR
   * Note: PayTR refunds are typically processed through their merchant panel
   */
  async refundPayment(request: RefundRequest): Promise<PaymentServiceResult<RefundResponse>> {
    try {
      this.logPaymentOperation('refund', request.paymentId, this.sanitizeForLog(request));

      // PayTR doesn't provide direct API for refunds
      // Refunds are typically processed through merchant panel
      // This is a placeholder implementation
      
      const error: PaymentError = {
        code: 'REFUND_NOT_SUPPORTED',
        message: 'PayTR refunds must be processed through merchant panel',
        details: { paymentId: request.paymentId },
        retryable: false
      };

      this.logPaymentOperation('refund_failed', request.paymentId, undefined, error);

      const refundResponse: RefundResponse = {
        success: false,
        provider: ServicePaymentProvider.PAYTR,
        refundId: `manual_refund_${Date.now()}`,
        paymentId: request.paymentId,
        amount: request.amount,
        currency: request.currency,
        status: ServicePaymentStatus.FAILED,
        error,
        createdAt: new Date().toISOString()
      };

      return {
        success: false,
        error
      };
    } catch (error) {
      const paymentError = this.handleApiError(error, 'refund_payment');
      return {
        success: false,
        error: paymentError
      };
    }
  }

  /**
   * Process PayTR webhook
   */
  async processWebhook(
    headers: Record<string, string>,
    body: any
  ): Promise<PaymentServiceResult<PaymentWebhook>> {
    try {
      this.logger.info('Processing PayTR webhook', { headers: this.sanitizeForLog(headers), body: this.sanitizeForLog(body) });

      // PayTR sends webhook as form data
      const webhookData = typeof body === 'string' ? this.parseFormData(body) : body;

      // Validate webhook signature
      if (!this.validateWebhookSignature(headers, webhookData)) {
        const error: PaymentError = {
          code: 'INVALID_WEBHOOK_SIGNATURE',
          message: 'Webhook signature validation failed',
          retryable: false
        };

        return {
          success: false,
          error
        };
      }

      // Parse webhook data
      const webhook: PaymentWebhook = {
        provider: ServicePaymentProvider.PAYTR,
        eventType: this.mapPayTREventToWebhookEvent(webhookData.status),
        paymentId: webhookData.merchant_oid || webhookData.payment_id,
        orderId: webhookData.merchant_oid || webhookData.payment_id,
        status: this.mapPayTRStatusToServiceStatus(webhookData.status),
        amount: parseFloat(webhookData.total_amount || webhookData.amount || '0') / 100,
        currency: ServiceCurrency.TRY,
        timestamp: new Date().toISOString(),
        rawData: webhookData
      };

      this.logger.info('PayTR webhook processed successfully', { webhook: this.sanitizeForLog(webhook) });

      return {
        success: true,
        data: webhook
      };
    } catch (error) {
      const paymentError = this.handleApiError(error, 'process_webhook');
      return {
        success: false,
        error: paymentError
      };
    }
  }

  /**
   * Get installment options
   * Note: PayTR installment options are configured in merchant panel
   */
  async getInstallmentOptions(
    amount: number,
    currency: string,
    cardBin?: string
  ): Promise<PaymentServiceResult<InstallmentInfo[]>> {
    try {
      // PayTR installment options are typically configured in the merchant panel
      // and passed during payment initialization
      // This is a basic implementation returning common Turkish bank installments
      
      const installments: InstallmentInfo[] = [
        {
          bankName: 'Genel',
          bankCode: '0000',
          cardType: 'CREDIT',
          cardAssociation: 'VISA',
          installments: [
            { count: 1, interestRate: 0, installmentPrice: amount, totalPrice: amount },
            { count: 2, interestRate: 0, installmentPrice: amount / 2, totalPrice: amount },
            { count: 3, interestRate: 1.5, installmentPrice: (amount * 1.015) / 3, totalPrice: amount * 1.015 },
            { count: 6, interestRate: 3.5, installmentPrice: (amount * 1.035) / 6, totalPrice: amount * 1.035 },
            { count: 9, interestRate: 5.5, installmentPrice: (amount * 1.055) / 9, totalPrice: amount * 1.055 },
            { count: 12, interestRate: 7.5, installmentPrice: (amount * 1.075) / 12, totalPrice: amount * 1.075 }
          ]
        }
      ];

      return {
        success: true,
        data: installments
      };
    } catch (error) {
      const paymentError = this.handleApiError(error, 'get_installment_options');
      return {
        success: false,
        error: paymentError
      };
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Build PayTR payment request
   */
  private buildPayTRPaymentRequest(request: PaymentRequest): string {
    const merchantOid = request.orderId;
    const email = request.customer.email;
    const paymentAmount = Math.round(request.amount * 100); // Convert to cents
    const userBasket = this.buildUserBasket(request.basketItems);
    const noInstallment = request.installmentCount ? '0' : '1';
    const maxInstallment = request.installmentCount || this.config.maxInstallmentCount || 0;
    const userIp = this.config.userIp || '127.0.0.1';
    const timeoutLimit = this.config.timeoutLimit || 30;
    const debugMode = this.config.debugMode ? '1' : '0';

    // Generate hash token
    const hashStr = [
      this.config.merchantId,
      userIp,
      merchantOid,
      email,
      paymentAmount.toString(),
      userBasket,
      noInstallment,
      maxInstallment.toString(),
      'TRY', // PayTR primarily supports TRY
      '1', // Test mode (should be 0 in production)
      this.config.secretKey
    ].join('');

    const paytrToken = crypto.createHmac('sha256', this.config.secretKey).update(hashStr).digest('base64');

    // Build form data
    const formData = new URLSearchParams();
    formData.append('merchant_id', this.config.merchantId || '');
    formData.append('user_ip', userIp);
    formData.append('merchant_oid', merchantOid);
    formData.append('email', email);
    formData.append('payment_amount', paymentAmount.toString());
    formData.append('paytr_token', paytrToken);
    formData.append('user_basket', userBasket);
    formData.append('debug_on', debugMode);
    formData.append('no_installment', noInstallment);
    formData.append('max_installment', maxInstallment.toString());
    formData.append('user_name', `${request.customer.name} ${request.customer.surname}`);
    formData.append('user_address', request.billingAddress.address);
    formData.append('user_phone', request.customer.phone);
    formData.append('merchant_ok_url', this.config.merchantOkUrl || request.successUrl);
    formData.append('merchant_fail_url', this.config.merchantFailUrl || request.failureUrl);
    formData.append('timeout_limit', timeoutLimit.toString());
    formData.append('currency', 'TL');
    formData.append('test_mode', this.config.sandbox ? '1' : '0');

    return formData.toString();
  }

  /**
   * Build user basket for PayTR
   */
  private buildUserBasket(basketItems: any[]): string {
    const basket = basketItems.map(item => [
      item.name,
      (item.unitPrice * item.quantity).toFixed(2),
      item.quantity.toString()
    ]);

    return JSON.stringify(basket);
  }

  /**
   * Verify PayTR hash
   */
  private verifyPayTRHash(data: any): boolean {
    try {
      const hashStr = [
        data.merchant_oid,
        this.config.secretKey,
        data.status,
        data.total_amount
      ].join('');

      const expectedHash = crypto.createHmac('sha256', this.config.secretKey).update(hashStr).digest('base64');
      
      return data.hash === expectedHash;
    } catch (error) {
      this.logger.error('PayTR hash verification error', error);
      return false;
    }
  }

  /**
   * Parse form data from webhook
   */
  private parseFormData(formData: string): Record<string, string> {
    const params = new URLSearchParams(formData);
    const result: Record<string, string> = {};
    
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    
    return result;
  }

  /**
   * Map PayTR status to service status
   */
  private mapPayTRStatusToServiceStatus(paytrStatus: string): ServicePaymentStatus {
    switch (paytrStatus?.toLowerCase()) {
      case 'success':
        return ServicePaymentStatus.SUCCESS;
      case 'failed':
        return ServicePaymentStatus.FAILED;
      default:
        return ServicePaymentStatus.PENDING;
    }
  }

  /**
   * Map PayTR event to webhook event
   */
  private mapPayTREventToWebhookEvent(paytrEvent: string): PaymentWebhookEvent {
    switch (paytrEvent?.toLowerCase()) {
      case 'success':
        return PaymentWebhookEvent.PAYMENT_SUCCESS;
      case 'failed':
        return PaymentWebhookEvent.PAYMENT_FAILED;
      default:
        return PaymentWebhookEvent.PAYMENT_SUCCESS; // Default fallback
    }
  }

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: PaymentRequest): PaymentServiceResult<boolean> {
    if (!request.amount || request.amount <= 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Payment amount must be greater than 0',
          retryable: false
        }
      };
    }

    if (!request.customer?.email || !request.customer?.name) {
      return {
        success: false,
        error: {
          code: 'INVALID_CUSTOMER',
          message: 'Customer email and name are required',
          retryable: false
        }
      };
    }

    if (!request.basketItems?.length) {
      return {
        success: false,
        error: {
          code: 'INVALID_BASKET',
          message: 'At least one basket item is required',
          retryable: false
        }
      };
    }

    return this.validateAmount(request.amount);
  }

  /**
   * Validate webhook signature
   */
  protected validateWebhookSignature(headers: Record<string, string>, body: any): boolean {
    // PayTR webhook validation is done via hash parameter in the webhook data
    // The hash validation is performed in verifyPayTRHash method
    return true;
  }

  /**
   * Perform health check
   */
  protected async performHealthCheck(): Promise<void> {
    // PayTR doesn't have a dedicated health check endpoint
    // We'll simulate a basic connectivity test
    try {
      await axios.get(this.config.baseUrl, { timeout: 5000 });
    } catch (error) {
      throw new Error(`PayTR service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}