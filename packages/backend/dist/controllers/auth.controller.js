"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, firstName, lastName, phone, role = 'customer', accountType = 'individual' } = req.body;
            if (!email || !password || !firstName || !lastName || !phone) {
                throw new errorHandler_1.AppError('All fields are required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            const user = await auth_service_1.AuthService.register({
                email,
                password,
                confirmPassword: password,
                firstName,
                lastName,
                phone,
                role,
                accountType,
                acceptTerms: true,
                termsAccepted: true
            });
            res.status(errorHandler_1.HTTP_STATUS.CREATED).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                }
            });
        }
        catch (error) {
            res.status(errorHandler_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new errorHandler_1.AppError('Email and password are required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            const result = await auth_service_1.AuthService.login({
                email,
                password,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            res.cookie('accessToken', result.tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });
            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        firstName: result.user.firstName,
                        lastName: result.user.lastName,
                        role: result.user.role
                    },
                    tokens: result.tokens,
                    sessionId: result.sessionId
                }
            });
        }
        catch (error) {
            res.status(errorHandler_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    }
    static async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            const cookieRefreshToken = req.cookies?.refreshToken;
            const token = refreshToken || cookieRefreshToken;
            if (!token) {
                throw new errorHandler_1.AppError('Refresh token is required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            const tokens = await auth_service_1.AuthService.refreshTokens({ refreshToken: token });
            res.cookie('accessToken', tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.json({
                success: true,
                message: 'Tokens refreshed successfully',
                data: { tokens }
            });
        }
        catch (error) {
            res.status(errorHandler_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: error.message || 'Token refresh failed'
            });
        }
    }
    static async logout(req, res) {
        try {
            const user = req.user;
            const sessionId = req.body.sessionId;
            if (user) {
                await auth_service_1.AuthService.logout(user.userId, sessionId);
            }
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            res.status(errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Logout failed'
            });
        }
    }
    static async profile(req, res) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_1.AppError('User not found', errorHandler_1.HTTP_STATUS.NOT_FOUND);
            }
            const userProfile = await auth_service_1.AuthService.getUserById(user.userId);
            res.json({
                success: true,
                data: { user: userProfile }
            });
        }
        catch (error) {
            res.status(errorHandler_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: error.message || 'User not found'
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            const user = req.user;
            const updates = req.body;
            const updatedUser = await auth_service_1.AuthService.updateProfile(user.userId, updates);
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: updatedUser }
            });
        }
        catch (error) {
            res.status(errorHandler_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Profile update failed'
            });
        }
    }
    static async changePassword(req, res) {
        try {
            const user = req.user;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new errorHandler_1.AppError('Current and new password are required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            await auth_service_1.AuthService.changePassword(user.userId, currentPassword, newPassword);
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        }
        catch (error) {
            res.status(errorHandler_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Password change failed'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map