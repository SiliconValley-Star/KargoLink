"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePaymentService = void 0;
const payment_service_types_1 = require("@cargolink/shared/src/types/payment-service.types");
const logger_1 = require("../../utils/logger");
class BasePaymentService {
    config;
    logger;
    provider;
    constructor(config) {
        this.config = config;
        this.provider = config.provider;
        this.logger = logger_1.paymentLogger.child({ provider: this.provider });
    }
    getConfig() {
        return { ...this.config };
    }
    getProvider() {
        return this.provider;
    }
    isEnabled() {
        return this.config.enabled;
    }
    supportsCurrency(currency) {
        return this.config.supportedCurrencies.some(c => c === currency);
    }
    supportsPaymentMethod(method) {
        return this.config.supportedPaymentMethods.some(m => m === method);
    }
    validateAmount(amount) {
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
    calculateCommission(amount) {
        const commission = amount * this.config.commissionRate;
        return Math.round(commission * 100) / 100;
    }
    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${this.provider}_${timestamp}_${random}`;
    }
    logPaymentOperation(operation, paymentId, data, error) {
        const logData = {
            operation,
            paymentId,
            provider: this.provider,
            timestamp: new Date().toISOString(),
            ...data
        };
        if (error) {
            this.logger.error(`Payment ${operation} failed`, { ...logData, error });
        }
        else {
            this.logger.info(`Payment ${operation} completed`, logData);
        }
    }
    handleApiError(error, operation) {
        this.logger.error(`Payment API error in ${operation}`, error);
        const paymentError = {
            code: 'API_ERROR',
            message: 'Payment service temporarily unavailable',
            retryable: true
        };
        if (error.response) {
            paymentError.code = error.response.status?.toString() || 'HTTP_ERROR';
            paymentError.message = error.response.data?.message || error.message || 'HTTP request failed';
            paymentError.details = error.response.data;
            paymentError.retryable = error.response.status >= 500;
        }
        else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            paymentError.code = 'CONNECTION_ERROR';
            paymentError.message = 'Unable to connect to payment provider';
            paymentError.retryable = true;
        }
        else {
            paymentError.message = error.message || 'Unknown payment error';
            paymentError.details = error;
        }
        return paymentError;
    }
    createPaymentResponse(paymentId, orderId, status, amount, currency, additionalData) {
        return {
            success: status === payment_service_types_1.ServicePaymentStatus.SUCCESS,
            provider: this.provider,
            paymentId,
            orderId,
            status,
            amount,
            currency: currency,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...additionalData
        };
    }
    sanitizeForLog(data) {
        const sanitized = { ...data };
        const sensitiveFields = [
            'cardNumber', 'cvc', 'cvv', 'password', 'token', 'apiKey', 'secretKey',
            'cardHolderName', 'expiryMonth', 'expiryYear'
        ];
        const sanitizeObject = (obj) => {
            if (typeof obj !== 'object' || obj === null)
                return obj;
            const result = Array.isArray(obj) ? [] : {};
            for (const key in obj) {
                if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
                    result[key] = '***REDACTED***';
                }
                else if (typeof obj[key] === 'object') {
                    result[key] = sanitizeObject(obj[key]);
                }
                else {
                    result[key] = obj[key];
                }
            }
            return result;
        };
        return sanitizeObject(sanitized);
    }
    async checkRateLimit(identifier) {
        return true;
    }
    async healthCheck() {
        const startTime = Date.now();
        try {
            await this.performHealthCheck();
            const responseTime = Date.now() - startTime;
            return {
                success: true,
                data: {
                    status: 'healthy',
                    responseTime
                }
            };
        }
        catch (error) {
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
}
exports.BasePaymentService = BasePaymentService;
//# sourceMappingURL=BasePaymentService.js.map