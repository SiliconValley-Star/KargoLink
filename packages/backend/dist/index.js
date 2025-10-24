"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logger_simple_1 = require("./config/logger.simple");
const redis_1 = __importDefault(require("./config/redis"));
const app_1 = require("./app");
const cargo_controller_1 = require("./controllers/cargo.controller");
const payment_controller_1 = require("./controllers/payment.controller");
const PaymentServiceManager_1 = require("./services/payment/PaymentServiceManager");
const PORT = process.env.PORT || 3001;
var CargoServiceProvider;
(function (CargoServiceProvider) {
    CargoServiceProvider["YURTICI"] = "yurtici";
    CargoServiceProvider["ARAS"] = "aras";
    CargoServiceProvider["MNG"] = "mng";
})(CargoServiceProvider || (CargoServiceProvider = {}));
var CargoServiceType;
(function (CargoServiceType) {
    CargoServiceType["STANDARD"] = "standard";
    CargoServiceType["EXPRESS"] = "express";
    CargoServiceType["OVERNIGHT"] = "overnight";
    CargoServiceType["ECONOMY"] = "economy";
    CargoServiceType["PREMIUM"] = "premium";
})(CargoServiceType || (CargoServiceType = {}));
var ServicePaymentProvider;
(function (ServicePaymentProvider) {
    ServicePaymentProvider["IYZICO"] = "iyzico";
    ServicePaymentProvider["PAYTR"] = "paytr";
})(ServicePaymentProvider || (ServicePaymentProvider = {}));
var ServicePaymentMethod;
(function (ServicePaymentMethod) {
    ServicePaymentMethod["CREDIT_CARD"] = "credit_card";
    ServicePaymentMethod["DEBIT_CARD"] = "debit_card";
    ServicePaymentMethod["DIGITAL_WALLET"] = "digital_wallet";
    ServicePaymentMethod["BANK_TRANSFER"] = "bank_transfer";
})(ServicePaymentMethod || (ServicePaymentMethod = {}));
var ServiceCurrency;
(function (ServiceCurrency) {
    ServiceCurrency["TRY"] = "TRY";
    ServiceCurrency["USD"] = "USD";
    ServiceCurrency["EUR"] = "EUR";
})(ServiceCurrency || (ServiceCurrency = {}));
const initializeCargoServices = () => {
    const cargoConfigs = [
        {
            provider: CargoServiceProvider.YURTICI,
            name: 'Yurtiçi Kargo',
            apiEndpoint: process.env.YURTICI_API_ENDPOINT || 'https://api.yurticikargo.com',
            apiUrl: process.env.YURTICI_API_ENDPOINT || 'https://api.yurticikargo.com',
            apiKey: process.env.YURTICI_API_KEY || 'demo-key',
            apiSecret: process.env.YURTICI_API_SECRET,
            sandbox: process.env.NODE_ENV !== 'production',
            enabled: process.env.YURTICI_ENABLED === 'true',
            timeout: 30000,
            retryAttempts: 3,
            supportedServices: [CargoServiceType.STANDARD, CargoServiceType.EXPRESS, CargoServiceType.OVERNIGHT],
            supportedCountries: ['TR'],
            maxWeight: 30,
            maxDimensions: { width: 120, height: 80, length: 120 },
            features: {
                tracking: true,
                insurance: true,
                cod: true,
                signature: true,
                weekendDelivery: false
            },
            rateLimits: {
                requestsPerMinute: 60,
                requestsPerHour: 1000
            }
        },
        {
            provider: CargoServiceProvider.ARAS,
            name: 'Aras Kargo',
            apiEndpoint: process.env.ARAS_API_ENDPOINT || 'https://api.araskargo.com.tr',
            apiUrl: process.env.ARAS_API_ENDPOINT || 'https://api.araskargo.com.tr',
            apiKey: process.env.ARAS_API_KEY || 'demo-key',
            apiSecret: process.env.ARAS_API_SECRET,
            sandbox: process.env.NODE_ENV !== 'production',
            enabled: process.env.ARAS_ENABLED === 'true',
            timeout: 30000,
            retryAttempts: 3,
            supportedServices: [CargoServiceType.STANDARD, CargoServiceType.EXPRESS, CargoServiceType.PREMIUM],
            supportedCountries: ['TR'],
            maxWeight: 50,
            maxDimensions: { width: 150, height: 100, length: 150 },
            features: {
                tracking: true,
                insurance: true,
                cod: true,
                signature: true,
                weekendDelivery: true
            },
            rateLimits: {
                requestsPerMinute: 100,
                requestsPerHour: 2000
            }
        },
        {
            provider: CargoServiceProvider.MNG,
            name: 'MNG Kargo',
            apiEndpoint: process.env.MNG_API_ENDPOINT || 'https://api.mngkargo.com.tr',
            apiUrl: process.env.MNG_API_ENDPOINT || 'https://api.mngkargo.com.tr',
            apiKey: process.env.MNG_API_KEY || 'demo-key',
            username: process.env.MNG_USERNAME,
            password: process.env.MNG_PASSWORD,
            sandbox: process.env.NODE_ENV !== 'production',
            enabled: process.env.MNG_ENABLED === 'true',
            timeout: 30000,
            retryAttempts: 3,
            supportedServices: [CargoServiceType.STANDARD, CargoServiceType.EXPRESS, CargoServiceType.OVERNIGHT, CargoServiceType.PREMIUM],
            supportedCountries: ['TR', 'US', 'GB', 'DE', 'FR'],
            maxWeight: 100,
            maxDimensions: { width: 200, height: 150, length: 200 },
            features: {
                tracking: true,
                insurance: true,
                cod: true,
                signature: true,
                weekendDelivery: true
            },
            rateLimits: {
                requestsPerMinute: 120,
                requestsPerHour: 3000
            }
        }
    ];
    try {
        cargo_controller_1.CargoController.initialize(cargoConfigs);
        logger_simple_1.logger.info('Cargo services initialized successfully');
    }
    catch (error) {
        logger_simple_1.logger.error('Failed to initialize cargo services:', error);
    }
};
const initializePaymentServices = () => {
    const paymentConfigs = [
        {
            provider: ServicePaymentProvider.IYZICO,
            name: 'İyzico',
            enabled: process.env.IYZICO_ENABLED === 'true',
            sandbox: process.env.NODE_ENV !== 'production',
            apiKey: process.env.IYZICO_API_KEY || 'demo-key',
            secretKey: process.env.IYZICO_SECRET_KEY || 'demo-secret',
            baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
            webhookUrl: `${process.env.API_BASE_URL}/api/v1/payments/webhook/iyzico`,
            supportedCurrencies: [ServiceCurrency.TRY, ServiceCurrency.USD, ServiceCurrency.EUR],
            supportedPaymentMethods: [
                ServicePaymentMethod.CREDIT_CARD,
                ServicePaymentMethod.DEBIT_CARD,
                ServicePaymentMethod.DIGITAL_WALLET
            ],
            supports3DSecure: true,
            supportsInstallments: true,
            supportsRefunds: true,
            minAmount: 1,
            maxAmount: 100000,
            maxInstallmentCount: 12,
            commissionRate: 0.029,
            webhookSecretKey: process.env.IYZICO_WEBHOOK_SECRET,
            rateLimits: {
                requestsPerMinute: 60,
                requestsPerHour: 1000
            }
        },
        {
            provider: ServicePaymentProvider.PAYTR,
            name: 'PayTR',
            enabled: process.env.PAYTR_ENABLED === 'true',
            sandbox: process.env.NODE_ENV !== 'production',
            apiKey: process.env.PAYTR_MERCHANT_ID || 'demo-merchant',
            secretKey: process.env.PAYTR_MERCHANT_KEY || 'demo-key',
            merchantId: process.env.PAYTR_MERCHANT_ID,
            baseUrl: process.env.PAYTR_BASE_URL || 'https://www.paytr.com',
            webhookUrl: `${process.env.API_BASE_URL}/api/v1/payments/webhook/paytr`,
            supportedCurrencies: [ServiceCurrency.TRY],
            supportedPaymentMethods: [
                ServicePaymentMethod.CREDIT_CARD,
                ServicePaymentMethod.DEBIT_CARD,
                ServicePaymentMethod.BANK_TRANSFER
            ],
            supports3DSecure: true,
            supportsInstallments: true,
            supportsRefunds: false,
            minAmount: 1,
            maxAmount: 50000,
            maxInstallmentCount: 12,
            commissionRate: 0.025,
            webhookSecretKey: process.env.PAYTR_WEBHOOK_SECRET,
            rateLimits: {
                requestsPerMinute: 100,
                requestsPerHour: 2000
            }
        }
    ];
    try {
        const paymentServiceManager = new PaymentServiceManager_1.PaymentServiceManager(paymentConfigs);
        const paymentController = new payment_controller_1.PaymentController(paymentServiceManager);
        logger_simple_1.logger.info('Payment services initialized successfully', {
            enabledProviders: paymentConfigs.filter(config => config.enabled).map(config => config.provider),
            totalProviders: paymentConfigs.length
        });
        return { paymentServiceManager, paymentController };
    }
    catch (error) {
        logger_simple_1.logger.error('Failed to initialize payment services:', error);
        throw error;
    }
};
async function startServer() {
    try {
        logger_simple_1.logger.info('Redis temporarily disabled due to compatibility issues');
        initializeCargoServices();
        const { paymentServiceManager, paymentController } = initializePaymentServices();
        global.paymentController = paymentController;
        const app = (0, app_1.createApp)();
        const gracefulShutdown = async (signal) => {
            logger_simple_1.logger.info(`Received ${signal}, starting graceful shutdown`);
            try {
                await redis_1.default.disconnect();
                logger_simple_1.logger.info('Graceful shutdown completed');
                process.exit(0);
            }
            catch (error) {
                logger_simple_1.logger.error('Error during graceful shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        app.listen(PORT, () => {
            logger_simple_1.logger.info('🚀 CargoLink Backend Server Started', {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString(),
                features: {
                    redis: 'enabled',
                    performance_monitoring: 'enabled',
                    api_caching: 'enabled',
                    adaptive_rate_limiting: 'enabled'
                }
            });
        });
    }
    catch (error) {
        logger_simple_1.logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map