import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, requireRole } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router: Router = Router();

/**
 * @route GET /users
 * @desc Get all users (Admin only)
 * @access Private (Admin)
 */
router.get('/',
  authMiddleware,
  requireRole('admin'),
  rateLimit({ windowMs: 5 * 60 * 1000, max: 100 }), // 100 requests per 5 minutes
  UserController.getUsers
);

/**
 * @route GET /users/stats
 * @desc Get user statistics (Admin only)
 * @access Private (Admin)
 */
router.get('/stats',
  authMiddleware,
  requireRole('admin'),
  rateLimit({ windowMs: 5 * 60 * 1000, max: 50 }), // 50 requests per 5 minutes
  UserController.getUserStats
);

/**
 * @route GET /users/:id
 * @desc Get user by ID
 * @access Private (Admin or Own Profile)
 */
router.get('/:id',
  authMiddleware,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 200 }), // 200 requests per 5 minutes
  UserController.getUserById
);

/**
 * @route PUT /users/:id
 * @desc Update user
 * @access Private (Admin or Own Profile)
 */
router.put('/:id',
  authMiddleware,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
  UserController.updateUser
);

/**
 * @route DELETE /users/:id
 * @desc Delete user (Admin only)
 * @access Private (Admin)
 */
router.delete('/:id',
  authMiddleware,
  requireRole('admin'),
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  UserController.deleteUser
);

export default router;