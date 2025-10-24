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
  IyzicoConfig,
  PaymentServiceResult,
  PaymentError,
  ServicePaymentProvider,
  ServicePaymentStatus,
  ServiceCurrency,
  PaymentWebhookEvent
} from '@cargolink/shared/src/types/payment-service.types';

/**
 * İyzico Payment Service Implementation
 * Handles all İyzico payment gateway operations
 */
export class IyzicoPaymentService extends BasePaymentService {
  private readonly apiClient: AxiosInstance;
  protected readonly config: IyzicoConfig;

  constructor(config: IyzicoConfig) {
    super(config);
    this.config = config;
    
    // Initialize Axios client for İyzico API
    this.apiClient = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use((request) => {
      if (request.data) {
        request.headers['Authorization'] = this.generateAuthHeader(request.data);
      }
      return request;
    });

    // Add response interceptor for logging
    this.apiClient.interceptors.response.use(
      (response) => {
        this.logger.debug('İyzico API Response', {
          status: response.status,
          data: this.sanitizeForLog(response.data)
        });
        return response;
      },
      (error) => {
        this.logger.error('İyzico API Error', {
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
   * Initialize payment with İyzico
   */
  async initializePayment(request: PaymentRequest): Promise<PaymentServiceResult<PaymentResponse>> {
    try {
      this.logPaymentOperation('initialize', request.orderId, this.sanitizeForLog(request));

      // Validate request
      const validation = this.validatePaymentRequest(request);
      if (!validation.success) {
        return validation;
      }

      // Build İyzico payment request
      const iyzicoRequest = this.buildIyzicoPaymentRequest(request);

      // Call İyzico API
      const response = await this.apiClient.post('/payment/iyzipos/checkoutform/initialize/auth/ecom', iyzicoRequest);
      
      if (response.data.status === 'success') {
        const paymentResponse = this.createPaymentResponse(
          response.data.paymentId || request.orderId,
          request.orderId,
          ServicePaymentStatus.PENDING,
          request.amount,
          request.currency,
          {
            providerPaymentId: response.data.paymentId,
            paymentUrl: response.data.paymentPageUrl,
            threeDSecure: {
              required: true,
              redirectUrl: response.data.paymentPageUrl
            },
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
            providerResponse: this.sanitizeForLog(response.data)
          }
        );

        this.logPaymentOperation('initialize_success', request.orderId, { paymentId: paymentResponse.paymentId });
        
        return {
          success: true,
          data: paymentResponse
        };
      } else {
        const error: PaymentError = {
          code: response.data.errorCode || 'IYZICO_ERROR',
          message: response.data.errorMessage || 'Payment initialization failed',
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
   * Verify payment after redirect from İyzico
   */
  async verifyPayment(
    paymentId: string,
    verificationData: Record<string, any>
  ): Promise<PaymentServiceResult<PaymentResponse>> {
    try {
      this.logPaymentOperation('verify', paymentId, { verificationData: this.sanitizeForLog(verificationData) });

      const verificationRequest = {
        locale: this.config.locale || 'tr',
        conversationId: this.config.conversationId || paymentId,
        paymentId: verificationData.paymentId,
        token: verificationData.token
      };

      const response = await this.apiClient.post('/payment/iyzipos/checkoutform/auth/ecom/detail', verificationRequest);

      if (response.data.status === 'success') {
        const payment = response.data.payments?.[0];
        const status = this.mapIyzicoStatusToServiceStatus(payment?.paymentStatus);

        const paymentResponse = this.createPaymentResponse(
          response.data.paymentId,
          response.data.basketId || paymentId,
          status,
          parseFloat(payment?.paidPrice || '0'),
          payment?.currency || 'TRY',
          {
            providerPaymentId: response.data.paymentId,
            providerResponse: this.sanitizeForLog(response.data),
            paidAt: status === ServicePaymentStatus.SUCCESS ? new Date().toISOString() : undefined,
            threeDSecure: {
              required: true,
              redirectUrl: undefined
            }
          }
        );

        this.logPaymentOperation('verify_success', paymentId, { status, amount: payment?.paidPrice });

        return {
          success: true,
          data: paymentResponse
        };
      } else {
        const error: PaymentError = {
          code: response.data.errorCode || 'VERIFICATION_FAILED',
          message: response.data.errorMessage || 'Payment verification failed',
          details: response.data,
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
   * Get payment status from İyzico
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentServiceResult<PaymentResponse>> {
    try {
      this.logPaymentOperation('status_check', paymentId);

      const statusRequest = {
        locale: this.config.locale || 'tr',
        conversationId: this.config.conversationId || paymentId,
        paymentId
      };

      const response = await this.apiClient.post('/payment/detail', statusRequest);

      if (response.data.status === 'success') {
        const payment = response.data.payments?.[0];
        const status = this.mapIyzicoStatusToServiceStatus(payment?.paymentStatus);

        const paymentResponse = this.createPaymentResponse(
          response.data.paymentId,
          response.data.basketId || paymentId,
          status,
          parseFloat(payment?.paidPrice || '0'),
          payment?.currency || 'TRY',
          {
            providerPaymentId: response.data.paymentId,
            providerResponse: this.sanitizeForLog(response.data)
          }
        );

        return {
          success: true,
          data: paymentResponse
        };
      } else {
        const error: PaymentError = {
          code: response.data.errorCode || 'STATUS_CHECK_FAILED',
          message: response.data.errorMessage || 'Payment status check failed',
          details: response.data,
          retryable: true
        };

        return {
          success: false,
          error
        };
      }
    } catch (error) {
      const paymentError = this.handleApiError(error, 'get_payment_status');
      return {
        success: false,
        error: paymentError
      };
    }
  }

  /**
   * Process refund with İyzico
   */
  async refundPayment(request: RefundRequest): Promise<PaymentServiceResult<RefundResponse>> {
    try {
      this.logPaymentOperation('refund', request.paymentId, this.sanitizeForLog(request));

      const refundRequest = {
        locale: this.config.locale || 'tr',
        conversationId: this.config.conversationId || request.paymentId,
        paymentTransactionId: request.paymentId,
        price: request.amount.toString(),
        currency: request.currency,
        reason: request.reason,
        description: request.description
      };

      const response = await this.apiClient.post('/payment/refund', refundRequest);

      if (response.data.status === 'success') {
        const refundResponse: RefundResponse = {
          success: true,
          provider: ServicePaymentProvider.IYZICO,
          refundId: response.data.paymentId || `refund_${Date.now()}`,
          paymentId: request.paymentId,
          amount: request.amount,
          currency: request.currency,
          status: ServicePaymentStatus.SUCCESS,
          providerRefundId: response.data.paymentId,
          createdAt: new Date().toISOString()
        };

        this.logPaymentOperation('refund_success', request.paymentId, { refundId: refundResponse.refundId });

        return {
          success: true,
          data: refundResponse
        };
      } else {
        const error: PaymentError = {
          code: response.data.errorCode || 'REFUND_FAILED',
          message: response.data.errorMessage || 'Refund processing failed',
          details: response.data,
          retryable: false
        };

        this.logPaymentOperation('refund_failed', request.paymentId, undefined, error);

        const refundResponse: RefundResponse = {
          success: false,
          provider: ServicePaymentProvider.IYZICO,
          refundId: `failed_refund_${Date.now()}`,
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
      }
    } catch (error) {
      const paymentError = this.handleApiError(error, 'refund_payment');
      return {
        success: false,
        error: paymentError
      };
    }
  }

  /**
   * Process İyzico webhook
   */
  async processWebhook(
    headers: Record<string, string>,
    body: any
  ): Promise<PaymentServiceResult<PaymentWebhook>> {
    try {
      this.logger.info('Processing İyzico webhook', { headers: this.sanitizeForLog(headers), body: this.sanitizeForLog(body) });

      // Validate webhook signature
      if (!this.validateWebhookSignature(headers, body)) {
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
        provider: ServicePaymentProvider.IYZICO,
        eventType: this.mapIyzicoEventToWebhookEvent(body.status),
        paymentId: body.paymentId || body.iyziEventType,
        orderId: body.basketId || body.paymentId,
        status: this.mapIyzicoStatusToServiceStatus(body.paymentStatus || body.status),
        amount: parseFloat(body.paidPrice || body.price || '0'),
        currency: body.currency || 'TRY',
        timestamp: new Date().toISOString(),
        rawData: body
      };

      this.logger.info('İyzico webhook processed successfully', { webhook: this.sanitizeForLog(webhook) });

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
   */
  async getInstallmentOptions(
    amount: number,
    currency: string,
    cardBin?: string
  ): Promise<PaymentServiceResult<InstallmentInfo[]>> {
    try {
      const installmentRequest = {
        locale: this.config.locale || 'tr',
        conversationId: this.generateTransactionId(),
        binNumber: cardBin,
        price: amount.toString()
      };

      const response = await this.apiClient.post('/payment/iyzipos/installment', installmentRequest);

      if (response.data.status === 'success') {
        const installments: InstallmentInfo[] = response.data.installmentDetails?.map((bank: any) => ({
          bankName: bank.bankName,
          bankCode: bank.bankCode,
          cardType: 'CREDIT',
          cardAssociation: bank.cardType?.toUpperCase() || 'VISA',
          installments: bank.installmentPrices?.map((installment: any) => ({
            count: installment.installmentNumber,
            interestRate: parseFloat(installment.totalPrice) > amount ? 
              ((parseFloat(installment.totalPrice) - amount) / amount) * 100 : 0,
            installmentPrice: parseFloat(installment.installmentPrice),
            totalPrice: parseFloat(installment.totalPrice),
            bankCommissionRate: installment.bankCommissionRate || 0,
            merchantCommissionRate: installment.merchantCommissionRate || 0
          })) || []
        })) || [];

        return {
          success: true,
          data: installments
        };
      } else {
        const error: PaymentError = {
          code: response.data.errorCode || 'INSTALLMENT_QUERY_FAILED',
          message: response.data.errorMessage || 'Failed to get installment options',
          details: response.data,
          retryable: true
        };

        return {
          success: false,
          error
        };
      }
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
   * Generate İyzico authentication header
   */
  private generateAuthHeader(requestData: any): string {
    const randomKey = this.generateRandomString();
    const requestString = this.buildRequestString(requestData, randomKey);
    const hash = crypto
      .createHmac('sha1', this.config.secretKey)
      .update(requestString)
      .digest('base64');

    return `IYZWSv2 ${this.config.apiKey}:${hash}:${randomKey}`;
  }

  /**
   * Build request string for authentication
   */
  private buildRequestString(requestData: any, randomKey: string): string {
    const orderedData = this.flattenObject(requestData);
    const requestArray = [`[REQUEST]${randomKey}[/REQUEST]`];
    
    Object.keys(orderedData)
      .sort()
      .forEach(key => {
        requestArray.push(`[${key}]${orderedData[key]}[/${key}]`);
      });

    return requestArray.join('');
  }

  /**
   * Flatten nested object for authentication
   */
  private flattenObject(obj: any, prefix: string = ''): Record<string, string> {
    const flattened: Record<string, string> = {};
    
    Object.keys(obj).forEach(key => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, this.flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = String(obj[key]);
      }
    });
    
    return flattened;
  }

  /**
   * Generate random string for authentication
   */
  private generateRandomString(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Build İyzico payment request
   */
  private buildIyzicoPaymentRequest(request: PaymentRequest): any {
    return {
      locale: this.config.locale || 'tr',
      conversationId: this.config.conversationId || request.orderId,
      price: request.amount.toString(),
      paidPrice: request.amount.toString(),
      currency: request.currency,
      basketId: request.orderId,
      paymentGroup: request.paymentGroup || 'PRODUCT',
      callbackUrl: request.successUrl,
      buyer: {
        id: request.customer.id || 'BY789',
        name: request.customer.name,
        surname: request.customer.surname,
        gsmNumber: request.customer.phone,
        email: request.customer.email,
        identityNumber: request.customer.identityNumber || '74300864791',
        lastLoginDate: request.customer.lastLoginDate || new Date().toISOString().split('T')[0] + ' 12:00:00',
        registrationDate: request.customer.registrationDate || new Date().toISOString().split('T')[0] + ' 12:00:00',
        registrationAddress: request.billingAddress.address,
        ip: '85.34.78.112', // This should be dynamic
        city: request.billingAddress.city,
        country: request.billingAddress.country,
        zipCode: request.billingAddress.postalCode
      },
      shippingAddress: {
        contactName: request.shippingAddress?.contactName || request.billingAddress.contactName,
        city: request.shippingAddress?.city || request.billingAddress.city,
        district: request.shippingAddress?.district || request.billingAddress.district,
        address: request.shippingAddress?.address || request.billingAddress.address,
        country: request.shippingAddress?.country || request.billingAddress.country,
        zipCode: request.shippingAddress?.postalCode || request.billingAddress.postalCode
      },
      billingAddress: {
        contactName: request.billingAddress.contactName,
        city: request.billingAddress.city,
        district: request.billingAddress.district,
        address: request.billingAddress.address,
        country: request.billingAddress.country,
        zipCode: request.billingAddress.postalCode
      },
      basketItems: request.basketItems.map(item => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        category2: item.category2 || 'Diğer',
        itemType: item.itemType,
        price: (item.unitPrice * item.quantity).toString()
      }))
    };
  }

  /**
   * Map İyzico status to service status
   */
  private mapIyzicoStatusToServiceStatus(iyzicoStatus: string): ServicePaymentStatus {
    switch (iyzicoStatus?.toLowerCase()) {
      case 'success':
        return ServicePaymentStatus.SUCCESS;
      case 'failure':
        return ServicePaymentStatus.FAILED;
      case 'init_threeds':
      case 'callback_threeds':
        return ServicePaymentStatus.PROCESSING;
      default:
        return ServicePaymentStatus.PENDING;
    }
  }

  /**
   * Map İyzico event to webhook event
   */
  private mapIyzicoEventToWebhookEvent(iyzicoEvent: string): PaymentWebhookEvent {
    switch (iyzicoEvent?.toLowerCase()) {
      case 'success':
        return PaymentWebhookEvent.PAYMENT_SUCCESS;
      case 'failure':
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
    // İyzico webhook signature validation
    // This is a simplified version - implement according to İyzico documentation
    const signature = headers['x-iyz-signature'] || headers['authorization'];
    if (!signature || !this.config.webhookSecretKey) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecretKey)
        .update(JSON.stringify(body))
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      this.logger.error('Webhook signature validation error', error);
      return false;
    }
  }

  /**
   * Perform health check
   */
  protected async performHealthCheck(): Promise<void> {
    const healthRequest = {
      locale: 'tr',
      conversationId: 'health_check_' + Date.now()
    };

    await this.apiClient.post('/payment/test', healthRequest);
  }
}