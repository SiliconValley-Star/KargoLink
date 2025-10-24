"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.healthRoutes = router;
const prisma = new client_1.PrismaClient();
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
router.get('/health', async (req, res) => {
    try {
        const startTime = Date.now();
        const dbStartTime = Date.now();
        await prisma.$queryRaw `SELECT 1`;
        const dbResponseTime = Date.now() - dbStartTime;
        const redisStartTime = Date.now();
        let redisStatus = {
            status: 'healthy',
            response_time_ms: 0
        };
        try {
            await redisClient.ping();
            redisStatus.response_time_ms = Date.now() - redisStartTime;
        }
        catch (error) {
            redisStatus = {
                status: 'unhealthy',
                response_time_ms: Date.now() - redisStartTime,
                error: 'Redis connection failed'
            };
        }
        const totalResponseTime = Date.now() - startTime;
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            response_time_ms: totalResponseTime,
            services: {
                database: {
                    status: 'healthy',
                    response_time_ms: dbResponseTime
                },
                redis: redisStatus
            }
        });
    }
    catch (error) {
        logger_1.dbLogger.error('Health check failed', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Service unavailable'
        });
    }
});
router.get('/health/detailed', async (req, res) => {
    const startTime = Date.now();
    try {
        const dbHealth = await checkDatabaseHealth();
        const redisHealth = await checkRedisHealth();
        const storageHealth = await checkStorageHealth();
        const externalApisHealth = await checkExternalAPIsHealth();
        const metrics = await getSystemMetrics();
        const services = {
            database: dbHealth,
            redis: redisHealth,
            storage: storageHealth,
            external_apis: externalApisHealth
        };
        const unhealthyServices = Object.values(services).filter(service => service.status === 'unhealthy');
        let overallStatus = 'healthy';
        if (unhealthyServices.length > 0) {
            overallStatus = unhealthyServices.length >= 2 ? 'unhealthy' : 'degraded';
        }
        const healthStatus = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            services,
            metrics
        };
        const statusCode = overallStatus === 'healthy' ? 200 :
            overallStatus === 'degraded' ? 200 : 503;
        res.status(statusCode).json(healthStatus);
    }
    catch (error) {
        logger_1.dbLogger.error('Detailed health check failed', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});
async function checkDatabaseHealth() {
    const startTime = Date.now();
    try {
        await prisma.$queryRaw `SELECT 1`;
        await prisma.user.count();
        await prisma.shipment.count();
        return {
            status: 'healthy',
            response_time_ms: Date.now() - startTime
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            response_time_ms: Date.now() - startTime,
            error: 'Database connection failed'
        };
    }
}
async function checkRedisHealth() {
    const startTime = Date.now();
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        await redisClient.ping();
        const testKey = `health_check_${Date.now()}`;
        await redisClient.set(testKey, 'test', { EX: 5 });
        const value = await redisClient.get(testKey);
        if (value !== 'test') {
            throw new Error('Redis set/get test failed');
        }
        await redisClient.del(testKey);
        return {
            status: 'healthy',
            response_time_ms: Date.now() - startTime
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            response_time_ms: Date.now() - startTime,
            error: 'Redis health check failed'
        };
    }
}
async function checkStorageHealth() {
    const startTime = Date.now();
    try {
        if (process.env.AWS_BUCKET_NAME) {
            const hasCredentials = process.env.AWS_ACCESS_KEY_ID &&
                process.env.AWS_SECRET_ACCESS_KEY;
            if (!hasCredentials) {
                throw new Error('S3 credentials not configured');
            }
        }
        return {
            status: 'healthy',
            response_time_ms: Date.now() - startTime
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            response_time_ms: Date.now() - startTime,
            error: 'Storage health check failed'
        };
    }
}
async function checkExternalAPIsHealth() {
    const startTime = Date.now();
    try {
        const promises = [];
        if (process.env.IYZICO_API_KEY) {
            promises.push(testIyzicoConnection());
        }
        if (process.env.PAYTR_MERCHANT_ID) {
            promises.push(testPayTRConnection());
        }
        promises.push(testCargoAPIsConnection());
        const results = await Promise.allSettled(promises);
        const failures = results.filter(result => result.status === 'rejected');
        if (failures.length > results.length / 2) {
            throw new Error(`${failures.length}/${results.length} external APIs failed`);
        }
        return {
            status: failures.length === 0 ? 'healthy' : 'healthy',
            response_time_ms: Date.now() - startTime
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            response_time_ms: Date.now() - startTime,
            error: 'External APIs health check failed'
        };
    }
}
async function getSystemMetrics() {
    const memUsage = process.memoryUsage();
    return {
        memory_usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
        cpu_usage: 0,
        active_connections: 0,
        total_requests: 0,
        error_rate: 0
    };
}
async function testIyzicoConnection() {
    return Promise.resolve();
}
async function testPayTRConnection() {
    return Promise.resolve();
}
async function testCargoAPIsConnection() {
    return Promise.resolve();
}
router.get('/ready', async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        await redisClient.ping();
        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'not_ready',
            timestamp: new Date().toISOString(),
            error: 'Service not ready'
        });
    }
});
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
router.get('/metrics', async (req, res) => {
    try {
        const metrics = await getSystemMetrics();
        const dbCount = await prisma.shipment.count();
        const userCount = await prisma.user.count();
        const prometheusMetrics = `
# HELP cargolink_uptime_seconds Application uptime in seconds
# TYPE cargolink_uptime_seconds counter
cargolink_uptime_seconds ${process.uptime()}

# HELP cargolink_memory_usage_percent Memory usage percentage
# TYPE cargolink_memory_usage_percent gauge
cargolink_memory_usage_percent ${metrics.memory_usage}

# HELP cargolink_total_shipments Total number of shipments
# TYPE cargolink_total_shipments gauge
cargolink_total_shipments ${dbCount}

# HELP cargolink_total_users Total number of users
# TYPE cargolink_total_users gauge
cargolink_total_users ${userCount}

# HELP cargolink_build_info Build information
# TYPE cargolink_build_info gauge
cargolink_build_info{version="${process.env.npm_package_version || '1.0.0'}",environment="${process.env.NODE_ENV || 'development'}"} 1
`;
        res.set('Content-Type', 'text/plain');
        res.send(prometheusMetrics.trim());
    }
    catch (error) {
        logger_1.dbLogger.error('Metrics endpoint error', error);
        res.status(500).send('# Error generating metrics');
    }
});
//# sourceMappingURL=health.routes.js.map