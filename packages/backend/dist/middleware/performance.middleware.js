"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptiveRateLimit = exports.performanceHealthCheck = exports.getSystemMetrics = exports.getPerformanceStats = exports.performanceMonitor = void 0;
const logger_1 = require("../config/logger");
const redis_1 = __importDefault(require("../config/redis"));
const performanceMonitor = (config = {}) => {
    const { logSlowRequests = true, slowRequestThreshold = 1000, enableMetrics = true, enableCaching = true, sampleRate = 1.0 } = config;
    return (req, res, next) => {
        const startTime = Date.now();
        const startCpuUsage = process.cpuUsage();
        const startMemory = process.memoryUsage();
        if (Math.random() > sampleRate) {
            return next();
        }
        const originalEnd = res.end;
        res.end = function (chunk, encoding) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const endCpuUsage = process.cpuUsage(startCpuUsage);
            const endMemory = process.memoryUsage();
            const metrics = {
                responseTime,
                memoryUsage: {
                    rss: endMemory.rss - startMemory.rss,
                    heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    external: endMemory.external - startMemory.external,
                    arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
                },
                cpuUsage: endCpuUsage,
                statusCode: res.statusCode,
                method: req.method,
                path: req.path,
                timestamp: endTime,
                userId: req.user?.id,
                userAgent: req.get('User-Agent'),
                ip: req.ip || req.connection.remoteAddress || 'unknown'
            };
            if (logSlowRequests && responseTime > slowRequestThreshold) {
                logger_1.logger.warn('Slow request detected', {
                    ...metrics,
                    threshold: slowRequestThreshold
                });
            }
            if (enableMetrics) {
                storeMetrics(metrics, enableCaching);
            }
            res.set({
                'X-Response-Time': `${responseTime}ms`,
                'X-Memory-Usage': `${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`,
                'X-CPU-Time': `${Math.round(endCpuUsage.user / 1000)}ms`
            });
            return originalEnd.call(this, chunk, encoding);
        };
        next();
    };
};
exports.performanceMonitor = performanceMonitor;
const storeMetrics = async (metrics, enableCaching) => {
    try {
        const metricsKey = `metrics:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
        if (enableCaching) {
            await redis_1.default.set(metricsKey, metrics, { ttl: 3600, tags: ['metrics'] });
        }
        logger_1.logger.info('Performance metrics', metrics);
        await updateAggregatedStats(metrics, enableCaching);
    }
    catch (error) {
        logger_1.logger.error('Failed to store performance metrics:', error);
    }
};
const updateAggregatedStats = async (metrics, enableCaching) => {
    if (!enableCaching)
        return;
    try {
        const hourKey = `stats:${new Date().getHours()}`;
        const pathKey = `stats:path:${metrics.path}`;
        const userKey = metrics.userId ? `stats:user:${metrics.userId}` : null;
        const hourlyStats = await redis_1.default.get(hourKey) || {
            requests: 0,
            totalResponseTime: 0,
            avgResponseTime: 0,
            slowRequests: 0,
            errors: 0
        };
        hourlyStats.requests++;
        hourlyStats.totalResponseTime += metrics.responseTime;
        hourlyStats.avgResponseTime = hourlyStats.totalResponseTime / hourlyStats.requests;
        if (metrics.responseTime > 1000)
            hourlyStats.slowRequests++;
        if (metrics.statusCode >= 400)
            hourlyStats.errors++;
        await redis_1.default.set(hourKey, hourlyStats, { ttl: 7200, tags: ['stats', 'hourly'] });
        const pathStats = await redis_1.default.get(pathKey) || {
            requests: 0,
            totalResponseTime: 0,
            avgResponseTime: 0,
            minResponseTime: Infinity,
            maxResponseTime: 0
        };
        pathStats.requests++;
        pathStats.totalResponseTime += metrics.responseTime;
        pathStats.avgResponseTime = pathStats.totalResponseTime / pathStats.requests;
        pathStats.minResponseTime = Math.min(pathStats.minResponseTime, metrics.responseTime);
        pathStats.maxResponseTime = Math.max(pathStats.maxResponseTime, metrics.responseTime);
        await redis_1.default.set(pathKey, pathStats, { ttl: 86400, tags: ['stats', 'paths'] });
        if (userKey) {
            const userStats = await redis_1.default.get(userKey) || {
                requests: 0,
                totalResponseTime: 0,
                avgResponseTime: 0
            };
            userStats.requests++;
            userStats.totalResponseTime += metrics.responseTime;
            userStats.avgResponseTime = userStats.totalResponseTime / userStats.requests;
            await redis_1.default.set(userKey, userStats, { ttl: 86400, tags: ['stats', 'users'] });
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to update aggregated stats:', error);
    }
};
const getPerformanceStats = async (timeframe = 'hour') => {
    try {
        const currentHour = new Date().getHours();
        const stats = {
            current: {},
            historical: [],
            paths: {},
            summary: {}
        };
        if (timeframe === 'hour') {
            stats.current = await redis_1.default.get(`stats:${currentHour}`) || {};
            for (let i = 0; i < 24; i++) {
                const hour = (currentHour - i + 24) % 24;
                const hourStats = await redis_1.default.get(`stats:${hour}`) || {};
                stats.historical.push({ hour, ...hourStats });
            }
        }
        const pathKeys = await redis_1.default.keys('stats:path:*');
        const pathStatsPromises = pathKeys.map(async (key) => {
            const pathStats = await redis_1.default.get(key);
            const path = key.replace('stats:path:', '');
            return { path, ...pathStats };
        });
        const pathStats = await Promise.all(pathStatsPromises);
        stats.paths = pathStats
            .filter((p) => p.requests > 0)
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 10);
        const totalRequests = pathStats.reduce((sum, p) => sum + (p.requests || 0), 0);
        const totalResponseTime = pathStats.reduce((sum, p) => sum + (p.totalResponseTime || 0), 0);
        const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
        stats.summary = {
            totalRequests,
            avgResponseTime: Math.round(avgResponseTime * 100) / 100,
            pathCount: pathStats.length
        };
        return stats;
    }
    catch (error) {
        logger_1.logger.error('Failed to get performance stats:', error);
        return null;
    }
};
exports.getPerformanceStats = getPerformanceStats;
const getSystemMetrics = () => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    return {
        timestamp: Date.now(),
        uptime: process.uptime(),
        memory: {
            rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
            external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
            heapUsagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
        },
        cpu: {
            user: Math.round(cpuUsage.user / 1000),
            system: Math.round(cpuUsage.system / 1000)
        }
    };
};
exports.getSystemMetrics = getSystemMetrics;
const performanceHealthCheck = async () => {
    const systemMetrics = (0, exports.getSystemMetrics)();
    const stats = await (0, exports.getPerformanceStats)('hour');
    const thresholds = {
        memory: 80,
        avgResponseTime: 2000,
        errorRate: 5
    };
    const health = {
        status: 'healthy',
        checks: {
            memory: {
                status: systemMetrics.memory.heapUsagePercent < thresholds.memory ? 'ok' : 'warning',
                value: systemMetrics.memory.heapUsagePercent,
                threshold: thresholds.memory
            },
            avgResponseTime: {
                status: (stats?.current?.avgResponseTime || 0) < thresholds.avgResponseTime ? 'ok' : 'warning',
                value: stats?.current?.avgResponseTime || 0,
                threshold: thresholds.avgResponseTime
            },
            errorRate: {
                status: 'ok',
                value: 0,
                threshold: thresholds.errorRate
            }
        },
        systemMetrics,
        stats: stats?.current || {}
    };
    if (stats?.current?.requests > 0) {
        const errorRate = ((stats.current.errors || 0) / stats.current.requests) * 100;
        health.checks.errorRate.value = errorRate;
        health.checks.errorRate.status = errorRate < thresholds.errorRate ? 'ok' : 'warning';
    }
    const hasWarnings = Object.values(health.checks).some(check => check.status === 'warning');
    const hasCritical = Object.values(health.checks).some(check => check.status === 'critical');
    if (hasCritical) {
        health.status = 'critical';
    }
    else if (hasWarnings) {
        health.status = 'warning';
    }
    return health;
};
exports.performanceHealthCheck = performanceHealthCheck;
const adaptiveRateLimit = (config = {}) => {
    const { maxResponseTime = 10000, maxCpuUsage = 90, maxMemoryUsage = process.env.NODE_ENV === 'development' ? 98 : 85 } = config;
    return async (req, res, next) => {
        try {
            const systemMetrics = (0, exports.getSystemMetrics)();
            const recentStats = await (0, exports.getPerformanceStats)('hour');
            const isHighMemory = systemMetrics.memory.heapUsagePercent > maxMemoryUsage;
            const isSlowResponse = (recentStats?.current?.avgResponseTime || 0) > maxResponseTime;
            if (isHighMemory || isSlowResponse) {
                logger_1.logger.warn('System under stress, applying adaptive rate limiting', {
                    memoryUsage: systemMetrics.memory.heapUsagePercent,
                    avgResponseTime: recentStats?.current?.avgResponseTime,
                    thresholds: { maxMemoryUsage, maxResponseTime }
                });
                res.status(503).set({
                    'Retry-After': '60',
                    'X-Rate-Limit-Reason': 'system-overload'
                }).json({
                    error: 'Service temporarily unavailable due to high load',
                    retryAfter: 60
                });
                return;
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Adaptive rate limit error:', error);
            next();
        }
    };
};
exports.adaptiveRateLimit = adaptiveRateLimit;
exports.default = {
    performanceMonitor: exports.performanceMonitor,
    getPerformanceStats: exports.getPerformanceStats,
    getSystemMetrics: exports.getSystemMetrics,
    performanceHealthCheck: exports.performanceHealthCheck,
    adaptiveRateLimit: exports.adaptiveRateLimit
};
//# sourceMappingURL=performance.middleware.js.map