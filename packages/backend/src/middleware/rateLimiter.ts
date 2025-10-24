import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/environment';
import { logger as securityLogger } from '../config/logger';

/**
 * Custom rate limit handler
 */
const rateLimitHandler = (req: Request, res: Response) => {
  securityLogger.warn('Rate limit exceeded', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method,
  });

  res.status(429).json({
    success: false,
    error: 'Too many requests, please try again later',
    retryAfter: Math.round(config.rateLimit.windowMs / 1000),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Skip rate limiting function
 */
const skipRateLimit = (req: Request): boolean => {
  // Skip rate limiting in test environment
  if (config.nodeEnv === 'test') {
    return true;
  }

  // Skip if rate limiting is disabled
  if (!config.features.rateLimiting) {
    return true;
  }

  // Skip for health check endpoints
  if (req.path === '/health' || req.path === '/api') {
    return true;
  }

  return false;
};

/**
 * General rate limiter
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.maxRequests, // Limit each IP to 100 requests per windowMs
  message: rateLimitHandler,
  skip: skipRateLimit,
  standardHeaders: true, // Return rate limit info in the `RateLimitLimit` and `RateLimitRemaining` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request): string => {
    // Use user ID if authenticated, otherwise use IP
    const user = (req as any).user;
    return user?.id || req.ip;
  },
});

/**
 * Strict rate limiter for sensitive endpoints
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: rateLimitHandler,
  skip: skipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter for login/register endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: (req: Request, res: Response) => {
    securityLogger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later',
      retryAfter: Math.round(15 * 60), // 15 minutes in seconds
      timestamp: new Date().toISOString(),
    });
  },
  skip: skipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API rate limiter for API endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each API key to 60 requests per minute
  message: rateLimitHandler,
  skip: skipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    // Use API key if present, otherwise use IP
    const apiKey = req.get('X-API-Key');
    return apiKey || req.ip || 'unknown';
  },
});

/**
 * Upload rate limiter for file upload endpoints
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each user to 100 uploads per hour
  message: rateLimitHandler,
  skip: skipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const user = (req as any).user;
    return user?.id || req.ip;
  },
});

/**
 * Password reset rate limiter
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: (req: Request, res: Response) => {
    securityLogger.warn('Password reset rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email,
    });

    res.status(429).json({
      success: false,
      error: 'Too many password reset attempts, please try again later',
      retryAfter: Math.round(60 * 60), // 1 hour in seconds
      timestamp: new Date().toISOString(),
    });
  },
  skip: skipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;