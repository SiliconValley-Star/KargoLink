import { createClient } from 'redis';
import { config } from './environment';
import { logger } from './logger.simple';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

export interface CacheItem<T = any> {
  data: T;
  createdAt: number;
  expiresAt: number;
  tags: string[];
}

class RedisService {
  private client: any;
  private isConnected = false;
  private defaultTTL = 3600; // 1 hour
  private keyPrefix = 'cargolink:';

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        database: parseInt(process.env.REDIS_DB || '0'),
        socket: {
          connectTimeout: 10000,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (error: Error) => {
        logger.error('Redis connection error:', error);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        logger.warn('Redis connection ended');
        this.isConnected = false;
      });

    } catch (error) {
      logger.error('Failed to initialize Redis client:', error);
    }
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;
        logger.info('✅ Redis connected successfully');
      } catch (error) {
        logger.error('❌ Redis connection failed:', error);
        // Don't exit process, just log error and continue without cache
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        logger.info('📦 Redis connection closed');
      } catch (error) {
        logger.error('Error closing Redis connection:', error);
      }
    }
  }

  private formatKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const formattedKey = this.formatKey(key);
      const value = await this.client.get(formattedKey);
      
      if (!value) {
        return null;
      }

      const parsed: CacheItem<T> = JSON.parse(value);
      
      // Check if expired
      if (Date.now() > parsed.expiresAt) {
        await this.delete(key);
        return null;
      }

      logger.debug(`Cache hit: ${key}`);
      return parsed.data;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T = any>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const ttl = options.ttl || this.defaultTTL;
      const formattedKey = this.formatKey(key);
      
      const cacheItem: CacheItem<T> = {
        data: value,
        createdAt: Date.now(),
        expiresAt: Date.now() + (ttl * 1000),
        tags: options.tags || []
      };

      await this.client.setEx(formattedKey, ttl, JSON.stringify(cacheItem));
      
      // Store tags for cache invalidation
      if (options.tags?.length) {
        for (const tag of options.tags) {
          await this.client.sAdd(`${this.keyPrefix}tag:${tag}`, formattedKey);
        }
      }

      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const formattedKey = this.formatKey(key);
      const result = await this.client.del(formattedKey);
      
      logger.debug(`Cache delete: ${key}`);
      return result > 0;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const formattedKey = this.formatKey(key);
      const result = await this.client.exists(formattedKey);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTag(tag: string): Promise<number> {
    if (!this.isConnected) {
      return 0;
    }

    try {
      const tagKey = `${this.keyPrefix}tag:${tag}`;
      const keys = await this.client.sMembers(tagKey);
      
      if (keys.length === 0) {
        return 0;
      }

      // Delete all keys with this tag
      const deletePromises = keys.map((key: string) => this.client.del(key));
      await Promise.all(deletePromises);
      
      // Delete the tag set
      await this.client.del(tagKey);
      
      logger.info(`Invalidated ${keys.length} cache keys for tag: ${tag}`);
      return keys.length;
    } catch (error) {
      logger.error(`Cache invalidate by tag error for ${tag}:`, error);
      return 0;
    }
  }

  /**
   * Get multiple values at once
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isConnected || keys.length === 0) {
      return keys.map(() => null);
    }

    try {
      const formattedKeys = keys.map(key => this.formatKey(key));
      const values = await this.client.mGet(formattedKeys);
      
      return values.map((value: string | null, index: number) => {
        if (!value) {
          return null;
        }

        try {
          const parsed: CacheItem<T> = JSON.parse(value);
          
          // Check if expired
          if (Date.now() > parsed.expiresAt) {
            if (keys[index]) {
              this.delete(keys[index]); // Don't await
            }
            return null;
          }

          return parsed.data;
        } catch {
          return null;
        }
      });
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values at once
   */
  async mset<T = any>(entries: Array<{ key: string; value: T; options?: CacheOptions }>): Promise<boolean> {
    if (!this.isConnected || entries.length === 0) {
      return false;
    }

    try {
      const setPromises = entries.map(entry => 
        this.set(entry.key, entry.value, entry.options)
      );
      
      await Promise.all(setPromises);
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Increment counter
   */
  async incr(key: string, increment = 1): Promise<number | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const formattedKey = this.formatKey(key);
      const result = await this.client.incrBy(formattedKey, increment);
      return result;
    } catch (error) {
      logger.error(`Cache incr error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const formattedKey = this.formatKey(key);
      const result = await this.client.expire(formattedKey, ttl);
      return result === 1;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    memory: string | null;
    keys: number;
    hits: string | null;
    misses: string | null;
  }> {
    const stats = {
      connected: this.isConnected,
      memory: null as string | null,
      keys: 0,
      hits: null as string | null,
      misses: null as string | null
    };

    if (!this.isConnected) {
      return stats;
    }

    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      const statsInfo = await this.client.info('stats');

      // Parse memory usage
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      if (memoryMatch) {
        stats.memory = memoryMatch[1].trim();
      }

      // Parse key count
      const keysMatch = keyspace.match(/keys=(\d+)/);
      if (keysMatch) {
        stats.keys = parseInt(keysMatch[1]);
      }

      // Parse hits/misses
      const hitsMatch = statsInfo.match(/keyspace_hits:(\d+)/);
      const missesMatch = statsInfo.match(/keyspace_misses:(\d+)/);
      
      if (hitsMatch) stats.hits = hitsMatch[1];
      if (missesMatch) stats.misses = missesMatch[1];

    } catch (error) {
      logger.error('Error getting Redis stats:', error);
    }

    return stats;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.flushDb();
      logger.info('Cache cleared');
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.isConnected) {
      return [];
    }

    try {
      const keys = await this.client.keys(pattern);
      return keys || [];
    } catch (error) {
      logger.error('Failed to get keys:', error);
      return [];
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    await redisService.disconnect();
  } catch (error) {
    logger.error('Error during Redis shutdown:', error);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default redisService;
export { RedisService };