import { Request, Response } from 'express';
import { getPrismaClient } from '../config/database';
import { AppError, HTTP_STATUS } from '../middleware/errorHandler';

const prisma = getPrismaClient();

export class UserController {
  /**
   * Get all users (Admin only)
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, role, status, search } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {
        deletedAt: null
      };

      if (role) {
        where.role = (role as string).toUpperCase();
      }

      if (status) {
        where.status = (status as string).toUpperCase();
      }

      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            accountType: true,
            status: true,
            emailVerified: true,
            phoneVerified: true,
            verificationStatus: true,
            createdAt: true,
            lastLoginAt: true,
            totalShipments: true,
            totalSpent: true,
            rating: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          users: users.map(user => ({
            ...user,
            role: user.role.toLowerCase(),
            accountType: user.accountType.toLowerCase(),
            status: user.status.toLowerCase(),
            verificationStatus: user.verificationStatus.toLowerCase()
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch users'
      });
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // Only admin can view other users, or user can view their own profile
      if (currentUser.role !== 'admin' && currentUser.userId !== id) {
        throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
      }

      const user = await prisma.user.findUnique({
        where: { id, deletedAt: null },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          birthDate: true,
          gender: true,
          role: true,
          accountType: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          verificationStatus: true,
          verifiedAt: true,
          businessInfo: true,
          carrierInfo: true,
          preferences: true,
          totalShipments: true,
          totalSpent: true,
          rating: true,
          reviewCount: true,
          referralCode: true,
          referralCount: true,
          subscriptionPlan: true,
          subscriptionExpiresAt: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          addresses: {
            where: { isActive: true },
            select: {
              id: true,
              title: true,
              firstName: true,
              lastName: true,
              company: true,
              addressLine1: true,
              addressLine2: true,
              city: true,
              district: true,
              neighborhood: true,
              postalCode: true,
              country: true,
              phone: true,
              email: true,
              isDefault: true
            }
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
      }

      res.json({
        success: true,
        data: {
          user: {
            ...user,
            role: user.role.toLowerCase(),
            accountType: user.accountType.toLowerCase(),
            status: user.status.toLowerCase(),
            verificationStatus: user.verificationStatus.toLowerCase(),
            gender: user.gender ? user.gender.toLowerCase() : undefined,
            birthDate: user.birthDate?.toISOString(),
            emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
            phoneVerifiedAt: user.phoneVerifiedAt?.toISOString(),
            verifiedAt: user.verifiedAt?.toISOString(),
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLoginAt: user.lastLoginAt?.toISOString(),
            subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString()
          }
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch user'
      });
    }
  }

  /**
   * Update user (Admin only or own profile with limited fields)
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      const updates = req.body;

      // Check permissions
      const isAdmin = currentUser?.role === 'admin';
      const isOwnProfile = currentUser?.userId === id;

      if (!isAdmin && !isOwnProfile) {
        throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
      }

      // Allowed fields for non-admin users
      const userAllowedFields = [
        'firstName', 'lastName', 'phone', 'avatar', 'birthDate', 
        'gender', 'preferences', 'businessInfo', 'carrierInfo'
      ];

      // Filter updates based on permissions
      const allowedUpdates: any = {};
      
      if (isAdmin) {
        // Admin can update most fields
        const adminAllowedFields = [
          ...userAllowedFields,
          'role', 'status', 'verificationStatus', 'emailVerified', 
          'phoneVerified', 'subscriptionPlan', 'subscriptionExpiresAt'
        ];
        
        adminAllowedFields.forEach(field => {
          if (updates[field] !== undefined) {
            if (field === 'role' && updates[field]) {
              allowedUpdates[field] = updates[field].toUpperCase();
            } else if (field === 'status' && updates[field]) {
              allowedUpdates[field] = updates[field].toUpperCase();
            } else if (field === 'verificationStatus' && updates[field]) {
              allowedUpdates[field] = updates[field].toUpperCase();
            } else if (field === 'gender' && updates[field]) {
              allowedUpdates[field] = updates[field].toUpperCase();
            } else {
              allowedUpdates[field] = updates[field];
            }
          }
        });
      } else {
        // Regular users can only update specific fields
        userAllowedFields.forEach(field => {
          if (updates[field] !== undefined) {
            if (field === 'gender' && updates[field]) {
              allowedUpdates[field] = updates[field].toUpperCase();
            } else {
              allowedUpdates[field] = updates[field];
            }
          }
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id, deletedAt: null }
      });

      if (!existingUser) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...allowedUpdates,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          birthDate: true,
          gender: true,
          role: true,
          accountType: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          verificationStatus: true,
          preferences: true,
          businessInfo: true,
          carrierInfo: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            ...updatedUser,
            role: updatedUser.role.toLowerCase(),
            accountType: updatedUser.accountType.toLowerCase(),
            status: updatedUser.status.toLowerCase(),
            verificationStatus: updatedUser.verificationStatus.toLowerCase(),
            gender: updatedUser.gender ? updatedUser.gender.toLowerCase() : undefined,
            birthDate: updatedUser.birthDate?.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString()
          }
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update user'
      });
    }
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Only admins can delete users
      if (currentUser?.role !== 'admin') {
        throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
      }

      // Cannot delete own account
      if (currentUser?.userId === id) {
        throw new AppError('Cannot delete your own account', HTTP_STATUS.BAD_REQUEST);
      }

      const user = await prisma.user.findUnique({
        where: { id, deletedAt: null }
      });

      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
      }

      // Soft delete
      await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete user'
      });
    }
  }

  /**
   * Get user statistics (for dashboard)
   */
  static async getUserStats(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;

      if (!currentUser) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      // Only admins can view system stats
      if (currentUser.role !== 'admin') {
        throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
      }

      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        customers,
        carriers,
        recentUsers
      ] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        prisma.user.count({ where: { verificationStatus: 'VERIFIED', deletedAt: null } }),
        prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
        prisma.user.count({ where: { role: 'CARRIER', deletedAt: null } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            },
            deletedAt: null
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          stats: {
            totalUsers,
            activeUsers,
            verifiedUsers,
            customers,
            carriers,
            recentUsers,
            verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(1) : 0
          }
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch user statistics'
      });
    }
  }
}