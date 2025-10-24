"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerHelpers = exports.integrationLogger = exports.securityLogger = exports.paymentLogger = exports.dbLogger = exports.httpLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const environment_1 = require("../config/environment");
const developmentFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.prettyPrint(), winston_1.default.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const stackString = stack ? `\n${stack}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}${stackString}`;
}));
const productionFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const logger = winston_1.default.createLogger({
    level: environment_1.config.monitoring.logLevel,
    format: environment_1.config.nodeEnv === 'production' ? productionFormat : developmentFormat,
    defaultMeta: {
        service: 'cargolink-api',
        environment: environment_1.config.nodeEnv,
    },
    transports: [
        new winston_1.default.transports.Console({
            silent: environment_1.config.nodeEnv === 'test',
        }),
        ...(environment_1.config.nodeEnv === 'production' ? [
            new winston_1.default.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                maxsize: 5242880,
                maxFiles: 5,
            }),
            new winston_1.default.transports.File({
                filename: 'logs/combined.log',
                maxsize: 5242880,
                maxFiles: 10,
            }),
        ] : []),
        ...(environment_1.config.nodeEnv !== 'test' ? [
            new winston_1.default.transports.File({
                filename: 'logs/app.log',
                maxsize: 5242880,
                maxFiles: 5,
            }),
        ] : []),
    ],
    exceptionHandlers: environment_1.config.nodeEnv === 'production' ? [
        new winston_1.default.transports.File({ filename: 'logs/exceptions.log' }),
        new winston_1.default.transports.Console(),
    ] : [
        new winston_1.default.transports.Console(),
    ],
    rejectionHandlers: environment_1.config.nodeEnv === 'production' ? [
        new winston_1.default.transports.File({ filename: 'logs/rejections.log' }),
        new winston_1.default.transports.Console(),
    ] : [
        new winston_1.default.transports.Console(),
    ],
    exitOnError: false,
});
exports.httpLogger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: {
        service: 'cargolink-api',
        type: 'http-request',
    },
    transports: [
        new winston_1.default.transports.File({
            filename: 'logs/http-requests.log',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
exports.dbLogger = winston_1.default.createLogger({
    level: 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: {
        service: 'cargolink-api',
        type: 'database-query',
    },
    transports: [
        ...(environment_1.config.nodeEnv === 'development' ? [
            new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
            }),
        ] : []),
        new winston_1.default.transports.File({
            filename: 'logs/database.log',
            maxsize: 5242880,
            maxFiles: 3,
        }),
    ],
});
exports.paymentLogger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: {
        service: 'cargolink-api',
        type: 'payment-transaction',
    },
    transports: [
        new winston_1.default.transports.File({
            filename: 'logs/payments.log',
            maxsize: 10485760,
            maxFiles: 10,
        }),
    ],
});
exports.securityLogger = winston_1.default.createLogger({
    level: 'warn',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: {
        service: 'cargolink-api',
        type: 'security-event',
    },
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({
            filename: 'logs/security.log',
            maxsize: 10485760,
            maxFiles: 10,
        }),
    ],
});
exports.integrationLogger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: {
        service: 'cargolink-api',
        type: 'external-integration',
    },
    transports: [
        new winston_1.default.transports.File({
            filename: 'logs/integrations.log',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
exports.loggerHelpers = {
    logRequest: (req, res, responseTime) => {
        exports.httpLogger.info('HTTP Request', {
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
    logDbOperation: (operation, table, duration, userId) => {
        exports.dbLogger.debug('Database Operation', {
            operation,
            table,
            duration,
            userId,
        });
    },
    logPayment: (transactionId, amount, currency, userId, status) => {
        exports.paymentLogger.info('Payment Transaction', {
            transactionId,
            amount,
            currency,
            userId,
            status,
            timestamp: new Date().toISOString(),
        });
    },
    logSecurityEvent: (event, userId, ip, details) => {
        exports.securityLogger.warn('Security Event', {
            event,
            userId,
            ip,
            details,
            timestamp: new Date().toISOString(),
        });
    },
    logIntegration: (provider, endpoint, method, statusCode, duration, success) => {
        exports.integrationLogger.info('External API Call', {
            provider,
            endpoint,
            method,
            statusCode,
            duration,
            success,
            timestamp: new Date().toISOString(),
        });
    },
    logUserAction: (userId, action, resource, details) => {
        logger.info('User Action', {
            userId,
            action,
            resource,
            details,
            timestamp: new Date().toISOString(),
        });
    },
    logSystemEvent: (event, details) => {
        logger.info('System Event', {
            event,
            details,
            timestamp: new Date().toISOString(),
        });
    }
};
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
exports.default = logger;
//# sourceMappingURL=logger.js.map