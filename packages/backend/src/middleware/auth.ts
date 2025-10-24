import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { getPrismaClient } from '../config/database';
import { AppError, HTTP_STATUS } from './errorHandler';
import { securityLogger } from '../utils/logger';
// Local type definitions (to replace @cargolink/shared dependency)
type UserRole = 'customer' | 'carrier' | 'admin' | 'moderator' | 'support' | 'partner';

/**
 * Extended Request interface to include user
 */
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    id: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
  };
}

/**
 * JWT payload interface
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Verify JWT token
 */
const verifyToken = (token: string): Promise<JWTPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as JWTPayload);
      }
    });
  });
};

/**
 * Extract token from request
 */
const extractToken = (req: Request): string | null => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookieToken = req.cookies?.token;
  if (cookieToken) {
    return cookieToken;
  }

  // Check query parameter (for development only)
  if (config.nodeEnv === 'development' && req.query.token) {
    return req.query.token as string;
  }

  return null;
};

/**
 * Main authentication middleware
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next(new AppError('Access token is required', HTTP_STATUS.UNAUTHORIZED));
    }

    // Verify token
    const decoded = await verifyToken(token);

    // Get user from database
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        verificationStatus: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      securityLogger.warn('Invalid token - User not found', {
        userId: decoded.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      return next(new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED));
    }

    if (user.status !== 'ACTIVE') {
      securityLogger.warn('Inactive user attempted access', {
        userId: user.id,
        status: user.status,
        ip: req.ip,
      });
      return next(new AppError('Account is not active', HTTP_STATUS.UNAUTHORIZED));
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role === 'CUSTOMER' ? 'customer' :
            user.role === 'CARRIER' ? 'carrier' :
            user.role === 'ADMIN' ? 'admin' :
            user.role === 'MODERATOR' ? 'moderator' :
            user.role === 'SUPPORT' ? 'support' : 'partner',
      isVerified: user.verificationStatus === 'VERIFIED',
    };

    // Update last seen
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(() => {}); // Don't block request if this fails

    next();
  } catch (error: any) {
    securityLogger.warn('Authentication failed', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', HTTP_STATUS.UNAUTHORIZED));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED));
    }

    next(new AppError('Authentication failed', HTTP_STATUS.UNAUTHORIZED));
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = await verifyToken(token);

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        verificationStatus: true,
      },
    });

    if (user && user.status === 'ACTIVE') {
      (req as AuthenticatedRequest).user = {
        userId: user.id,
        id: user.id,
        email: user.email,
        role: user.role === 'CUSTOMER' ? 'customer' :
              user.role === 'CARRIER' ? 'carrier' :
              user.role === 'ADMIN' ? 'admin' :
              user.role === 'MODERATOR' ? 'moderator' :
              user.role === 'SUPPORT' ? 'support' : 'partner',
        isVerified: user.verificationStatus === 'VERIFIED',
      };
    }
  } catch (error) {
    // Ignore errors in optional auth
  }

  next();
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return next(new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(user.role)) {
      securityLogger.warn('Insufficient permissions', {
        userId: user.id,
        userRole: user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        ip: req.ip,
      });
      return next(new AppError('Insufficient permissions', HTTP_STATUS.FORBIDDEN));
    }

    next();
  };
};

/**
 * Verification required middleware
 */
export const requireVerification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    return next(new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED));
  }

  if (!user.isVerified && user.role !== 'customer') {
    return next(new AppError('Account verification required', HTTP_STATUS.FORBIDDEN));
  }

  next();
};

/**
 * API key authentication middleware
 */
export const apiKeyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return next(new AppError('API key is required', HTTP_STATUS.UNAUTHORIZED));
    }

    // Verify API key
    const prisma = getPrismaClient();
    const keyRecord = await prisma.apiKey.findUnique({
      where: { 
        key: apiKey,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!keyRecord) {
      securityLogger.warn('Invalid API key used', {
        apiKey: apiKey.substring(0, 8) + '...',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      return next(new AppError('Invalid API key', HTTP_STATUS.UNAUTHORIZED));
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return next(new AppError('API key expired', HTTP_STATUS.UNAUTHORIZED));
    }

    if (keyRecord.user.status !== 'ACTIVE') {
      return next(new AppError('Account is not active', HTTP_STATUS.UNAUTHORIZED));
    }

    // Update last used
    prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      userId: keyRecord.user.id,
      id: keyRecord.user.id,
      email: keyRecord.user.email,
      role: keyRecord.user.role === 'CUSTOMER' ? 'customer' :
            keyRecord.user.role === 'CARRIER' ? 'carrier' :
            keyRecord.user.role === 'ADMIN' ? 'admin' :
            keyRecord.user.role === 'MODERATOR' ? 'moderator' :
            keyRecord.user.role === 'SUPPORT' ? 'support' : 'partner',
      isVerified: true, // API keys assume verified status
    };

    next();
  } catch (error) {
    next(new AppError('API authentication failed', HTTP_STATUS.UNAUTHORIZED));
  }
};

/**
 * Check if user owns resource
 */
export const requireOwnership = (resourceIdField: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    const resourceId = req.params[resourceIdField];

    if (!user) {
      return next(new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED));
    }

    // Admin users can access any resource
    if (user.role === 'admin' || user.role === 'moderator') {
      return next();
    }

    // Check ownership based on the resource type
    try {
      const prisma = getPrismaClient();

      // This is a generic ownership check
      // In real implementation, you'd have specific checks for each resource type
      const resource = await prisma.$queryRaw`
        SELECT * FROM ${req.baseUrl.replace('/api/v1/', '')} 
        WHERE id = ${resourceId} AND user_id = ${user.id}
        LIMIT 1
      ` as any[];

      if (!resource.length) {
        return next(new AppError('Resource not found or access denied', HTTP_STATUS.FORBIDDEN));
      }

      next();
    } catch (error) {
      next(new AppError('Access check failed', HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  };
};

/**
 * Rate limiting by user
 */
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    const userId: string = user?.userId || req.ip || 'anonymous';
    const now = Date.now();

    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId)!;
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return next(new AppError('Too many requests', HTTP_STATUS.TOO_MANY_REQUESTS));
    }

    recentRequests.push(now);
    requests.set(userId, recentRequests);

    next();
  };
};

export default authMiddleware;