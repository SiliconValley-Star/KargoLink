import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router: Router = Router();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 attempts per 15 minutes
  AuthController.register
);

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 attempts per 15 minutes
  AuthController.login
);

/**
 * @route POST /auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 20 }), // 20 attempts per 5 minutes
  AuthController.refresh
);

/**
 * @route POST /auth/logout
 * @desc Logout user (invalidate session)
 * @access Private
 */
router.post('/logout',
  authMiddleware,
  AuthController.logout
);

/**
 * @route GET /auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile',
  authMiddleware,
  AuthController.profile
);

/**
 * @route PUT /auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile',
  authMiddleware,
  AuthController.updateProfile
);

/**
 * @route PUT /auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 attempts per 15 minutes
  AuthController.changePassword
);

/**
 * @route GET /auth/check
 * @desc Check if user is authenticated (optional)
 * @access Public/Private
 */
router.get('/check',
  optionalAuthMiddleware,
  (req, res) => {
    res.json({
      success: true,
      data: {
        authenticated: !!(req as any).user,
        user: (req as any).user || null
      }
    });
  }
);

export default router;