"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRateLimit = exports.requireOwnership = exports.apiKeyAuth = exports.requireVerification = exports.requireRole = exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../config/environment");
const database_1 = require("../config/database");
const errorHandler_1 = require("./errorHandler");
const logger_1 = require("../utils/logger");
const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret, (err, decoded) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(decoded);
            }
        });
    });
};
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    const cookieToken = req.cookies?.token;
    if (cookieToken) {
        return cookieToken;
    }
    if (environment_1.config.nodeEnv === 'development' && req.query.token) {
        return req.query.token;
    }
    return null;
};
const authMiddleware = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return next(new errorHandler_1.AppError('Access token is required', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        const decoded = await verifyToken(token);
        const prisma = (0, database_1.getPrismaClient)();
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
            logger_1.securityLogger.warn('Invalid token - User not found', {
                userId: decoded.userId,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            });
            return next(new errorHandler_1.AppError('Invalid token', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        if (user.status !== 'ACTIVE') {
            logger_1.securityLogger.warn('Inactive user attempted access', {
                userId: user.id,
                status: user.status,
                ip: req.ip,
            });
            return next(new errorHandler_1.AppError('Account is not active', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        req.user = {
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
        prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        }).catch(() => { });
        next();
    }
    catch (error) {
        logger_1.securityLogger.warn('Authentication failed', {
            error: error.message,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        });
        if (error.name === 'TokenExpiredError') {
            return next(new errorHandler_1.AppError('Token expired', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new errorHandler_1.AppError('Invalid token', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        next(new errorHandler_1.AppError('Authentication failed', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
    }
};
exports.authMiddleware = authMiddleware;
const optionalAuthMiddleware = async (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return next();
    }
    try {
        const decoded = await verifyToken(token);
        const prisma = (0, database_1.getPrismaClient)();
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
            req.user = {
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
    }
    catch (error) {
    }
    next();
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return next(new errorHandler_1.AppError('Authentication required', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        if (!allowedRoles.includes(user.role)) {
            logger_1.securityLogger.warn('Insufficient permissions', {
                userId: user.id,
                userRole: user.role,
                requiredRoles: allowedRoles,
                path: req.path,
                ip: req.ip,
            });
            return next(new errorHandler_1.AppError('Insufficient permissions', errorHandler_1.HTTP_STATUS.FORBIDDEN));
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireVerification = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return next(new errorHandler_1.AppError('Authentication required', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
    }
    if (!user.isVerified && user.role !== 'customer') {
        return next(new errorHandler_1.AppError('Account verification required', errorHandler_1.HTTP_STATUS.FORBIDDEN));
    }
    next();
};
exports.requireVerification = requireVerification;
const apiKeyAuth = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return next(new errorHandler_1.AppError('API key is required', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        const prisma = (0, database_1.getPrismaClient)();
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
            logger_1.securityLogger.warn('Invalid API key used', {
                apiKey: apiKey.substring(0, 8) + '...',
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            });
            return next(new errorHandler_1.AppError('Invalid API key', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
            return next(new errorHandler_1.AppError('API key expired', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        if (keyRecord.user.status !== 'ACTIVE') {
            return next(new errorHandler_1.AppError('Account is not active', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsedAt: new Date() },
        }).catch(() => { });
        req.user = {
            userId: keyRecord.user.id,
            id: keyRecord.user.id,
            email: keyRecord.user.email,
            role: keyRecord.user.role === 'CUSTOMER' ? 'customer' :
                keyRecord.user.role === 'CARRIER' ? 'carrier' :
                    keyRecord.user.role === 'ADMIN' ? 'admin' :
                        keyRecord.user.role === 'MODERATOR' ? 'moderator' :
                            keyRecord.user.role === 'SUPPORT' ? 'support' : 'partner',
            isVerified: true,
        };
        next();
    }
    catch (error) {
        next(new errorHandler_1.AppError('API authentication failed', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
    }
};
exports.apiKeyAuth = apiKeyAuth;
const requireOwnership = (resourceIdField = 'id') => {
    return async (req, res, next) => {
        const user = req.user;
        const resourceId = req.params[resourceIdField];
        if (!user) {
            return next(new errorHandler_1.AppError('Authentication required', errorHandler_1.HTTP_STATUS.UNAUTHORIZED));
        }
        if (user.role === 'admin' || user.role === 'moderator') {
            return next();
        }
        try {
            const prisma = (0, database_1.getPrismaClient)();
            const resource = await prisma.$queryRaw `
        SELECT * FROM ${req.baseUrl.replace('/api/v1/', '')} 
        WHERE id = ${resourceId} AND user_id = ${user.id}
        LIMIT 1
      `;
            if (!resource.length) {
                return next(new errorHandler_1.AppError('Resource not found or access denied', errorHandler_1.HTTP_STATUS.FORBIDDEN));
            }
            next();
        }
        catch (error) {
            next(new errorHandler_1.AppError('Access check failed', errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
    };
};
exports.requireOwnership = requireOwnership;
const userRateLimit = (maxRequests, windowMs) => {
    const requests = new Map();
    return (req, res, next) => {
        const user = req.user;
        const userId = user?.userId || req.ip || 'anonymous';
        const now = Date.now();
        if (!requests.has(userId)) {
            requests.set(userId, []);
        }
        const userRequests = requests.get(userId);
        const recentRequests = userRequests.filter(time => now - time < windowMs);
        if (recentRequests.length >= maxRequests) {
            return next(new errorHandler_1.AppError('Too many requests', errorHandler_1.HTTP_STATUS.TOO_MANY_REQUESTS));
        }
        recentRequests.push(now);
        requests.set(userId, recentRequests);
        next();
    };
};
exports.userRateLimit = userRateLimit;
exports.default = exports.authMiddleware;
//# sourceMappingURL=auth.js.map