"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetRateLimiter = exports.uploadRateLimiter = exports.apiRateLimiter = exports.authRateLimiter = exports.strictRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const environment_1 = require("../config/environment");
const logger_1 = require("../config/logger");
const rateLimitHandler = (req, res) => {
    logger_1.logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
    });
    res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.round(environment_1.config.rateLimit.windowMs / 1000),
        timestamp: new Date().toISOString(),
    });
};
const skipRateLimit = (req) => {
    if (environment_1.config.nodeEnv === 'test') {
        return true;
    }
    if (!environment_1.config.features.rateLimiting) {
        return true;
    }
    if (req.path === '/health' || req.path === '/api') {
        return true;
    }
    return false;
};
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: environment_1.config.rateLimit.windowMs,
    max: environment_1.config.rateLimit.maxRequests,
    message: rateLimitHandler,
    skip: skipRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const user = req.user;
        return user?.id || req.ip;
    },
});
exports.strictRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: rateLimitHandler,
    skip: skipRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: (req, res) => {
        logger_1.logger.warn('Auth rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
        });
        res.status(429).json({
            success: false,
            error: 'Too many authentication attempts, please try again later',
            retryAfter: Math.round(15 * 60),
            timestamp: new Date().toISOString(),
        });
    },
    skip: skipRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 60,
    message: rateLimitHandler,
    skip: skipRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const apiKey = req.get('X-API-Key');
        return apiKey || req.ip || 'unknown';
    },
});
exports.uploadRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: rateLimitHandler,
    skip: skipRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const user = req.user;
        return user?.id || req.ip;
    },
});
exports.passwordResetRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: (req, res) => {
        logger_1.logger.warn('Password reset rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            email: req.body.email,
        });
        res.status(429).json({
            success: false,
            error: 'Too many password reset attempts, please try again later',
            retryAfter: Math.round(60 * 60),
            timestamp: new Date().toISOString(),
        });
    },
    skip: skipRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.default = exports.rateLimiter;
//# sourceMappingURL=rateLimiter.js.map