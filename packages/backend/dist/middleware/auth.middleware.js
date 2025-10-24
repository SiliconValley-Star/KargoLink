"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifiedRequired = exports.customerRequired = exports.carrierRequired = exports.moderatorRequired = exports.adminRequired = exports.authRequired = exports.createAuthChain = exports.requireActiveUser = exports.requireOwnership = exports.requireVerification = exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const auth_service_1 = require("../services/auth.service");
const authenticate = async (req, res, next) => {
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
        const payload = await auth_service_1.AuthService.verifyAccessToken(token);
        req.user = payload;
        req.sessionId = payload.sessionId;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired token'
            }
        });
    }
};
exports.authenticate = authenticate;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
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
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
                const token = parts[1];
                const payload = await auth_service_1.AuthService.verifyAccessToken(token);
                req.user = payload;
                req.sessionId = payload.sessionId;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireVerification = async (req, res, next) => {
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
        const user = await auth_service_1.AuthService.getUserById(req.user.userId);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'VERIFICATION_CHECK_FAILED',
                message: 'Failed to verify account status'
            }
        });
    }
};
exports.requireVerification = requireVerification;
const requireOwnership = (userIdParam = 'userId') => {
    return (req, res, next) => {
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
        if (['admin', 'moderator'].includes(req.user.role)) {
            next();
            return;
        }
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
exports.requireOwnership = requireOwnership;
const requireActiveUser = async (req, res, next) => {
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
        const user = await auth_service_1.AuthService.getUserById(req.user.userId);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'USER_STATUS_CHECK_FAILED',
                message: 'Failed to verify user status'
            }
        });
    }
};
exports.requireActiveUser = requireActiveUser;
const createAuthChain = (...middlewares) => {
    return (req, res, next) => {
        let index = 0;
        const runNext = (error) => {
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
            }
            catch (error) {
                next(error);
            }
        };
        runNext();
    };
};
exports.createAuthChain = createAuthChain;
exports.authRequired = (0, exports.createAuthChain)(exports.authenticate, exports.requireActiveUser);
exports.adminRequired = (0, exports.createAuthChain)(exports.authenticate, exports.requireActiveUser, (0, exports.authorize)(['admin']));
exports.moderatorRequired = (0, exports.createAuthChain)(exports.authenticate, exports.requireActiveUser, (0, exports.authorize)(['admin', 'moderator']));
exports.carrierRequired = (0, exports.createAuthChain)(exports.authenticate, exports.requireActiveUser, (0, exports.authorize)(['carrier']));
exports.customerRequired = (0, exports.createAuthChain)(exports.authenticate, exports.requireActiveUser, (0, exports.authorize)(['customer']));
exports.verifiedRequired = (0, exports.createAuthChain)(exports.authenticate, exports.requireActiveUser, exports.requireVerification);
//# sourceMappingURL=auth.middleware.js.map