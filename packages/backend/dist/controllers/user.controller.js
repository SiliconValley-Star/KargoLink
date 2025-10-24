"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma = (0, database_1.getPrismaClient)();
class UserController {
    static async getUsers(req, res) {
        try {
            const { page = 1, limit = 10, role, status, search } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {
                deletedAt: null
            };
            if (role) {
                where.role = role.toUpperCase();
            }
            if (status) {
                where.status = status.toUpperCase();
            }
            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
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
        }
        catch (error) {
            res.status(errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to fetch users'
            });
        }
    }
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            if (currentUser.role !== 'admin' && currentUser.userId !== id) {
                throw new errorHandler_1.AppError('Access denied', errorHandler_1.HTTP_STATUS.FORBIDDEN);
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
                throw new errorHandler_1.AppError('User not found', errorHandler_1.HTTP_STATUS.NOT_FOUND);
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
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch user'
            });
        }
    }
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            const updates = req.body;
            const isAdmin = currentUser?.role === 'admin';
            const isOwnProfile = currentUser?.userId === id;
            if (!isAdmin && !isOwnProfile) {
                throw new errorHandler_1.AppError('Access denied', errorHandler_1.HTTP_STATUS.FORBIDDEN);
            }
            const userAllowedFields = [
                'firstName', 'lastName', 'phone', 'avatar', 'birthDate',
                'gender', 'preferences', 'businessInfo', 'carrierInfo'
            ];
            const allowedUpdates = {};
            if (isAdmin) {
                const adminAllowedFields = [
                    ...userAllowedFields,
                    'role', 'status', 'verificationStatus', 'emailVerified',
                    'phoneVerified', 'subscriptionPlan', 'subscriptionExpiresAt'
                ];
                adminAllowedFields.forEach(field => {
                    if (updates[field] !== undefined) {
                        if (field === 'role' && updates[field]) {
                            allowedUpdates[field] = updates[field].toUpperCase();
                        }
                        else if (field === 'status' && updates[field]) {
                            allowedUpdates[field] = updates[field].toUpperCase();
                        }
                        else if (field === 'verificationStatus' && updates[field]) {
                            allowedUpdates[field] = updates[field].toUpperCase();
                        }
                        else if (field === 'gender' && updates[field]) {
                            allowedUpdates[field] = updates[field].toUpperCase();
                        }
                        else {
                            allowedUpdates[field] = updates[field];
                        }
                    }
                });
            }
            else {
                userAllowedFields.forEach(field => {
                    if (updates[field] !== undefined) {
                        if (field === 'gender' && updates[field]) {
                            allowedUpdates[field] = updates[field].toUpperCase();
                        }
                        else {
                            allowedUpdates[field] = updates[field];
                        }
                    }
                });
            }
            const existingUser = await prisma.user.findUnique({
                where: { id, deletedAt: null }
            });
            if (!existingUser) {
                throw new errorHandler_1.AppError('User not found', errorHandler_1.HTTP_STATUS.NOT_FOUND);
            }
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
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update user'
            });
        }
    }
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            if (currentUser?.role !== 'admin') {
                throw new errorHandler_1.AppError('Access denied', errorHandler_1.HTTP_STATUS.FORBIDDEN);
            }
            if (currentUser?.userId === id) {
                throw new errorHandler_1.AppError('Cannot delete your own account', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            const user = await prisma.user.findUnique({
                where: { id, deletedAt: null }
            });
            if (!user) {
                throw new errorHandler_1.AppError('User not found', errorHandler_1.HTTP_STATUS.NOT_FOUND);
            }
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
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to delete user'
            });
        }
    }
    static async getUserStats(req, res) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                throw new errorHandler_1.AppError('User not authenticated', errorHandler_1.HTTP_STATUS.UNAUTHORIZED);
            }
            if (currentUser.role !== 'admin') {
                throw new errorHandler_1.AppError('Access denied', errorHandler_1.HTTP_STATUS.FORBIDDEN);
            }
            const [totalUsers, activeUsers, verifiedUsers, customers, carriers, recentUsers] = await Promise.all([
                prisma.user.count({ where: { deletedAt: null } }),
                prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
                prisma.user.count({ where: { verificationStatus: 'VERIFIED', deletedAt: null } }),
                prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
                prisma.user.count({ where: { role: 'CARRIER', deletedAt: null } }),
                prisma.user.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
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
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch user statistics'
            });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map