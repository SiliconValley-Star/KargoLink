import { Request, Response, NextFunction } from 'express';
import redisService from '../config/redis';
import { logger } from '../config/logger';
import { createHash } from 'crypto';

export interface CacheConfig {
  ttl?: number; // seconds
  tags?: string[];
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request, res: Response) => boolean;
  skipOnError?: boolean;
}

/**
 * Generate cache key from request
 */
const generateCacheKey = (req: Request, keyGenerator?: (req: Request) => string): string => {
  if (keyGenerator) {
    return keyGenerator(req);
  }

  // Default key generation
  const userId = (req as any).user?.id || 'anonymous';
  const method = req.method;
  const path = req.path;
  const query = JSON.stringify(req.query);
  const body = req.method !== 'GET' ? JSON.stringify(req.body) : '';
  
  const keyString = `${method}:${path}:${query}:${body}:${userId}`;
  const hash = createHash('md5').update(keyString).digest('hex');
  
  return `api:${hash}`;
};

/**
 * Check if request should be cached
 */
const shouldCache = (req: Request, res: Response, config: CacheConfig): boolean => {
  // Don't cache if condition function returns false
  if (config.condition && !config.condition(req, res)) {
    return false;
  }

  // Don't cache if response is not successful
  if (res.statusCode >= 400) {
    return false;
  }

  // Don't cache POST, PUT, PATCH, DELETE by default
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return false;
  }

  return true;
};

/**
 * API Cache Middleware
 */
export const apiCache = (config: CacheConfig = {}) => {
  const {
    ttl = 300, // 5 minutes default
    tags = [],
    keyGenerator,
    condition,
    skipOnError = true
  } = config;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    
    try {
      // Generate cache key
      const cacheKey = generateCacheKey(req, keyGenerator);
      
      // Try to get from cache
      const cachedResponse = await redisService.get(cacheKey);
      
      if (cachedResponse) {
        const duration = Date.now() - startTime;
        
        logger.debug(`Cache hit for ${req.method} ${req.path}`, {
          key: cacheKey,
          duration,
          userId: (req as any).user?.id
        });

        // Set cache headers
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'X-Response-Time': `${duration}ms`
        });

        res.json(cachedResponse);
        return;
      }

      // Cache miss - continue to route handler
      logger.debug(`Cache miss for ${req.method} ${req.path}`, {
        key: cacheKey,
        userId: (req as any).user?.id
      });

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data: any) {
        const responseTime = Date.now() - startTime;
        
        // Set response headers
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
          'X-Response-Time': `${responseTime}ms`
        });

        // Cache the response if conditions are met
        if (shouldCache(req, res, config)) {
          redisService.set(cacheKey, data, { ttl, tags })
            .then((success) => {
              if (success) {
                logger.debug(`Response cached for ${req.method} ${req.path}`, {
                  key: cacheKey,
                  ttl,
                  tags,
                  responseTime,
                  userId: (req as any).user?.id
                });
              }
            })
            .catch((error) => {
              logger.error('Cache set error:', error);
            });
        }

        // Call original json method
        return originalJson.call(this, data);
      };

      next();

    } catch (error) {
      logger.error('Cache middleware error:', error);
      
      if (skipOnError) {
        // Continue without caching on error
        next();
      } else {
        next(error);
      }
    }
  };
};

/**
 * Cache specific routes with different configurations
 */
export const cacheRoutes = {
  // Short cache for frequently changing data
  short: apiCache({ ttl: 60, tags: ['short'] }), // 1 minute
  
  // Medium cache for semi-static data
  medium: apiCache({ ttl: 300, tags: ['medium'] }), // 5 minutes
  
  // Long cache for static data
  long: apiCache({ ttl: 3600, tags: ['long'] }), // 1 hour
  
  // Very long cache for rarely changing data
  veryLong: apiCache({ ttl: 86400, tags: ['very-long'] }), // 24 hours
  
  // User-specific cache
  user: apiCache({ 
    ttl: 300,
    tags: ['user'],
    keyGenerator: (req) => `user:${(req as any).user?.id}:${req.path}:${JSON.stringify(req.query)}`
  }),
  
  // Public data cache
  public: apiCache({
    ttl: 1800,
    tags: ['public'],
    condition: (req) => !req.headers.authorization
  }),

  // Shipment tracking cache
  tracking: apiCache({
    ttl: 120, // 2 minutes
    tags: ['tracking', 'shipments'],
    keyGenerator: (req) => `tracking:${req.params.trackingNumber}`
  }),

  // Pricing cache
  pricing: apiCache({
    ttl: 900, // 15 minutes
    tags: ['pricing'],
    condition: (req) => req.method === 'GET'
  }),

  // Stats cache
  stats: apiCache({
    ttl: 300, // 5 minutes
    tags: ['stats'],
    keyGenerator: (req) => `stats:${req.path}:${JSON.stringify(req.query)}`
  })
};

/**
 * Cache invalidation middleware
 */
export const invalidateCache = (tags: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to invalidate cache after response
    res.json = function(data: any) {
      // Call original json method first
      const result = originalJson.call(this, data);
      
      // Invalidate cache tags after successful response
      if (res.statusCode < 400) {
        Promise.all(tags.map(tag => redisService.invalidateByTag(tag)))
          .then((results) => {
            const totalInvalidated = results.reduce((sum, count) => sum + count, 0);
            if (totalInvalidated > 0) {
              logger.info(`Invalidated ${totalInvalidated} cache entries for tags: ${tags.join(', ')}`);
            }
          })
          .catch((error) => {
            logger.error('Cache invalidation error:', error);
          });
      }
      
      return result;
    };
    
    next();
  };
};

/**
 * Clear all cache
 */
export const clearAllCache = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const success = await redisService.clear();
    if (success) {
      logger.info('All cache cleared', { userId: (req as any).user?.id });
    }
    next();
  } catch (error) {
    logger.error('Clear cache error:', error);
    next(error);
  }
};

/**
 * Cache warming utility
 */
export const warmCache = async (routes: Array<{ path: string; method?: string }>) => {
  logger.info(`Warming cache for ${routes.length} routes`);
  
  const results = await Promise.allSettled(
    routes.map(async (route) => {
      const method = route.method || 'GET';
      // Here you would make internal requests to warm the cache
      // This is a placeholder - in real implementation you'd use your app instance
      logger.debug(`Would warm cache for ${method} ${route.path}`);
    })
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  logger.info(`Cache warming completed: ${successful}/${routes.length} routes warmed`);
};

/**
 * Cache health check
 */
export const cacheHealthCheck = async (): Promise<{
  connected: boolean;
  stats: any;
  performance: { hit: number; miss: number; hitRate: string };
}> => {
  const connected = await redisService.healthCheck();
  const stats = await redisService.getStats();
  
  // Calculate hit rate
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

export default {
  apiCache,
  cacheRoutes,
  invalidateCache,
  clearAllCache,
  warmCache,
  cacheHealthCheck
};