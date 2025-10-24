"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentServiceManager = void 0;
const IyzicoPaymentService_1 = require("./IyzicoPaymentService");
const PayTRPaymentService_1 = require("./PayTRPaymentService");
const payment_service_types_1 = require("@cargolink/shared/src/types/payment-service.types");
const logger_1 = require("../../utils/logger");
class PaymentServiceManager {
    services = new Map();
    configs = new Map();
    metrics = new Map();
    logger = logger_1.paymentLogger.child({ component: 'PaymentServiceManager' });
    constructor(configs) {
        this.initializeServices(configs);
    }
    initializeServices(configs) {
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
            }
            catch (error) {
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
    createPaymentService(config) {
        switch (config.provider) {
            case payment_service_types_1.ServicePaymentProvider.IYZICO:
                return new IyzicoPaymentService_1.IyzicoPaymentService(config);
            case payment_service_types_1.ServicePaymentProvider.PAYTR:
                return new PayTRPaymentService_1.PayTRPaymentService(config);
            case payment_service_types_1.ServicePaymentProvider.STRIPE:
                this.logger.warn('Stripe payment service not implemented yet');
                return null;
            case payment_service_types_1.ServicePaymentProvider.PAYPAL:
                this.logger.warn('PayPal payment service not implemented yet');
                return null;
            default:
                this.logger.error('Unknown payment provider', { provider: config.provider });
                return null;
        }
    }
    initializeMetrics(provider) {
        this.metrics.set(provider, {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            errorRate: 0
        });
    }
    async initializePayment(request, preferredProvider) {
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
            }
            else {
                this.logger.warn('Payment initialization failed', {
                    provider,
                    orderId: request.orderId,
                    error: result.error
                });
            }
            return result;
        }
        catch (error) {
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
    async verifyPayment(paymentId, provider, verificationData) {
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
            }
            else {
                this.logger.warn('Payment verification failed', {
                    provider,
                    paymentId,
                    error: result.error
                });
            }
            return result;
        }
        catch (error) {
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
    async getPaymentStatus(paymentId, provider) {
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
    async refundPayment(request, provider) {
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
            }
            else {
                this.logger.warn('Refund processing failed', {
                    provider,
                    paymentId: request.paymentId,
                    error: result.error
                });
            }
            return result;
        }
        catch (error) {
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
    async processWebhook(provider, headers, body) {
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
            }
            else {
                this.logger.warn('Webhook processing failed', {
                    provider,
                    error: result.error
                });
            }
            return result;
        }
        catch (error) {
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
    async getInstallmentOptions(amount, currency, provider, cardBin) {
        const targetProvider = provider || payment_service_types_1.ServicePaymentProvider.IYZICO;
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
    selectOptimalProvider(request) {
        const availableServices = Array.from(this.services.entries())
            .filter(([, service]) => service.isEnabled())
            .map(([provider]) => provider);
        if (availableServices.length === 0) {
            throw new Error('No payment services available');
        }
        for (const provider of availableServices) {
            const service = this.services.get(provider);
            const config = this.configs.get(provider);
            if (!service.supportsCurrency(request.currency)) {
                continue;
            }
            const amountValidation = service.validateAmount(request.amount);
            if (!amountValidation.success) {
                continue;
            }
            return provider;
        }
        if (availableServices.length === 0) {
            throw new Error('No suitable payment service found');
        }
        return availableServices[0];
    }
    getService(provider) {
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
    updateMetrics(provider, success, responseTime) {
        const metrics = this.metrics.get(provider);
        if (!metrics)
            return;
        metrics.totalRequests++;
        metrics.lastRequestTime = new Date().toISOString();
        if (success) {
            metrics.successfulRequests++;
        }
        else {
            metrics.failedRequests++;
        }
        metrics.averageResponseTime =
            (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;
        metrics.errorRate = metrics.failedRequests / metrics.totalRequests;
        this.metrics.set(provider, metrics);
    }
    async healthCheck() {
        const results = {};
        const healthCheckPromises = Array.from(this.services.entries()).map(async ([provider, service]) => {
            try {
                const result = await service.healthCheck();
                results[provider] = result;
            }
            catch (error) {
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
            }, {})
        });
        return results;
    }
    getMetrics() {
        const result = {};
        for (const [provider, metrics] of this.metrics.entries()) {
            result[provider] = { ...metrics };
        }
        return result;
    }
    getAvailableProviders() {
        return Array.from(this.services.keys()).filter(provider => {
            const service = this.services.get(provider);
            return service?.isEnabled();
        });
    }
    getProviderConfig(provider) {
        return this.configs.get(provider);
    }
    setProviderStatus(provider, enabled) {
        const config = this.configs.get(provider);
        if (config) {
            config.enabled = enabled;
            this.logger.info(`Provider ${enabled ? 'enabled' : 'disabled'}`, { provider });
            return true;
        }
        return false;
    }
}
exports.PaymentServiceManager = PaymentServiceManager;
//# sourceMappingURL=PaymentServiceManager.js.map