"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayTRPaymentService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const BasePaymentService_1 = require("./BasePaymentService");
const payment_service_types_1 = require("@cargolink/shared/src/types/payment-service.types");
class PayTRPaymentService extends BasePaymentService_1.BasePaymentService {
    apiClient;
    config;
    constructor(config) {
        super(config);
        this.config = config;
        this.apiClient = axios_1.default.create({
            baseURL: config.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
        });
        this.apiClient.interceptors.response.use((response) => {
            this.logger.debug('PayTR API Response', {
                status: response.status,
                data: this.sanitizeForLog(response.data)
            });
            return response;
        }, (error) => {
            this.logger.error('PayTR API Error', {
                status: error.response?.status,
                data: this.sanitizeForLog(error.response?.data),
                message: error.message
            });
            return Promise.reject(error);
        });
    }
    async initializePayment(request) {
        try {
            this.logPaymentOperation('initialize', request.orderId, this.sanitizeForLog(request));
            const validation = this.validatePaymentRequest(request);
            if (!validation.success) {
                return validation;
            }
            const paytrRequest = this.buildPayTRPaymentRequest(request);
            const response = await this.apiClient.post('/odeme/api/get-token', paytrRequest, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            if (response.data.status === 'success') {
                const paymentResponse = this.createPaymentResponse(response.data.token || request.orderId, request.orderId, payment_service_types_1.ServicePaymentStatus.PENDING, request.amount, request.currency, {
                    providerPaymentId: response.data.token,
                    paymentUrl: `https://www.paytr.com/odeme/guvenli/${response.data.token}`,
                    threeDSecure: {
                        required: true,
                        redirectUrl: `https://www.paytr.com/odeme/guvenli/${response.data.token}`
                    },
                    expiresAt: new Date(Date.now() + (this.config.timeoutLimit || 30) * 60 * 1000).toISOString(),
                    providerResponse: this.sanitizeForLog(response.data)
                });
                this.logPaymentOperation('initialize_success', request.orderId, { token: response.data.token });
                return {
                    success: true,
                    data: paymentResponse
                };
            }
            else {
                const error = {
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
        }
        catch (error) {
            const paymentError = this.handleApiError(error, 'initialize_payment');
            return {
                success: false,
                error: paymentError
            };
        }
    }
    async verifyPayment(paymentId, verificationData) {
        try {
            this.logPaymentOperation('verify', paymentId, { verificationData: this.sanitizeForLog(verificationData) });
            if (verificationData.merchant_oid && verificationData.status && verificationData.hash) {
                const isValidHash = this.verifyPayTRHash(verificationData);
                if (!isValidHash) {
                    const error = {
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
                const amount = parseFloat(verificationData.total_amount || '0') / 100;
                const paymentResponse = this.createPaymentResponse(verificationData.merchant_oid, verificationData.merchant_oid, status, amount, 'TRY', {
                    providerPaymentId: verificationData.merchant_oid,
                    providerResponse: this.sanitizeForLog(verificationData),
                    paidAt: status === payment_service_types_1.ServicePaymentStatus.SUCCESS ? new Date().toISOString() : undefined,
                    processedAt: new Date().toISOString()
                });
                this.logPaymentOperation('verify_success', paymentId, { status, amount });
                return {
                    success: true,
                    data: paymentResponse
                };
            }
            else {
                const error = {
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
        }
        catch (error) {
            const paymentError = this.handleApiError(error, 'verify_payment');
            return {
                success: false,
                error: paymentError
            };
        }
    }
    async getPaymentStatus(paymentId) {
        try {
            this.logPaymentOperation('status_check', paymentId);
            const paymentResponse = this.createPaymentResponse(paymentId, paymentId, payment_service_types_1.ServicePaymentStatus.PENDING, 0, 'TRY', {
                providerPaymentId: paymentId,
                providerResponse: { message: 'Status check not supported by PayTR. Use webhooks for real-time updates.' }
            });
            return {
                success: true,
                data: paymentResponse
            };
        }
        catch (error) {
            const paymentError = this.handleApiError(error, 'get_payment_status');
            return {
                success: false,
                error: paymentError
            };
        }
    }
    async refundPayment(request) {
        try {
            this.logPaymentOperation('refund', request.paymentId, this.sanitizeForLog(request));
            const error = {
                code: 'REFUND_NOT_SUPPORTED',
                message: 'PayTR refunds must be processed through merchant panel',
                details: { paymentId: request.paymentId },
                retryable: false
            };
            this.logPaymentOperation('refund_failed', request.paymentId, undefined, error);
            const refundResponse = {
                success: false,
                provider: payment_service_types_1.ServicePaymentProvider.PAYTR,
                refundId: `manual_refund_${Date.now()}`,
                paymentId: request.paymentId,
                amount: request.amount,
                currency: request.currency,
                status: payment_service_types_1.ServicePaymentStatus.FAILED,
                error,
                createdAt: new Date().toISOString()
            };
            return {
                success: false,
                error
            };
        }
        catch (error) {
            const paymentError = this.handleApiError(error, 'refund_payment');
            return {
                success: false,
                error: paymentError
            };
        }
    }
    async processWebhook(headers, body) {
        try {
            this.logger.info('Processing PayTR webhook', { headers: this.sanitizeForLog(headers), body: this.sanitizeForLog(body) });
            const webhookData = typeof body === 'string' ? this.parseFormData(body) : body;
            if (!this.validateWebhookSignature(headers, webhookData)) {
                const error = {
                    code: 'INVALID_WEBHOOK_SIGNATURE',
                    message: 'Webhook signature validation failed',
                    retryable: false
                };
                return {
                    success: false,
                    error
                };
            }
            const webhook = {
                provider: payment_service_types_1.ServicePaymentProvider.PAYTR,
                eventType: this.mapPayTREventToWebhookEvent(webhookData.status),
                paymentId: webhookData.merchant_oid || webhookData.payment_id,
                orderId: webhookData.merchant_oid || webhookData.payment_id,
                status: this.mapPayTRStatusToServiceStatus(webhookData.status),
                amount: parseFloat(webhookData.total_amount || webhookData.amount || '0') / 100,
                currency: payment_service_types_1.ServiceCurrency.TRY,
                timestamp: new Date().toISOString(),
                rawData: webhookData
            };
            this.logger.info('PayTR webhook processed successfully', { webhook: this.sanitizeForLog(webhook) });
            return {
                success: true,
                data: webhook
            };
        }
        catch (error) {
            const paymentError = this.handleApiError(error, 'process_webhook');
            return {
                success: false,
                error: paymentError
            };
        }
    }
    async getInstallmentOptions(amount, currency, cardBin) {
        try {
            const installments = [
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
        }
        catch (error) {
            const paymentError = this.handleApiError(error, 'get_installment_options');
            return {
                success: false,
                error: paymentError
            };
        }
    }
    buildPayTRPaymentRequest(request) {
        const merchantOid = request.orderId;
        const email = request.customer.email;
        const paymentAmount = Math.round(request.amount * 100);
        const userBasket = this.buildUserBasket(request.basketItems);
        const noInstallment = request.installmentCount ? '0' : '1';
        const maxInstallment = request.installmentCount || this.config.maxInstallmentCount || 0;
        const userIp = this.config.userIp || '127.0.0.1';
        const timeoutLimit = this.config.timeoutLimit || 30;
        const debugMode = this.config.debugMode ? '1' : '0';
        const hashStr = [
            this.config.merchantId,
            userIp,
            merchantOid,
            email,
            paymentAmount.toString(),
            userBasket,
            noInstallment,
            maxInstallment.toString(),
            'TRY',
            '1',
            this.config.secretKey
        ].join('');
        const paytrToken = crypto_1.default.createHmac('sha256', this.config.secretKey).update(hashStr).digest('base64');
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
    buildUserBasket(basketItems) {
        const basket = basketItems.map(item => [
            item.name,
            (item.unitPrice * item.quantity).toFixed(2),
            item.quantity.toString()
        ]);
        return JSON.stringify(basket);
    }
    verifyPayTRHash(data) {
        try {
            const hashStr = [
                data.merchant_oid,
                this.config.secretKey,
                data.status,
                data.total_amount
            ].join('');
            const expectedHash = crypto_1.default.createHmac('sha256', this.config.secretKey).update(hashStr).digest('base64');
            return data.hash === expectedHash;
        }
        catch (error) {
            this.logger.error('PayTR hash verification error', error);
            return false;
        }
    }
    parseFormData(formData) {
        const params = new URLSearchParams(formData);
        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    }
    mapPayTRStatusToServiceStatus(paytrStatus) {
        switch (paytrStatus?.toLowerCase()) {
            case 'success':
                return payment_service_types_1.ServicePaymentStatus.SUCCESS;
            case 'failed':
                return payment_service_types_1.ServicePaymentStatus.FAILED;
            default:
                return payment_service_types_1.ServicePaymentStatus.PENDING;
        }
    }
    mapPayTREventToWebhookEvent(paytrEvent) {
        switch (paytrEvent?.toLowerCase()) {
            case 'success':
                return payment_service_types_1.PaymentWebhookEvent.PAYMENT_SUCCESS;
            case 'failed':
                return payment_service_types_1.PaymentWebhookEvent.PAYMENT_FAILED;
            default:
                return payment_service_types_1.PaymentWebhookEvent.PAYMENT_SUCCESS;
        }
    }
    validatePaymentRequest(request) {
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
    validateWebhookSignature(headers, body) {
        return true;
    }
    async performHealthCheck() {
        try {
            await axios_1.default.get(this.config.baseUrl, { timeout: 5000 });
        }
        catch (error) {
            throw new Error(`PayTR service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.PayTRPaymentService = PayTRPaymentService;
//# sourceMappingURL=PayTRPaymentService.js.map