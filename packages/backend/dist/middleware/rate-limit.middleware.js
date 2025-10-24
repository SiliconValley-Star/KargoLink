"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.createRateLimit = exports.notificationRateLimit = exports.uploadRateLimit = exports.apiRateLimit = exports.passwordChangeRateLimit = exports.authRateLimit = exports.defaultRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.rateLimit = express_rate_limit_1.default;
const logger_1 = require("../config/logger");
const rateLimitHandler = (req, res) => {
    logger_1.logger.warn('Rate limit exceeded', {
        ip: req.ip,
        endpoint: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent')
    });
    res.status(429).json({
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
            retryAfter: 60
        }
    });
};
exports.defaultRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.userId || req.ip || 'unknown';
    }
});
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => req.ip || 'unknown'
});
exports.passwordChangeRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.userId || req.ip || 'unknown'
});
exports.apiRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.userId || req.ip || 'unknown'
});
exports.uploadRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.userId || req.ip || 'unknown'
});
exports.notificationRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.userId || req.ip || 'unknown'
});
const createRateLimit = (options = {}) => {
    return (0, express_rate_limit_1.default)({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: options.max || 100,
        message: options.message ?
            (req, res) => {
                logger_1.logger.warn('Rate limit exceeded', {
                    ip: req.ip,
                    endpoint: req.originalUrl,
                    method: req.method
                });
                res.status(429).json({
                    success: false,
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: options.message
                    }
                });
            } : rateLimitHandler,
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: options.skipSuccessfulRequests || false,
        keyGenerator: options.keyGenerator || ((req) => req.user?.userId || req.ip || 'unknown')
    });
};
exports.createRateLimit = createRateLimit;
exports.default = exports.defaultRateLimit;
//# sourceMappingURL=rate-limit.middleware.js.map