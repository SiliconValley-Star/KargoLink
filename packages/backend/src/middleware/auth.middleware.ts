import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/auth.service';
// Local type definitions (to replace @cargolink/shared dependency)
type UserRole = 'customer' | 'carrier' | 'admin' | 'moderator' | 'support' | 'partner';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      sessionId?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
  sessionId?: string;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_AUTH_HEADER',
          message: 'Authorization header is required'
        }
      });
      return;
    }

    // Extract token from "Bearer TOKEN" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH_FORMAT',
          message: 'Authorization header must be in format: Bearer <token>'
        }
      });
      return;
    }

    const token = parts[1];
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Token is missing from authorization header'
        }
      });
      return;
    }
    
    // Verify token
    const payload = await AuthService.verifyAccessToken(token);
    
    // Attach user info to request
    req.user = payload;
    req.sessionId = payload.sessionId;
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const authorize = (allowedRoles: UserRole[] | UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions for this action'
        }
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
        const token = parts[1];
        const payload = await AuthService.verifyAccessToken(token);
        req.user = payload;
        req.sessionId = payload.sessionId;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail on invalid token in optional auth
    next();
  }
};

/**
 * Middleware to ensure user is verified
 */
export const requireVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'NOT_AUTHENTICATED',
        message: 'Authentication required'
      }
    });
    return;
  }

  try {
    // Get full user info to check verification status
    const user = await AuthService.getUserById(req.user.userId);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
      return;
    }

    if (user.verificationStatus !== 'verified') {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_NOT_VERIFIED',
          message: 'Account verification required to access this resource'
        }
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_CHECK_FAILED',
        message: 'Failed to verify account status'
      }
    });
  }
};

/**
 * Middleware to ensure user can only access their own resources
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const targetUserId = req.params[userIdParam] || req.body[userIdParam];
    
    if (!targetUserId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_USER_ID',
          message: `${userIdParam} parameter is required`
        }
      });
      return;
    }

    // Admin and moderator can access any resource
    if (['admin', 'moderator'].includes(req.user.role)) {
      next();
      return;
    }

    // User can only access their own resources
    if (req.user.userId !== targetUserId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this resource'
        }
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is active
 */
export const requireActiveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'NOT_AUTHENTICATED',
        message: 'Authentication required'
      }
    });
    return;
  }

  try {
    const user = await AuthService.getUserById(req.user.userId);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is not active'
        }
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_STATUS_CHECK_FAILED',
        message: 'Failed to verify user status'
      }
    });
  }
};

/**
 * Combine multiple auth middlewares
 */
export const createAuthChain = (...middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let index = 0;
    
    const runNext = (error?: any) => {
      if (error) {
        next(error);
        return;
      }
      
      if (index >= middlewares.length) {
        next();
        return;
      }
      
      const middleware = middlewares[index++];
      if (!middleware) {
        next();
        return;
      }
      try {
        middleware(req, res, runNext);
      } catch (error) {
        next(error);
      }
    };
    
    runNext();
  };
};

// Common auth combinations
export const authRequired = createAuthChain(authenticate, requireActiveUser);
export const adminRequired = createAuthChain(authenticate, requireActiveUser, authorize(['admin']));
export const moderatorRequired = createAuthChain(authenticate, requireActiveUser, authorize(['admin', 'moderator']));
export const carrierRequired = createAuthChain(authenticate, requireActiveUser, authorize(['carrier']));
export const customerRequired = createAuthChain(authenticate, requireActiveUser, authorize(['customer']));
export const verifiedRequired = createAuthChain(authenticate, requireActiveUser, requireVerification);