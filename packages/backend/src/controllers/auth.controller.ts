import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError, HTTP_STATUS } from '../middleware/errorHandler';

export class AuthController {
  /**
   * Register new user
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone, role = 'customer', accountType = 'individual' } = req.body;

      // Basic validation
      if (!email || !password || !firstName || !lastName || !phone) {
        throw new AppError('All fields are required', HTTP_STATUS.BAD_REQUEST);
      }

      const user = await AuthService.register({
        email,
        password,
        confirmPassword: password, // For registration, use same password
        firstName,
        lastName,
        phone,
        role,
        accountType,
        acceptTerms: true,
        termsAccepted: true
      });

      res.status(HTTP_STATUS.CREATED).json({
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
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await AuthService.login({
        email,
        password,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Set cookies for web clients
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
    } catch (error: any) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }

  /**
   * Refresh tokens
   */
  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const cookieRefreshToken = req.cookies?.refreshToken;

      const token = refreshToken || cookieRefreshToken;

      if (!token) {
        throw new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST);
      }

      const tokens = await AuthService.refreshTokens({ refreshToken: token });

      // Update cookies
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
    } catch (error: any) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: error.message || 'Token refresh failed'
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const sessionId = req.body.sessionId;

      if (user) {
        await AuthService.logout(user.userId, sessionId);
      }

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Logout failed'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async profile(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
      }

      const userProfile = await AuthService.getUserById(user.userId);

      res.json({
        success: true,
        data: { user: userProfile }
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message || 'User not found'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const updates = req.body;

      const updatedUser = await AuthService.updateProfile(user.userId, updates);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Profile update failed'
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError('Current and new password are required', HTTP_STATUS.BAD_REQUEST);
      }

      await AuthService.changePassword(user.userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Password change failed'
      });
    }
  }
}