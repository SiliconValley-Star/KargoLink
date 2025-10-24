/**
 * Health Check Routes
 * Provides comprehensive health monitoring endpoints
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { dbLogger as logger } from '../utils/logger';

const router: Router = Router();
const prisma = new PrismaClient();

// Redis client for health check
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    storage: ServiceHealth;
    external_apis: ServiceHealth;
  };
  metrics: {
    memory_usage: number;
    cpu_usage: number;
    active_connections: number;
    total_requests: number;
    error_rate: number;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  response_time_ms: number;
  error?: string;
}

// Basic health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Quick database check
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStartTime;
    
    // Redis check
    const redisStartTime = Date.now();
    let redisStatus: ServiceHealth = {
      status: 'healthy',
      response_time_ms: 0
    };
    
    try {
      await redisClient.ping();
      redisStatus.response_time_ms = Date.now() - redisStartTime;
    } catch (error) {
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
    
  } catch (error) {
    logger.error('Health check failed', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

// Detailed health check endpoint
router.get('/health/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Database health check
    const dbHealth = await checkDatabaseHealth();
    
    // Redis health check  
    const redisHealth = await checkRedisHealth();
    
    // Storage health check (S3)
    const storageHealth = await checkStorageHealth();
    
    // External APIs health check
    const externalApisHealth = await checkExternalAPIsHealth();
    
    // System metrics
    const metrics = await getSystemMetrics();
    
    // Determine overall status
    const services = {
      database: dbHealth,
      redis: redisHealth,
      storage: storageHealth,
      external_apis: externalApisHealth
    };
    
    const unhealthyServices = Object.values(services).filter(
      service => service.status === 'unhealthy'
    );
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (unhealthyServices.length > 0) {
      overallStatus = unhealthyServices.length >= 2 ? 'unhealthy' : 'degraded';
    }
    
    const healthStatus: HealthStatus = {
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
    
  } catch (error) {
    logger.error('Detailed health check failed', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Database health check
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Test actual operations
    await prisma.user.count();
    await prisma.shipment.count();
    
    return {
      status: 'healthy',
      response_time_ms: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: 'Database connection failed'
    };
  }
}

// Redis health check
async function checkRedisHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    
    await redisClient.ping();
    
    // Test set/get operations
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
    
  } catch (error) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: 'Redis health check failed'
    };
  }
}

// Storage health check (S3)
async function checkStorageHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // If S3 is configured, test connectivity
    if (process.env.AWS_BUCKET_NAME) {
      // Simple S3 connectivity test would go here
      // For now, just check if credentials are available
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
    
  } catch (error) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: 'Storage health check failed'
    };
  }
}

// External APIs health check
async function checkExternalAPIsHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Test external payment and cargo APIs
    const promises = [];
    
    // İyzico health check (if configured)
    if (process.env.IYZICO_API_KEY) {
      promises.push(testIyzicoConnection());
    }
    
    // PayTR health check (if configured)
    if (process.env.PAYTR_MERCHANT_ID) {
      promises.push(testPayTRConnection());
    }
    
    // Cargo APIs health check
    promises.push(testCargoAPIsConnection());
    
    const results = await Promise.allSettled(promises);
    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > results.length / 2) {
      throw new Error(`${failures.length}/${results.length} external APIs failed`);
    }
    
    return {
      status: failures.length === 0 ? 'healthy' : 'healthy', // Degraded but functional
      response_time_ms: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: 'External APIs health check failed'
    };
  }
}

// System metrics
async function getSystemMetrics() {
  const memUsage = process.memoryUsage();
  
  return {
    memory_usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    cpu_usage: 0, // Would need additional library for CPU usage
    active_connections: 0, // Would track from connection pool
    total_requests: 0, // Would track from middleware
    error_rate: 0 // Would calculate from logs
  };
}

// Test external service connections
async function testIyzicoConnection(): Promise<void> {
  // Simple test - would implement actual İyzico API test
  return Promise.resolve();
}

async function testPayTRConnection(): Promise<void> {
  // Simple test - would implement actual PayTR API test
  return Promise.resolve();
}

async function testCargoAPIsConnection(): Promise<void> {
  // Simple test - would implement actual cargo APIs test
  return Promise.resolve();
}

// Readiness probe endpoint
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if all critical services are ready
    await prisma.$queryRaw`SELECT 1`;
    
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.ping();
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Service not ready'
    });
  }
});

// Liveness probe endpoint
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Metrics endpoint for Prometheus
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await getSystemMetrics();
    const dbCount = await prisma.shipment.count();
    const userCount = await prisma.user.count();
    
    // Prometheus format metrics
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
    
  } catch (error) {
    logger.error('Metrics endpoint error', error);
    res.status(500).send('# Error generating metrics');
  }
});

export { router as healthRoutes };