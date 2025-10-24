import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { logger, loggerStream } from './config/logger.simple';
import redisService from './config/redis';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { performanceMonitor, getPerformanceStats, getSystemMetrics, performanceHealthCheck, adaptiveRateLimit } from './middleware/performance.middleware';
import { cacheRoutes, cacheHealthCheck } from './middleware/cache.middleware';

export function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
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
    maxAge: 86400 // 24 hours
  };
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression middleware
  app.use(compression());

  // Performance monitoring middleware
  if (process.env.NODE_ENV !== 'test') {
    app.use(performanceMonitor({
      logSlowRequests: true,
      slowRequestThreshold: 2000, // 2 seconds
      enableMetrics: true,
      enableCaching: true,
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    }));
  }

  // Request logging (only in non-test environment)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: loggerStream }));
    app.use(requestLogger);
  }

  // Adaptive rate limiting based on system performance
  if (process.env.NODE_ENV !== 'test') {
    app.use(adaptiveRateLimit({
      maxResponseTime: 10000
    }));
  }

  // Rate limiting (disable in test)
  if (process.env.NODE_ENV !== 'test') {
    app.use('/api/', rateLimiter);
  }

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const performanceHealth = await performanceHealthCheck();
      const cacheHealth = await cacheHealthCheck();
      
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
      
      // Determine overall status - Redis is optional in development
      if (performanceHealth.status === 'critical') {
        health.status = 'CRITICAL';
        res.status(503);
      } else if (performanceHealth.status === 'warning' || !cacheHealth.connected) {
        health.status = 'WARNING';
        res.status(200);
      }
      
      res.json(health);
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  });

  // Performance metrics endpoint
  app.get('/metrics', async (req, res) => {
    try {
      const timeframe = req.query.timeframe as 'hour' | 'day' | 'week' || 'hour';
      const performanceStats = await getPerformanceStats(timeframe);
      const systemMetrics = getSystemMetrics();
      const cacheHealth = await cacheHealthCheck();
      
      res.json({
        performance: performanceStats,
        system: systemMetrics,
        cache: cacheHealth,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Metrics endpoint error:', error);
      res.status(500).json({
        error: 'Failed to retrieve metrics'
      });
    }
  });

  // API Routes
  app.use('/api/v1', apiRoutes);

  // Test endpoint
  app.get('/api/test', (req, res) => {
    res.json({
      success: true,
      data: {
        message: 'CargoLink Backend API is running!',
        timestamp: new Date().toISOString()
      }
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.originalUrl} not found`
      }
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}

export default createApp;