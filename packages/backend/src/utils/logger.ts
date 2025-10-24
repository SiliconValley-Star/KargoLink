import winston from 'winston';
import { config } from '../config/environment';

/**
 * Custom log format for development
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const stackString = stack ? `\n${stack}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}${stackString}`;
  })
);

/**
 * Production log format
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: config.monitoring.logLevel,
  format: config.nodeEnv === 'production' ? productionFormat : developmentFormat,
  defaultMeta: {
    service: 'cargolink-api',
    environment: config.nodeEnv,
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      silent: config.nodeEnv === 'test',
    }),
    
    // File transports for production
    ...(config.nodeEnv === 'production' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 10,
      }),
    ] : []),
    
    // File transport for all environments except test
    ...(config.nodeEnv !== 'test' ? [
      new winston.transports.File({
        filename: 'logs/app.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ] : []),
  ],
  
  // Handle uncaught exceptions and rejections
  exceptionHandlers: config.nodeEnv === 'production' ? [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
    new winston.transports.Console(),
  ] : [
    new winston.transports.Console(),
  ],
  
  rejectionHandlers: config.nodeEnv === 'production' ? [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
    new winston.transports.Console(),
  ] : [
    new winston.transports.Console(),
  ],
  
  exitOnError: false,
});

/**
 * HTTP request logger
 */
export const httpLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'cargolink-api',
    type: 'http-request',
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/http-requests.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Database query logger
 */
export const dbLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'cargolink-api',
    type: 'database-query',
  },
  transports: [
    ...(config.nodeEnv === 'development' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ] : []),
    new winston.transports.File({
      filename: 'logs/database.log',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

/**
 * Payment transaction logger (for audit purposes)
 */
export const paymentLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'cargolink-api',
    type: 'payment-transaction',
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/payments.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

/**
 * Security events logger
 */
export const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'cargolink-api',
    type: 'security-event',
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/security.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

/**
 * Integration logger for external API calls
 */
export const integrationLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'cargolink-api',
    type: 'external-integration',
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/integrations.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Helper functions for structured logging
 */
export const loggerHelpers = {
  /**
   * Log HTTP request
   */
  logRequest: (req: any, res: any, responseTime: number) => {
    httpLogger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      responseTime,
      userId: req.user?.id,
      requestId: req.id,
    });
  },

  /**
   * Log database operation
   */
  logDbOperation: (operation: string, table: string, duration: number, userId?: string) => {
    dbLogger.debug('Database Operation', {
      operation,
      table,
      duration,
      userId,
    });
  },

  /**
   * Log payment transaction
   */
  logPayment: (transactionId: string, amount: number, currency: string, userId: string, status: string) => {
    paymentLogger.info('Payment Transaction', {
      transactionId,
      amount,
      currency,
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log security event
   */
  logSecurityEvent: (event: string, userId?: string, ip?: string, details?: any) => {
    securityLogger.warn('Security Event', {
      event,
      userId,
      ip,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log external API call
   */
  logIntegration: (provider: string, endpoint: string, method: string, statusCode: number, duration: number, success: boolean) => {
    integrationLogger.info('External API Call', {
      provider,
      endpoint,
      method,
      statusCode,
      duration,
      success,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log user action for audit trail
   */
  logUserAction: (userId: string, action: string, resource: string, details?: any) => {
    logger.info('User Action', {
      userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log system event
   */
  logSystemEvent: (event: string, details?: any) => {
    logger.info('System Event', {
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  }
};

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;