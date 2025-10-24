"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IyzicoPaymentService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const BasePaymentService_1 = require("./BasePaymentService");
const payment_service_types_1 = require("@cargolink/shared/src/types/payment-service.types");
class IyzicoPaymentService extends BasePaymentService_1.BasePaymentService {
    apiClient;
    config;
    constructor(config) {
        super(config);
        this.config = config;
        this.apiClient = axios_1.default.create({
            baseURL: config.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        this.apiClient.interceptors.request.use((request) => {
            if (request.data) {
                request.headers['Authorization'] = this.generateAuthHeader(request.data);
            }
            return request;
        });
        this.apiClient.interceptors.response.use((response) => {
            this.logger.debug('İyzico API Response', {
                status: response.status,
                data: this.sanitizeForLog(response.data)
            });
            return response;
        }, (error) => {
            this.logger.error('İyzico API Error', {
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
            const iyzicoRequest = this.buildIyzicoPaymentRequest(request);
            const response = await this.apiClient.post('/payment/iyzipos/checkoutform/initialize/auth/ecom', iyzicoRequest);
            if (response.data.status === 'success') {
                const paymentResponse = this.createPaymentResponse(response.data.paymentId || request.orderId, request.orderId, payment_service_types_1.ServicePaymentStatus.PENDING, request.amount, request.currency, {
                    providerPaymentId: response.data.paymentId,
                    paymentUrl: response.data.paymentPageUrl,
                    threeDSecure: {
                        required: true,
                        redirectUrl: response.data.paymentPageUrl
                    },
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                    providerResponse: this.sanitizeForLog(response.data)
                });
                this.logPaymentOperation('initialize_success', request.orderId, { paymentId: paymentResponse.paymentId });
                return {
                    success: true,
                    data: paymentResponse
                };
            }
            else {
                const error = {
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
                const paymentResponse = this.createPaymentResponse(response.data.paymentId, response.data.basketId || paymentId, status, parseFloat(payment?.paidPrice || '0'), payment?.currency || 'TRY', {
                    providerPaymentId: response.data.paymentId,
                    providerResponse: this.sanitizeForLog(response.data),
                    paidAt: status === payment_service_types_1.ServicePaymentStatus.SUCCESS ? new Date().toISOString() : undefined,
                    threeDSecure: {
                        required: true,
                        redirectUrl: undefined
                    }
                });
                this.logPaymentOperation('verify_success', paymentId, { status, amount: payment?.paidPrice });
                return {
                    success: true,
                    data: paymentResponse
                };
            }
            else {
                const error = {
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
            const statusRequest = {
                locale: this.config.locale || 'tr',
                conversationId: this.config.conversationId || paymentId,
                paymentId
            };
            const response = await this.apiClient.post('/payment/detail', statusRequest);
            if (response.data.status === 'success') {
                const payment = response.data.payments?.[0];
                const status = this.mapIyzicoStatusToServiceStatus(payment?.paymentStatus);
                const paymentResponse = this.createPaymentResponse(response.data.paymentId, response.data.basketId || paymentId, status, parseFloat(payment?.paidPrice || '0'), payment?.currency || 'TRY', {
                    providerPaymentId: response.data.paymentId,
                    providerResponse: this.sanitizeForLog(response.data)
                });
                return {
                    success: true,
                    data: paymentResponse
                };
            }
            else {
                const error = {
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
                const refundResponse = {
                    success: true,
                    provider: payment_service_types_1.ServicePaymentProvider.IYZICO,
                    refundId: response.data.paymentId || `refund_${Date.now()}`,
                    paymentId: request.paymentId,
                    amount: request.amount,
                    currency: request.currency,
                    status: payment_service_types_1.ServicePaymentStatus.SUCCESS,
                    providerRefundId: response.data.paymentId,
                    createdAt: new Date().toISOString()
                };
                this.logPaymentOperation('refund_success', request.paymentId, { refundId: refundResponse.refundId });
                return {
                    success: true,
                    data: refundResponse
                };
            }
            else {
                const error = {
                    code: response.data.errorCode || 'REFUND_FAILED',
                    message: response.data.errorMessage || 'Refund processing failed',
                    details: response.data,
                    retryable: false
                };
                this.logPaymentOperation('refund_failed', request.paymentId, undefined, error);
                const refundResponse = {
                    success: false,
                    provider: payment_service_types_1.ServicePaymentProvider.IYZICO,
                    refundId: `failed_refund_${Date.now()}`,
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
            this.logger.info('Processing İyzico webhook', { headers: this.sanitizeForLog(headers), body: this.sanitizeForLog(body) });
            if (!this.validateWebhookSignature(headers, body)) {
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
                provider: payment_service_types_1.ServicePaymentProvider.IYZICO,
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
            const installmentRequest = {
                locale: this.config.locale || 'tr',
                conversationId: this.generateTransactionId(),
                binNumber: cardBin,
                price: amount.toString()
            };
            const response = await this.apiClient.post('/payment/iyzipos/installment', installmentRequest);
            if (response.data.status === 'success') {
                const installments = response.data.installmentDetails?.map((bank) => ({
                    bankName: bank.bankName,
                    bankCode: bank.bankCode,
                    cardType: 'CREDIT',
                    cardAssociation: bank.cardType?.toUpperCase() || 'VISA',
                    installments: bank.installmentPrices?.map((installment) => ({
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
            }
            else {
                const error = {
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
        }
        catch (error) {
            const paymentError = this.handleApiError(error, 'get_installment_options');
            return {
                success: false,
                error: paymentError
            };
        }
    }
    generateAuthHeader(requestData) {
        const randomKey = this.generateRandomString();
        const requestString = this.buildRequestString(requestData, randomKey);
        const hash = crypto_1.default
            .createHmac('sha1', this.config.secretKey)
            .update(requestString)
            .digest('base64');
        return `IYZWSv2 ${this.config.apiKey}:${hash}:${randomKey}`;
    }
    buildRequestString(requestData, randomKey) {
        const orderedData = this.flattenObject(requestData);
        const requestArray = [`[REQUEST]${randomKey}[/REQUEST]`];
        Object.keys(orderedData)
            .sort()
            .forEach(key => {
            requestArray.push(`[${key}]${orderedData[key]}[/${key}]`);
        });
        return requestArray.join('');
    }
    flattenObject(obj, prefix = '') {
        const flattened = {};
        Object.keys(obj).forEach(key => {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(flattened, this.flattenObject(obj[key], newKey));
            }
            else {
                flattened[newKey] = String(obj[key]);
            }
        });
        return flattened;
    }
    generateRandomString() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
    buildIyzicoPaymentRequest(request) {
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
                ip: '85.34.78.112',
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
    mapIyzicoStatusToServiceStatus(iyzicoStatus) {
        switch (iyzicoStatus?.toLowerCase()) {
            case 'success':
                return payment_service_types_1.ServicePaymentStatus.SUCCESS;
            case 'failure':
                return payment_service_types_1.ServicePaymentStatus.FAILED;
            case 'init_threeds':
            case 'callback_threeds':
                return payment_service_types_1.ServicePaymentStatus.PROCESSING;
            default:
                return payment_service_types_1.ServicePaymentStatus.PENDING;
        }
    }
    mapIyzicoEventToWebhookEvent(iyzicoEvent) {
        switch (iyzicoEvent?.toLowerCase()) {
            case 'success':
                return payment_service_types_1.PaymentWebhookEvent.PAYMENT_SUCCESS;
            case 'failure':
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
        const signature = headers['x-iyz-signature'] || headers['authorization'];
        if (!signature || !this.config.webhookSecretKey) {
            return false;
        }
        try {
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.config.webhookSecretKey)
                .update(JSON.stringify(body))
                .digest('hex');
            return crypto_1.default.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
        }
        catch (error) {
            this.logger.error('Webhook signature validation error', error);
            return false;
        }
    }
    async performHealthCheck() {
        const healthRequest = {
            locale: 'tr',
            conversationId: 'health_check_' + Date.now()
        };
        await this.apiClient.post('/payment/test', healthRequest);
    }
}
exports.IyzicoPaymentService = IyzicoPaymentService;
//# sourceMappingURL=IyzicoPaymentService.js.map