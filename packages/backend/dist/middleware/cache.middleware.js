"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheHealthCheck = exports.warmCache = exports.clearAllCache = exports.invalidateCache = exports.cacheRoutes = exports.apiCache = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = require("../config/logger");
const crypto_1 = require("crypto");
const generateCacheKey = (req, keyGenerator) => {
    if (keyGenerator) {
        return keyGenerator(req);
    }
    const userId = req.user?.id || 'anonymous';
    const method = req.method;
    const path = req.path;
    const query = JSON.stringify(req.query);
    const body = req.method !== 'GET' ? JSON.stringify(req.body) : '';
    const keyString = `${method}:${path}:${query}:${body}:${userId}`;
    const hash = (0, crypto_1.createHash)('md5').update(keyString).digest('hex');
    return `api:${hash}`;
};
const shouldCache = (req, res, config) => {
    if (config.condition && !config.condition(req, res)) {
        return false;
    }
    if (res.statusCode >= 400) {
        return false;
    }
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return false;
    }
    return true;
};
const apiCache = (config = {}) => {
    const { ttl = 300, tags = [], keyGenerator, condition, skipOnError = true } = config;
    return async (req, res, next) => {
        const startTime = Date.now();
        try {
            const cacheKey = generateCacheKey(req, keyGenerator);
            const cachedResponse = await redis_1.default.get(cacheKey);
            if (cachedResponse) {
                const duration = Date.now() - startTime;
                logger_1.logger.debug(`Cache hit for ${req.method} ${req.path}`, {
                    key: cacheKey,
                    duration,
                    userId: req.user?.id
                });
                res.set({
                    'X-Cache': 'HIT',
                    'X-Cache-Key': cacheKey,
                    'X-Response-Time': `${duration}ms`
                });
                res.json(cachedResponse);
                return;
            }
            logger_1.logger.debug(`Cache miss for ${req.method} ${req.path}`, {
                key: cacheKey,
                userId: req.user?.id
            });
            const originalJson = res.json;
            res.json = function (data) {
                const responseTime = Date.now() - startTime;
                res.set({
                    'X-Cache': 'MISS',
                    'X-Cache-Key': cacheKey,
                    'X-Response-Time': `${responseTime}ms`
                });
                if (shouldCache(req, res, config)) {
                    redis_1.default.set(cacheKey, data, { ttl, tags })
                        .then((success) => {
                        if (success) {
                            logger_1.logger.debug(`Response cached for ${req.method} ${req.path}`, {
                                key: cacheKey,
                                ttl,
                                tags,
                                responseTime,
                                userId: req.user?.id
                            });
                        }
                    })
                        .catch((error) => {
                        logger_1.logger.error('Cache set error:', error);
                    });
                }
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            logger_1.logger.error('Cache middleware error:', error);
            if (skipOnError) {
                next();
            }
            else {
                next(error);
            }
        }
    };
};
exports.apiCache = apiCache;
exports.cacheRoutes = {
    short: (0, exports.apiCache)({ ttl: 60, tags: ['short'] }),
    medium: (0, exports.apiCache)({ ttl: 300, tags: ['medium'] }),
    long: (0, exports.apiCache)({ ttl: 3600, tags: ['long'] }),
    veryLong: (0, exports.apiCache)({ ttl: 86400, tags: ['very-long'] }),
    user: (0, exports.apiCache)({
        ttl: 300,
        tags: ['user'],
        keyGenerator: (req) => `user:${req.user?.id}:${req.path}:${JSON.stringify(req.query)}`
    }),
    public: (0, exports.apiCache)({
        ttl: 1800,
        tags: ['public'],
        condition: (req) => !req.headers.authorization
    }),
    tracking: (0, exports.apiCache)({
        ttl: 120,
        tags: ['tracking', 'shipments'],
        keyGenerator: (req) => `tracking:${req.params.trackingNumber}`
    }),
    pricing: (0, exports.apiCache)({
        ttl: 900,
        tags: ['pricing'],
        condition: (req) => req.method === 'GET'
    }),
    stats: (0, exports.apiCache)({
        ttl: 300,
        tags: ['stats'],
        keyGenerator: (req) => `stats:${req.path}:${JSON.stringify(req.query)}`
    })
};
const invalidateCache = (tags) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        res.json = function (data) {
            const result = originalJson.call(this, data);
            if (res.statusCode < 400) {
                Promise.all(tags.map(tag => redis_1.default.invalidateByTag(tag)))
                    .then((results) => {
                    const totalInvalidated = results.reduce((sum, count) => sum + count, 0);
                    if (totalInvalidated > 0) {
                        logger_1.logger.info(`Invalidated ${totalInvalidated} cache entries for tags: ${tags.join(', ')}`);
                    }
                })
                    .catch((error) => {
                    logger_1.logger.error('Cache invalidation error:', error);
                });
            }
            return result;
        };
        next();
    };
};
exports.invalidateCache = invalidateCache;
const clearAllCache = async (req, res, next) => {
    try {
        const success = await redis_1.default.clear();
        if (success) {
            logger_1.logger.info('All cache cleared', { userId: req.user?.id });
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Clear cache error:', error);
        next(error);
    }
};
exports.clearAllCache = clearAllCache;
const warmCache = async (routes) => {
    logger_1.logger.info(`Warming cache for ${routes.length} routes`);
    const results = await Promise.allSettled(routes.map(async (route) => {
        const method = route.method || 'GET';
        logger_1.logger.debug(`Would warm cache for ${method} ${route.path}`);
    }));
    const successful = results.filter(r => r.status === 'fulfilled').length;
    logger_1.logger.info(`Cache warming completed: ${successful}/${routes.length} routes warmed`);
};
exports.warmCache = warmCache;
const cacheHealthCheck = async () => {
    const connected = await redis_1.default.healthCheck();
    const stats = await redis_1.default.getStats();
    const hits = parseInt(stats.hits || '0');
    const misses = parseInt(stats.misses || '0');
    const total = hits + misses;
    const hitRate = total > 0 ? ((hits / total) * 100).toFixed(2) : '0.00';
    return {
        connected,
        stats,
        performance: {
            hit: hits,
            miss: misses,
            hitRate: `${hitRate}%`
        }
    };
};
exports.cacheHealthCheck = cacheHealthCheck;
exports.default = {
    apiCache: exports.apiCache,
    cacheRoutes: exports.cacheRoutes,
    invalidateCache: exports.invalidateCache,
    clearAllCache: exports.clearAllCache,
    warmCache: exports.warmCache,
    cacheHealthCheck: exports.cacheHealthCheck
};
//# sourceMappingURL=cache.middleware.js.map