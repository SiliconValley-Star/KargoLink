"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CargoServiceManager = void 0;
const shared_1 = require("@cargolink/shared");
const yurtici_cargo_service_1 = require("./yurtici-cargo.service");
const aras_cargo_service_1 = require("./aras-cargo.service");
const mng_cargo_service_1 = require("./mng-cargo.service");
const logger_1 = require("../../config/logger");
class CargoServiceManager {
    services = new Map();
    configs = new Map();
    constructor(configs) {
        this.initializeServices(configs);
    }
    initializeServices(configs) {
        for (const config of configs) {
            try {
                if (!config.enabled) {
                    logger_1.logger.info(`Cargo service ${config.provider} is disabled, skipping initialization`);
                    continue;
                }
                this.configs.set(config.provider, config);
                let service;
                switch (config.provider) {
                    case shared_1.CargoServiceProvider.YURTICI:
                        service = new yurtici_cargo_service_1.YurticiCargoService(config);
                        break;
                    case shared_1.CargoServiceProvider.ARAS:
                        service = new aras_cargo_service_1.ArasCargoService(config);
                        break;
                    case shared_1.CargoServiceProvider.MNG:
                        service = new mng_cargo_service_1.MngCargoService(config);
                        break;
                    default:
                        logger_1.logger.warn(`Unsupported cargo service provider: ${config.provider}`);
                        continue;
                }
                if (service.validateConfig()) {
                    this.services.set(config.provider, service);
                    logger_1.logger.info(`Cargo service ${config.provider} initialized successfully`);
                }
            }
            catch (error) {
                logger_1.logger.error(`Failed to initialize cargo service ${config.provider}:`, error);
            }
        }
        logger_1.logger.info(`Initialized ${this.services.size} cargo services:`, Array.from(this.services.keys()));
    }
    async getAllQuotes(request) {
        try {
            const enabledServices = Array.from(this.services.values()).filter(service => service.isEnabled());
            if (enabledServices.length === 0) {
                return {
                    success: false,
                    error: {
                        code: shared_1.CargoErrorCode.SERVICE_UNAVAILABLE,
                        message: 'No cargo services are available',
                        provider: shared_1.CargoServiceProvider.YURTICI,
                        retryable: false,
                        timestamp: new Date().toISOString()
                    }
                };
            }
            const quotePromises = enabledServices.map(async (service) => {
                try {
                    const result = await service.getQuotes(request);
                    return result;
                }
                catch (error) {
                    logger_1.logger.error(`Failed to get quotes from ${service}:`, error);
                    return {
                        success: false,
                        error: error
                    };
                }
            });
            const results = await Promise.allSettled(quotePromises);
            const successfulQuotes = [];
            const errors = [];
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value.success) {
                    successfulQuotes.push(result.value.data);
                }
                else if (result.status === 'fulfilled' && !result.value.success) {
                    errors.push(result.value.error);
                }
                else if (result.status === 'rejected') {
                    errors.push({
                        code: shared_1.CargoErrorCode.UNKNOWN_ERROR,
                        message: result.reason?.message || 'Unknown error occurred',
                        provider: shared_1.CargoServiceProvider.YURTICI,
                        retryable: false,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            if (successfulQuotes.length === 0) {
                return {
                    success: false,
                    error: {
                        code: shared_1.CargoErrorCode.NO_QUOTES_AVAILABLE,
                        message: 'No quotes available from any provider',
                        provider: shared_1.CargoServiceProvider.YURTICI,
                        retryable: true,
                        timestamp: new Date().toISOString()
                    }
                };
            }
            if (errors.length > 0) {
                logger_1.logger.warn(`Some cargo services failed to provide quotes:`, errors);
            }
            return { success: true, data: successfulQuotes };
        }
        catch (error) {
            logger_1.logger.error('Failed to get quotes from cargo services:', error);
            return {
                success: false,
                error: {
                    code: shared_1.CargoErrorCode.UNKNOWN_ERROR,
                    message: error.message || 'Failed to get quotes',
                    provider: shared_1.CargoServiceProvider.YURTICI,
                    retryable: true,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
    async getBestQuotes(request, maxResults = 5) {
        const result = await this.getAllQuotes(request);
        if (!result.success) {
            return result;
        }
        const allQuotes = [];
        for (const response of result.data) {
            allQuotes.push(...response.quotes);
        }
        const sortedQuotes = allQuotes.sort((a, b) => {
            if (a.price.totalPrice !== b.price.totalPrice) {
                return a.price.totalPrice - b.price.totalPrice;
            }
            return a.estimatedDeliveryDays - b.estimatedDeliveryDays;
        });
        const bestQuotes = sortedQuotes.slice(0, maxResults);
        return { success: true, data: bestQuotes };
    }
    async trackShipment(request) {
        const service = this.services.get(request.provider);
        if (!service) {
            return {
                success: false,
                error: {
                    code: shared_1.CargoErrorCode.SERVICE_UNAVAILABLE,
                    message: `Cargo service ${request.provider} is not available`,
                    provider: request.provider,
                    retryable: false,
                    timestamp: new Date().toISOString()
                }
            };
        }
        return await service.trackShipment(request);
    }
    async createShipment(request, provider) {
        const service = this.services.get(provider);
        if (!service) {
            return {
                success: false,
                error: {
                    code: shared_1.CargoErrorCode.SERVICE_UNAVAILABLE,
                    message: `Cargo service ${provider} is not available`,
                    provider: provider,
                    retryable: false,
                    timestamp: new Date().toISOString()
                }
            };
        }
        return await service.createShipment(request);
    }
    async cancelShipment(trackingNumber, provider) {
        const service = this.services.get(provider);
        if (!service) {
            return {
                success: false,
                error: {
                    code: shared_1.CargoErrorCode.SERVICE_UNAVAILABLE,
                    message: `Cargo service ${provider} is not available`,
                    provider: provider,
                    retryable: false,
                    timestamp: new Date().toISOString()
                }
            };
        }
        return await service.cancelShipment(trackingNumber);
    }
    getAvailableProviders() {
        return Array.from(this.services.keys()).filter(provider => {
            const service = this.services.get(provider);
            return service?.isEnabled() || false;
        });
    }
    getProviderConfig(provider) {
        return this.configs.get(provider);
    }
    isProviderAvailable(provider) {
        const service = this.services.get(provider);
        return service?.isEnabled() || false;
    }
    getProviderCapabilities(provider) {
        const config = this.configs.get(provider);
        if (!config) {
            return null;
        }
        return {
            provider,
            name: config.name,
            supportedServices: config.supportedServices,
            supportedCountries: config.supportedCountries,
            maxWeight: config.maxWeight,
            maxDimensions: config.maxDimensions,
            features: config.features,
            enabled: config.enabled
        };
    }
    getAllProviderCapabilities() {
        return Array.from(this.configs.keys())
            .map(provider => this.getProviderCapabilities(provider))
            .filter(Boolean);
    }
    async refreshConfiguration(newConfigs) {
        this.services.clear();
        this.configs.clear();
        this.initializeServices(newConfigs);
        logger_1.logger.info('Cargo service configuration refreshed');
    }
    async healthCheck() {
        const healthStatus = {};
        for (const [provider, service] of this.services.entries()) {
            try {
                const isHealthy = service.validateConfig() && service.isEnabled();
                healthStatus[provider] = isHealthy;
            }
            catch (error) {
                healthStatus[provider] = false;
                logger_1.logger.error(`Health check failed for ${provider}:`, error);
            }
        }
        return healthStatus;
    }
}
exports.CargoServiceManager = CargoServiceManager;
//# sourceMappingURL=cargo-service-manager.js.map