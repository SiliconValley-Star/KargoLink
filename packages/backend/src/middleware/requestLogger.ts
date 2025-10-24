import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

/**
 * Extended Request interface to include request ID
 */
interface ExtendedRequest extends Request {
  id: string;
  startTime: number;
}

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const extReq = req as ExtendedRequest;
  
  // Generate unique request ID
  extReq.id = uuidv4();
  extReq.startTime = Date.now();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', extReq.id);

  // Log request start
  logger.info('Request started', {
    requestId: extReq.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    const responseTime = Date.now() - extReq.startTime;

    // Log response
    logger.info('Request completed', {
      requestId: extReq.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
    });

    // Call original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

/**
 * API metrics middleware
 */
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const endpoint = `${req.method} ${req.route?.path || req.path}`;

    // Log API metrics
    logger.info('API Metrics', {
      endpoint,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length'),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

export default requestLogger;