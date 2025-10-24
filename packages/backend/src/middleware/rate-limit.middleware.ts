import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../config/logger';

/**
 * Custom rate limit handler
 */
const rateLimitHandler = (req: Request, res: Response) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    endpoint: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent')
  });
  
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      retryAfter: 60
    }
  });
};

/**
 * Default rate limit configuration
 */
export const defaultRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: rateLimitHandler,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.userId || req.ip || 'unknown';
  }
});

/**
 * Strict rate limit for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => req.ip || 'unknown'
});

/**
 * Password change rate limit
 */
export const passwordChangeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each user to 3 password changes per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown'
});

/**
 * API rate limit for general endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each user to 1000 requests per windowMs
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown'
});

/**
 * File upload rate limit
 */
export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each user to 20 uploads per windowMs
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown'
});

/**
 * SMS/Email sending rate limit
 */
export const notificationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each user to 3 notifications per windowMs
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown'
});

/**
 * Custom rate limit factory
 */
interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

export const createRateLimit = (options: RateLimitOptions = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message ? 
      (req: Request, res: Response) => {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          endpoint: req.originalUrl,
          method: req.method
        });
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: options.message
          }
        });
      } : rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    keyGenerator: options.keyGenerator || ((req) => req.user?.userId || req.ip || 'unknown')
  });
};

// Export the rateLimit function for custom usage
export { rateLimit };

// Default export
export default defaultRateLimit;