import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import redisService from '../config/redis';

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  statusCode: number;
  method: string;
  path: string;
  timestamp: number;
  userId?: string;
  userAgent?: string;
  ip: string;
}

export interface PerformanceConfig {
  logSlowRequests?: boolean;
  slowRequestThreshold?: number; // milliseconds
  enableMetrics?: boolean;
  enableCaching?: boolean;
  sampleRate?: number; // 0.0 to 1.0
}

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (config: PerformanceConfig = {}) => {
  const {
    logSlowRequests = true,
    slowRequestThreshold = 1000, // 1 second
    enableMetrics = true,
    enableCaching = true,
    sampleRate = 1.0
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const startCpuUsage = process.cpuUsage();
    const startMemory = process.memoryUsage();
    
    // Skip sampling based on rate
    if (Math.random() > sampleRate) {
      return next();
    }

    // Store original end method
    const originalEnd = res.end;
    
    // Override end method to capture metrics
    res.end = function(chunk?: any, encoding?: any) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const endCpuUsage = process.cpuUsage(startCpuUsage);
      const endMemory = process.memoryUsage();
      
      const metrics: PerformanceMetrics = {
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
        userId: (req as any).user?.id,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress || 'unknown'
      };

      // Log slow requests
      if (logSlowRequests && responseTime > slowRequestThreshold) {
        logger.warn('Slow request detected', {
          ...metrics,
          threshold: slowRequestThreshold
        });
      }

      // Store metrics
      if (enableMetrics) {
        storeMetrics(metrics, enableCaching);
      }

      // Add performance headers
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-Memory-Usage': `${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`,
        'X-CPU-Time': `${Math.round(endCpuUsage.user / 1000)}ms`
      });

      // Call original end method
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

/**
 * Store performance metrics
 */
const storeMetrics = async (metrics: PerformanceMetrics, enableCaching: boolean) => {
  try {
    const metricsKey = `metrics:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    if (enableCaching) {
      // Store in Redis with 1 hour TTL
      await redisService.set(metricsKey, metrics, { ttl: 3600, tags: ['metrics'] });
    }

    // Log metrics for external monitoring systems
    logger.info('Performance metrics', metrics);

    // Update aggregated stats
    await updateAggregatedStats(metrics, enableCaching);
    
  } catch (error) {
    logger.error('Failed to store performance metrics:', error);
  }
};

/**
 * Update aggregated performance statistics
 */
const updateAggregatedStats = async (metrics: PerformanceMetrics, enableCaching: boolean) => {
  if (!enableCaching) return;

  try {
    const hourKey = `stats:${new Date().getHours()}`;
    const pathKey = `stats:path:${metrics.path}`;
    const userKey = metrics.userId ? `stats:user:${metrics.userId}` : null;
    
    // Hourly stats
    const hourlyStats = await redisService.get(hourKey) || {
      requests: 0,
      totalResponseTime: 0,
      avgResponseTime: 0,
      slowRequests: 0,
      errors: 0
    };
    
    hourlyStats.requests++;
    hourlyStats.totalResponseTime += metrics.responseTime;
    hourlyStats.avgResponseTime = hourlyStats.totalResponseTime / hourlyStats.requests;
    if (metrics.responseTime > 1000) hourlyStats.slowRequests++;
    if (metrics.statusCode >= 400) hourlyStats.errors++;
    
    await redisService.set(hourKey, hourlyStats, { ttl: 7200, tags: ['stats', 'hourly'] });
    
    // Path-specific stats
    const pathStats = await redisService.get(pathKey) || {
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
    
    await redisService.set(pathKey, pathStats, { ttl: 86400, tags: ['stats', 'paths'] });
    
    // User-specific stats
    if (userKey) {
      const userStats = await redisService.get(userKey) || {
        requests: 0,
        totalResponseTime: 0,
        avgResponseTime: 0
      };
      
      userStats.requests++;
      userStats.totalResponseTime += metrics.responseTime;
      userStats.avgResponseTime = userStats.totalResponseTime / userStats.requests;
      
      await redisService.set(userKey, userStats, { ttl: 86400, tags: ['stats', 'users'] });
    }
    
  } catch (error) {
    logger.error('Failed to update aggregated stats:', error);
  }
};

/**
 * Get performance statistics
 */
export const getPerformanceStats = async (timeframe: 'hour' | 'day' | 'week' = 'hour') => {
  try {
    const currentHour = new Date().getHours();
    const stats: any = {
      current: {},
      historical: [],
      paths: {},
      summary: {}
    };

    if (timeframe === 'hour') {
      // Current hour stats
      stats.current = await redisService.get(`stats:${currentHour}`) || {};
      
      // Last 24 hours
      for (let i = 0; i < 24; i++) {
        const hour = (currentHour - i + 24) % 24;
        const hourStats = await redisService.get(`stats:${hour}`) || {};
        stats.historical.push({ hour, ...hourStats });
      }
    }

    // Top paths by requests
    const pathKeys = await redisService.keys('stats:path:*');
    const pathStatsPromises = pathKeys.map(async (key: string) => {
      const pathStats = await redisService.get(key);
      const path = key.replace('stats:path:', '');
      return { path, ...pathStats };
    });
    
    const pathStats = await Promise.all(pathStatsPromises);
    stats.paths = pathStats
      .filter((p: any) => p.requests > 0)
      .sort((a: any, b: any) => b.requests - a.requests)
      .slice(0, 10);

    // Summary statistics
    const totalRequests = pathStats.reduce((sum: number, p: any) => sum + (p.requests || 0), 0);
    const totalResponseTime = pathStats.reduce((sum: number, p: any) => sum + (p.totalResponseTime || 0), 0);
    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

    stats.summary = {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      pathCount: pathStats.length
    };

    return stats;
    
  } catch (error) {
    logger.error('Failed to get performance stats:', error);
    return null;
  }
};

/**
 * Get real-time system metrics
 */
export const getSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
      heapUsagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    },
    cpu: {
      user: Math.round(cpuUsage.user / 1000), // ms
      system: Math.round(cpuUsage.system / 1000)
    }
  };
};

/**
 * Performance health check
 */
export const performanceHealthCheck = async () => {
  const systemMetrics = getSystemMetrics();
  const stats = await getPerformanceStats('hour');
  
  // Define health thresholds
  const thresholds = {
    memory: 80, // 80% heap usage
    avgResponseTime: 2000, // 2 seconds
    errorRate: 5 // 5%
  };
  
  const health = {
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
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
  
  // Calculate error rate
  if (stats?.current?.requests > 0) {
    const errorRate = ((stats.current.errors || 0) / stats.current.requests) * 100;
    health.checks.errorRate.value = errorRate;
    health.checks.errorRate.status = errorRate < thresholds.errorRate ? 'ok' : 'warning';
  }
  
  // Determine overall health status
  const hasWarnings = Object.values(health.checks).some(check => check.status === 'warning');
  const hasCritical = Object.values(health.checks).some(check => check.status === 'critical');
  
  if (hasCritical) {
    health.status = 'critical';
  } else if (hasWarnings) {
    health.status = 'warning';
  }
  
  return health;
};

/**
 * Request rate limiting by performance
 */
export const adaptiveRateLimit = (config: {
  maxResponseTime?: number;
  maxCpuUsage?: number;
  maxMemoryUsage?: number;
} = {}) => {
  const {
    maxResponseTime = 10000, // 10 seconds in development
    maxCpuUsage = 90, // 90%
    maxMemoryUsage = process.env.NODE_ENV === 'development' ? 98 : 85 // 98% in dev, 85% in production
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const systemMetrics = getSystemMetrics();
      const recentStats = await getPerformanceStats('hour');
      
      // Check if system is under stress
      const isHighMemory = systemMetrics.memory.heapUsagePercent > maxMemoryUsage;
      const isSlowResponse = (recentStats?.current?.avgResponseTime || 0) > maxResponseTime;
      
      if (isHighMemory || isSlowResponse) {
        logger.warn('System under stress, applying adaptive rate limiting', {
          memoryUsage: systemMetrics.memory.heapUsagePercent,
          avgResponseTime: recentStats?.current?.avgResponseTime,
          thresholds: { maxMemoryUsage, maxResponseTime }
        });
        
        // Return 503 Service Unavailable with retry-after header
        res.status(503).set({
          'Retry-After': '60', // 1 minute
          'X-Rate-Limit-Reason': 'system-overload'
        }).json({
          error: 'Service temporarily unavailable due to high load',
          retryAfter: 60
        });
        return;
      }
      
      next();
      
    } catch (error) {
      logger.error('Adaptive rate limit error:', error);
      // Continue on error
      next();
    }
  };
};

export default {
  performanceMonitor,
  getPerformanceStats,
  getSystemMetrics,
  performanceHealthCheck,
  adaptiveRateLimit
};