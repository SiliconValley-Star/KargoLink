"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsMiddleware = exports.requestLogger = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../config/logger");
const requestLogger = (req, res, next) => {
    const extReq = req;
    extReq.id = (0, uuid_1.v4)();
    extReq.startTime = Date.now();
    res.setHeader('X-Request-ID', extReq.id);
    logger_1.logger.info('Request started', {
        requestId: extReq.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length'),
    });
    const originalEnd = res.end;
    res.end = function (chunk, encoding, callback) {
        const responseTime = Date.now() - extReq.startTime;
        logger_1.logger.info('Request completed', {
            requestId: extReq.id,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime,
            ip: req.ip,
        });
        return originalEnd.call(this, chunk, encoding, callback);
    };
    next();
};
exports.requestLogger = requestLogger;
const metricsMiddleware = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const endpoint = `${req.method} ${req.route?.path || req.path}`;
        logger_1.logger.info('API Metrics', {
            endpoint,
            statusCode: res.statusCode,
            duration,
            contentLength: res.get('content-length'),
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });
    });
    next();
};
exports.metricsMiddleware = metricsMiddleware;
exports.default = exports.requestLogger;
//# sourceMappingURL=requestLogger.js.map