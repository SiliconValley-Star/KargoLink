import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { logger } from './config/logger.simple';
import redisService from './config/redis';
import { createApp } from './app';
// import { CargoController } from './controllers/cargo.controller'; // TEMPORARILY DISABLED
// import { PaymentController } from './controllers/payment.controller'; // TEMPORARILY DISABLED
import { PaymentServiceManager } from './services/payment/PaymentServiceManager';

const PORT = process.env.PORT || 3001;

// Define types and enums locally to avoid import issues
enum CargoServiceProvider {
  YURTICI = 'yurtici',
  ARAS = 'aras',
  MNG = 'mng'
}

enum CargoServiceType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  ECONOMY = 'economy',
  PREMIUM = 'premium'
}

enum ServicePaymentProvider {
  IYZICO = 'iyzico',
  PAYTR = 'paytr'
}

enum ServicePaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  DIGITAL_WALLET = 'digital_wallet',
  BANK_TRANSFER = 'bank_transfer'
}

enum ServiceCurrency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR'
}

interface CargoServiceConfig {
  provider: CargoServiceProvider;
  name: string;
  apiEndpoint: string;
  apiUrl: string; // Added missing field
  apiKey: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  sandbox: boolean;
  enabled: boolean;
  timeout: number; // Added missing field
  retryAttempts: number; // Added missing field
  supportedServices: CargoServiceType[];
  supportedCountries: string[];
  maxWeight: number;
  maxDimensions: {
    width: number;
    height: number;
    length: number;
  };
  features: {
    tracking: boolean;
    insurance: boolean;
    cod: boolean;
    signature: boolean;
    weekendDelivery: boolean;
  };
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

interface PaymentServiceConfig {
  provider: ServicePaymentProvider;
  name: string;
  enabled: boolean;
  sandbox: boolean;
  apiKey: string;
  secretKey: string;
  merchantId?: string;
  baseUrl: string;
  webhookUrl?: string;
  supportedCurrencies: ServiceCurrency[];
  supportedPaymentMethods: ServicePaymentMethod[];
  supports3DSecure: boolean;
  supportsInstallments: boolean;
  supportsRefunds: boolean;
  minAmount: number;
  maxAmount: number;
  maxInstallmentCount: number;
  commissionRate: number;
  webhookSecretKey?: string;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

// Initialize Cargo Services
const initializeCargoServices = () => {
  const cargoConfigs: CargoServiceConfig[] = [
    // Yurtiçi Kargo Configuration
    {
      provider: CargoServiceProvider.YURTICI,
      name: 'Yurtiçi Kargo',
      apiEndpoint: process.env.YURTICI_API_ENDPOINT || 'https://api.yurticikargo.com',
      apiUrl: process.env.YURTICI_API_ENDPOINT || 'https://api.yurticikargo.com',
      apiKey: process.env.YURTICI_API_KEY || 'demo-key',
      apiSecret: process.env.YURTICI_API_SECRET,
      sandbox: process.env.NODE_ENV !== 'production',
      enabled: process.env.YURTICI_ENABLED === 'true',
      timeout: 30000, // 30 seconds
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
    // Aras Kargo Configuration
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
    // MNG Kargo Configuration
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
    // CargoController.initialize(cargoConfigs); // TEMPORARILY DISABLED
    logger.info('Cargo services initialization temporarily disabled');
  } catch (error) {
    logger.error('Failed to initialize cargo services:', error);
  }
};

// Initialize Payment Services
// TEMPORARILY DISABLED - Payment services initialization
const initializePaymentServices = (): { paymentServiceManager: any; paymentController: any } => {
  const paymentConfigs: PaymentServiceConfig[] = [
    // İyzico Configuration
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
      commissionRate: 0.029, // 2.9%
      webhookSecretKey: process.env.IYZICO_WEBHOOK_SECRET,
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 1000
      }
    },
    // PayTR Configuration
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
      supportsRefunds: false, // PayTR refunds are manual
      minAmount: 1,
      maxAmount: 50000,
      maxInstallmentCount: 12,
      commissionRate: 0.025, // 2.5%
      webhookSecretKey: process.env.PAYTR_WEBHOOK_SECRET,
      rateLimits: {
        requestsPerMinute: 100,
        requestsPerHour: 2000
      }
    }
  ];

  try {
    // const paymentServiceManager = new PaymentServiceManager(paymentConfigs);
    // const paymentController = new PaymentController(paymentServiceManager);
    
    logger.info('Payment services temporarily disabled during recovery');
    
    return { paymentServiceManager: null, paymentController: null };
  } catch (error) {
    logger.error('Failed to initialize payment services:', error);
    throw error;
  }
};

// Start application
async function startServer() {
  try {
    // Skip Redis initialization temporarily due to Node.js v20 compatibility issues
    logger.info('Redis temporarily disabled due to compatibility issues');

    // Initialize cargo services
    initializeCargoServices();
    logger.info('Cargo services initialized successfully');

    // Initialize payment services
    const { paymentServiceManager, paymentController } = initializePaymentServices();
    (global as any).paymentController = paymentController;
    logger.info('Payment services initialized successfully');

    // Create Express app with all middleware
    const app = createApp();

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown`);
      try {
        // Close Redis connection
        await redisService.disconnect();
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Start server
    app.listen(PORT, () => {
      logger.info('🚀 CargoLink Backend Server Started', {
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

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();