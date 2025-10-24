"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
const logger_simple_1 = require("./logger.simple");
class RedisService {
    client;
    isConnected = false;
    defaultTTL = 3600;
    keyPrefix = 'cargolink:';
    constructor() {
        this.initializeClient();
    }
    initializeClient() {
        try {
            this.client = (0, redis_1.createClient)({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                password: process.env.REDIS_PASSWORD,
                database: parseInt(process.env.REDIS_DB || '0'),
                socket: {
                    connectTimeout: 10000,
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            logger_simple_1.logger.error('Redis connection failed after 10 retries');
                            return new Error('Redis connection failed');
                        }
                        return Math.min(retries * 100, 3000);
                    }
                }
            });
            this.client.on('error', (error) => {
                logger_simple_1.logger.error('Redis connection error:', error);
                this.isConnected = false;
            });
            this.client.on('connect', () => {
                logger_simple_1.logger.info('Redis client connected');
                this.isConnected = true;
            });
            this.client.on('ready', () => {
                logger_simple_1.logger.info('Redis client ready');
                this.isConnected = true;
            });
            this.client.on('end', () => {
                logger_simple_1.logger.warn('Redis connection ended');
                this.isConnected = false;
            });
        }
        catch (error) {
            logger_simple_1.logger.error('Failed to initialize Redis client:', error);
        }
    }
    async connect() {
        if (!this.isConnected) {
            try {
                await this.client.connect();
                this.isConnected = true;
                logger_simple_1.logger.info('✅ Redis connected successfully');
            }
            catch (error) {
                logger_simple_1.logger.error('❌ Redis connection failed:', error);
            }
        }
    }
    async disconnect() {
        if (this.isConnected) {
            try {
                await this.client.quit();
                this.isConnected = false;
                logger_simple_1.logger.info('📦 Redis connection closed');
            }
            catch (error) {
                logger_simple_1.logger.error('Error closing Redis connection:', error);
            }
        }
    }
    formatKey(key) {
        return `${this.keyPrefix}${key}`;
    }
    async get(key) {
        if (!this.isConnected) {
            return null;
        }
        try {
            const formattedKey = this.formatKey(key);
            const value = await this.client.get(formattedKey);
            if (!value) {
                return null;
            }
            const parsed = JSON.parse(value);
            if (Date.now() > parsed.expiresAt) {
                await this.delete(key);
                return null;
            }
            logger_simple_1.logger.debug(`Cache hit: ${key}`);
            return parsed.data;
        }
        catch (error) {
            logger_simple_1.logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, options = {}) {
        if (!this.isConnected) {
            return false;
        }
        try {
            const ttl = options.ttl || this.defaultTTL;
            const formattedKey = this.formatKey(key);
            const cacheItem = {
                data: value,
                createdAt: Date.now(),
                expiresAt: Date.now() + (ttl * 1000),
                tags: options.tags || []
            };
            await this.client.setEx(formattedKey, ttl, JSON.stringify(cacheItem));
            if (options.tags?.length) {
                for (const tag of options.tags) {
                    await this.client.sAdd(`${this.keyPrefix}tag:${tag}`, formattedKey);
                }
            }
            logger_simple_1.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
            return true;
        }
        catch (error) {
            logger_simple_1.logger.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    }
    async delete(key) {
        if (!this.isConnected) {
            return false;
        }
        try {
            const formattedKey = this.formatKey(key);
            const result = await this.client.del(formattedKey);
            logger_simple_1.logger.debug(`Cache delete: ${key}`);
            return result > 0;
        }
        catch (error) {
            logger_simple_1.logger.error(`Cache delete error for key ${key}:`, error);
            return false;
        }
    }
    async exists(key) {
        if (!this.isConnected) {
            return false;
        }
        try {
            const formattedKey = this.formatKey(key);
            const result = await this.client.exists(formattedKey);
            return result === 1;
        }
        catch (error) {
            logger_simple_1.logger.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }
    async invalidateByTag(tag) {
        if (!this.isConnected) {
            return 0;
        }
        try {
            const tagKey = `${this.keyPrefix}tag:${tag}`;
            const keys = await this.client.sMembers(tagKey);
            if (keys.length === 0) {
                return 0;
            }
            const deletePromises = keys.map((key) => this.client.del(key));
            await Promise.all(deletePromises);
            await this.client.del(tagKey);
            logger_simple_1.logger.info(`Invalidated ${keys.length} cache keys for tag: ${tag}`);
            return keys.length;
        }
        catch (error) {
            logger_simple_1.logger.error(`Cache invalidate by tag error for ${tag}:`, error);
            return 0;
        }
    }
    async mget(keys) {
        if (!this.isConnected || keys.length === 0) {
            return keys.map(() => null);
        }
        try {
            const formattedKeys = keys.map(key => this.formatKey(key));
            const values = await this.client.mGet(formattedKeys);
            return values.map((value, index) => {
                if (!value) {
                    return null;
                }
                try {
                    const parsed = JSON.parse(value);
                    if (Date.now() > parsed.expiresAt) {
                        if (keys[index]) {
                            this.delete(keys[index]);
                        }
                        return null;
                    }
                    return parsed.data;
                }
                catch {
                    return null;
                }
            });
        }
        catch (error) {
            logger_simple_1.logger.error('Cache mget error:', error);
            return keys.map(() => null);
        }
    }
    async mset(entries) {
        if (!this.isConnected || entries.length === 0) {
            return false;
        }
        try {
            const setPromises = entries.map(entry => this.set(entry.key, entry.value, entry.options));
            await Promise.all(setPromises);
            return true;
        }
        catch (error) {
            logger_simple_1.logger.error('Cache mset error:', error);
            return false;
        }
    }
    async incr(key, increment = 1) {
        if (!this.isConnected) {
            return null;
        }
        try {
            const formattedKey = this.formatKey(key);
            const result = await this.client.incrBy(formattedKey, increment);
            return result;
        }
        catch (error) {
            logger_simple_1.logger.error(`Cache incr error for key ${key}:`, error);
            return null;
        }
    }
    async expire(key, ttl) {
        if (!this.isConnected) {
            return false;
        }
        try {
            const formattedKey = this.formatKey(key);
            const result = await this.client.expire(formattedKey, ttl);
            return result === 1;
        }
        catch (error) {
            logger_simple_1.logger.error(`Cache expire error for key ${key}:`, error);
            return false;
        }
    }
    async getStats() {
        const stats = {
            connected: this.isConnected,
            memory: null,
            keys: 0,
            hits: null,
            misses: null
        };
        if (!this.isConnected) {
            return stats;
        }
        try {
            const info = await this.client.info('memory');
            const keyspace = await this.client.info('keyspace');
            const statsInfo = await this.client.info('stats');
            const memoryMatch = info.match(/used_memory_human:(.+)/);
            if (memoryMatch) {
                stats.memory = memoryMatch[1].trim();
            }
            const keysMatch = keyspace.match(/keys=(\d+)/);
            if (keysMatch) {
                stats.keys = parseInt(keysMatch[1]);
            }
            const hitsMatch = statsInfo.match(/keyspace_hits:(\d+)/);
            const missesMatch = statsInfo.match(/keyspace_misses:(\d+)/);
            if (hitsMatch)
                stats.hits = hitsMatch[1];
            if (missesMatch)
                stats.misses = missesMatch[1];
        }
        catch (error) {
            logger_simple_1.logger.error('Error getting Redis stats:', error);
        }
        return stats;
    }
    async clear() {
        if (!this.isConnected) {
            return false;
        }
        try {
            await this.client.flushDb();
            logger_simple_1.logger.info('Cache cleared');
            return true;
        }
        catch (error) {
            logger_simple_1.logger.error('Cache clear error:', error);
            return false;
        }
    }
    async keys(pattern) {
        if (!this.isConnected) {
            return [];
        }
        try {
            const keys = await this.client.keys(pattern);
            return keys || [];
        }
        catch (error) {
            logger_simple_1.logger.error('Failed to get keys:', error);
            return [];
        }
    }
    async healthCheck() {
        if (!this.isConnected) {
            return false;
        }
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        }
        catch (error) {
            logger_simple_1.logger.error('Redis health check failed:', error);
            return false;
        }
    }
}
exports.RedisService = RedisService;
const redisService = new RedisService();
const gracefulShutdown = async () => {
    try {
        await redisService.disconnect();
    }
    catch (error) {
        logger_simple_1.logger.error('Error during Redis shutdown:', error);
    }
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
exports.default = redisService;
//# sourceMappingURL=redis.js.map