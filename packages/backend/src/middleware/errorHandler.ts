import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../config/logger';
import { config } from '../config/environment';

/**
 * Custom error class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  REQUEST_ENTITY_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Handle Zod validation errors
 */
const handleZodError = (error: ZodError): AppError => {
  const errors = error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return new AppError(
    'Validation failed',
    HTTP_STATUS.UNPROCESSABLE_ENTITY
  );
};

/**
 * Handle Prisma errors
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      return new AppError(
        'A record with this value already exists',
        HTTP_STATUS.CONFLICT
      );
    
    case 'P2025':
      return new AppError(
        'Record not found',
        HTTP_STATUS.NOT_FOUND
      );
    
    case 'P2003':
      return new AppError(
        'Foreign key constraint failed',
        HTTP_STATUS.BAD_REQUEST
      );
    
    case 'P2021':
      return new AppError(
        'Table does not exist',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    
    case 'P2022':
      return new AppError(
        'Column does not exist',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    
    default:
      return new AppError(
        'Database operation failed',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
  }
};

/**
 * Handle JWT errors
 */
const handleJWTError = (): AppError => {
  return new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Handle expired JWT
 */
const handleJWTExpiredError = (): AppError => {
  return new AppError('Token expired', HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Handle Multer file upload errors
 */
const handleMulterError = (error: any): AppError => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large', HTTP_STATUS.BAD_REQUEST);
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files', HTTP_STATUS.BAD_REQUEST);
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', HTTP_STATUS.BAD_REQUEST);
  }
  
  return new AppError('File upload failed', HTTP_STATUS.BAD_REQUEST);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unknown error:', err);
    
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Something went wrong',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error caught by global handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    error = handleZodError(err);
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Multer errors
  if (err.name === 'MulterError') {
    error = handleMulterError(err);
  }

  // Cast error to AppError if it isn't already
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || 'Something went wrong',
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      false
    );
  }

  // Send error response
  if (config.nodeEnv === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Catch async errors middleware
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err = new AppError(
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND
  );
  next(err);
};

/**
 * Send success response
 */
export const sendSuccessResponse = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = HTTP_STATUS.OK
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = (
  res: Response,
  data: any[],
  totalCount: number,
  page: number,
  limit: number,
  message: string = 'Success'
) => {
  const totalPages = Math.ceil(totalCount / limit);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    meta: {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

export default errorHandler;