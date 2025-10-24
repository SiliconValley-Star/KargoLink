"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logger_simple_1 = require("./config/logger.simple");
const routes_1 = require("./routes");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const performance_middleware_1 = require("./middleware/performance.middleware");
const cache_middleware_1 = require("./middleware/cache.middleware");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    const corsOptions = {
        origin: process.env.CORS_ORIGIN?.split(',') || [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
        maxAge: 86400
    };
    app.use((0, cors_1.default)(corsOptions));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use((0, compression_1.default)());
    if (process.env.NODE_ENV !== 'test') {
        app.use((0, performance_middleware_1.performanceMonitor)({
            logSlowRequests: true,
            slowRequestThreshold: 2000,
            enableMetrics: true,
            enableCaching: true,
            sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
        }));
    }
    if (process.env.NODE_ENV !== 'test') {
        app.use((0, morgan_1.default)('combined', { stream: logger_simple_1.loggerStream }));
        app.use(requestLogger_1.requestLogger);
    }
    if (process.env.NODE_ENV !== 'test') {
        app.use((0, performance_middleware_1.adaptiveRateLimit)({
            maxResponseTime: 10000
        }));
    }
    if (process.env.NODE_ENV !== 'test') {
        app.use('/api/', rateLimiter_1.rateLimiter);
    }
    app.get('/health', async (req, res) => {
        try {
            const performanceHealth = await (0, performance_middleware_1.performanceHealthCheck)();
            const cacheHealth = await (0, cache_middleware_1.cacheHealthCheck)();
            const health = {
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0',
                services: {
                    performance: performanceHealth,
                    cache: cacheHealth
                }
            };
            if (performanceHealth.status === 'critical') {
                health.status = 'CRITICAL';
                res.status(503);
            }
            else if (performanceHealth.status === 'warning' || !cacheHealth.connected) {
                health.status = 'WARNING';
                res.status(200);
            }
            res.json(health);
        }
        catch (error) {
            logger_simple_1.logger.error('Health check error:', error);
            res.status(503).json({
                status: 'ERROR',
                timestamp: new Date().toISOString(),
                error: 'Health check failed'
            });
        }
    });
    app.get('/metrics', async (req, res) => {
        try {
            const timeframe = req.query.timeframe || 'hour';
            const performanceStats = await (0, performance_middleware_1.getPerformanceStats)(timeframe);
            const systemMetrics = (0, performance_middleware_1.getSystemMetrics)();
            const cacheHealth = await (0, cache_middleware_1.cacheHealthCheck)();
            res.json({
                performance: performanceStats,
                system: systemMetrics,
                cache: cacheHealth,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_simple_1.logger.error('Metrics endpoint error:', error);
            res.status(500).json({
                error: 'Failed to retrieve metrics'
            });
        }
    });
    app.use('/api/v1', routes_1.apiRoutes);
    app.get('/api/test', (req, res) => {
        res.json({
            success: true,
            data: {
                message: 'CargoLink Backend API is running!',
                timestamp: new Date().toISOString()
            }
        });
    });
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: `Route ${req.originalUrl} not found`
            }
        });
    });
    app.use(errorHandler_1.errorHandler);
    return app;
}
exports.default = createApp;
//# sourceMappingURL=app.js.map