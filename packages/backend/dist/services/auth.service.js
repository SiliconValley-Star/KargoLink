"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const mapRoleToPrisma = (role) => {
    const roleMap = {
        'customer': 'CUSTOMER',
        'carrier': 'CARRIER',
        'admin': 'ADMIN',
        'moderator': 'MODERATOR',
        'support': 'SUPPORT',
        'partner': 'PARTNER'
    };
    const mappedRole = roleMap[role];
    if (!mappedRole) {
        throw new Error(`Invalid user role: ${role}`);
    }
    return mappedRole;
};
const mapRoleFromPrisma = (role) => {
    const roleMap = {
        'CUSTOMER': 'customer',
        'CARRIER': 'carrier',
        'ADMIN': 'admin',
        'MODERATOR': 'moderator',
        'SUPPORT': 'support',
        'PARTNER': 'partner'
    };
    const mappedRole = roleMap[role];
    if (!mappedRole) {
        throw new Error(`Invalid prisma role: ${role}`);
    }
    return mappedRole;
};
const mapAccountTypeToPrisma = (accountType) => {
    return accountType === 'individual' ? 'INDIVIDUAL' : 'BUSINESS';
};
class AuthService {
    static ACCESS_TOKEN_EXPIRES_IN = '24h';
    static REFRESH_TOKEN_EXPIRES_IN = '7d';
    static async generateTokens(user, sessionId) {
        const payload = {
            userId: user.id.toString(),
            email: user.email,
            role: mapRoleFromPrisma(user.role),
            sessionId
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN });
        return {
            accessToken,
            refreshToken,
            expiresIn: 24 * 60 * 60
        };
    }
    static async verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    static async verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
    static async hashPassword(password) {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
        return bcryptjs_1.default.hash(password, rounds);
    }
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    static async register(data) {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { phone: data.phone }
                ]
            }
        });
        if (existingUser) {
            throw new Error('User already exists with this email or phone');
        }
        const hashedPassword = await this.hashPassword(data.password);
        const user = await prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                phone: data.phone,
                firstName: data.firstName,
                lastName: data.lastName,
                password: hashedPassword,
                role: mapRoleToPrisma(data.role || 'customer'),
                accountType: mapAccountTypeToPrisma(data.accountType || 'individual'),
                status: 'ACTIVE',
                emailVerified: false,
                phoneVerified: false,
                verificationStatus: 'UNVERIFIED',
                termsAcceptedAt: new Date(),
                privacyPolicyAcceptedAt: new Date(),
                preferences: {
                    language: 'tr',
                    currency: 'TRY',
                    notifications: {
                        email: true,
                        push: true,
                        sms: false,
                        marketing: false
                    },
                    privacy: {
                        showProfile: false,
                        showHistory: false
                    },
                    theme: 'light'
                },
                ...(data.role === 'carrier' && {
                    carrierInfo: {
                        driverLicense: '',
                        commercialPermit: '',
                        vehicleCount: 0,
                        serviceAreas: [],
                        specializations: ['general'],
                        rating: 0,
                        completedJobs: 0
                    }
                })
            }
        });
        const { password: _, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            role: mapRoleFromPrisma(user.role),
            accountType: user.accountType.toLowerCase(),
            status: user.status.toLowerCase(),
            verificationStatus: user.verificationStatus.toLowerCase(),
            gender: user.gender ? user.gender.toLowerCase() : undefined,
            birthDate: user.birthDate ? user.birthDate.toISOString() : undefined,
            emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : undefined,
            phoneVerifiedAt: user.phoneVerifiedAt ? user.phoneVerifiedAt.toISOString() : undefined,
            verifiedAt: user.verifiedAt ? user.verifiedAt.toISOString() : undefined,
            lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : undefined,
            passwordChangedAt: user.passwordChangedAt ? user.passwordChangedAt.toISOString() : undefined,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            termsAcceptedAt: user.termsAcceptedAt.toISOString(),
            privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt.toISOString(),
            businessInfo: user.businessInfo,
            carrierInfo: user.carrierInfo,
            addresses: [],
            devices: []
        };
    }
    static async login(data) {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email.toLowerCase() },
                    { phone: data.email }
                ]
            }
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        if (user.status !== 'ACTIVE') {
            throw new Error('Account is not active');
        }
        const isPasswordValid = await this.comparePassword(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        const session = await prisma.userSession.create({
            data: {
                userId: user.id,
                refreshToken: '',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                ipAddress: data.ipAddress || '',
                userAgent: data.userAgent,
                deviceInfo: {
                    platform: 'web',
                    userAgent: data.userAgent || ''
                },
                isActive: true
            }
        });
        const tokens = await this.generateTokens(user, session.id);
        await prisma.userSession.update({
            where: { id: session.id },
            data: { refreshToken: tokens.refreshToken }
        });
        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastActiveAt: new Date()
            }
        });
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: {
                ...userWithoutPassword,
                role: mapRoleFromPrisma(user.role),
                accountType: user.accountType.toLowerCase(),
                status: user.status.toLowerCase(),
                verificationStatus: user.verificationStatus.toLowerCase(),
                gender: user.gender ? user.gender.toLowerCase() : undefined,
                birthDate: user.birthDate ? user.birthDate.toISOString() : undefined,
                emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : undefined,
                phoneVerifiedAt: user.phoneVerifiedAt ? user.phoneVerifiedAt.toISOString() : undefined,
                verifiedAt: user.verifiedAt ? user.verifiedAt.toISOString() : undefined,
                lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : undefined,
                passwordChangedAt: user.passwordChangedAt ? user.passwordChangedAt.toISOString() : undefined,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                termsAcceptedAt: user.termsAcceptedAt.toISOString(),
                privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt.toISOString(),
                businessInfo: user.businessInfo,
                carrierInfo: user.carrierInfo,
                addresses: [],
                devices: []
            },
            tokens,
            sessionId: session.id
        };
    }
    static async refreshTokens(data) {
        try {
            const decoded = await this.verifyRefreshToken(data.refreshToken);
            const session = await prisma.userSession.findFirst({
                where: {
                    refreshToken: data.refreshToken,
                    isActive: true,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                include: {
                    user: true
                }
            });
            if (!session || !session.user) {
                throw new Error('Invalid refresh token');
            }
            if (session.user.status !== 'ACTIVE') {
                throw new Error('Account is not active');
            }
            const tokens = await this.generateTokens(session.user, session.id);
            await prisma.userSession.update({
                where: { id: session.id },
                data: {
                    refreshToken: tokens.refreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    lastActivity: new Date()
                }
            });
            await prisma.user.update({
                where: { id: session.user.id },
                data: { lastActiveAt: new Date() }
            });
            return tokens;
        }
        catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
    static async logout(userId, sessionId) {
        if (sessionId) {
            await prisma.userSession.update({
                where: { id: sessionId },
                data: {
                    isActive: false,
                    lastActivity: new Date()
                }
            });
        }
        else {
            await prisma.userSession.updateMany({
                where: { userId },
                data: {
                    isActive: false,
                    lastActivity: new Date()
                }
            });
        }
    }
    static async getUserById(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                addresses: {
                    where: { isActive: true },
                    orderBy: { isDefault: 'desc' }
                }
            }
        });
        if (!user)
            return null;
        const { password: _, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            role: mapRoleFromPrisma(user.role),
            accountType: user.accountType.toLowerCase(),
            status: user.status.toLowerCase(),
            verificationStatus: user.verificationStatus.toLowerCase(),
            gender: user.gender ? user.gender.toLowerCase() : undefined,
            birthDate: user.birthDate ? user.birthDate.toISOString() : undefined,
            emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : undefined,
            phoneVerifiedAt: user.phoneVerifiedAt ? user.phoneVerifiedAt.toISOString() : undefined,
            verifiedAt: user.verifiedAt ? user.verifiedAt.toISOString() : undefined,
            lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : undefined,
            passwordChangedAt: user.passwordChangedAt ? user.passwordChangedAt.toISOString() : undefined,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            termsAcceptedAt: user.termsAcceptedAt.toISOString(),
            privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt.toISOString(),
            businessInfo: user.businessInfo,
            carrierInfo: user.carrierInfo,
            addresses: user.addresses || [],
            devices: []
        };
    }
    static async updateProfile(userId, data) {
        const allowedFields = [
            'firstName',
            'lastName',
            'phone',
            'avatar',
            'birthDate',
            'gender'
        ];
        const updateData = {};
        Object.keys(data).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = data[key];
            }
        });
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });
        const { password: _, ...userWithoutPassword } = updatedUser;
        return {
            ...userWithoutPassword,
            role: mapRoleFromPrisma(updatedUser.role),
            accountType: updatedUser.accountType.toLowerCase(),
            status: updatedUser.status.toLowerCase(),
            verificationStatus: updatedUser.verificationStatus.toLowerCase(),
            gender: updatedUser.gender ? updatedUser.gender.toLowerCase() : undefined,
            birthDate: updatedUser.birthDate ? updatedUser.birthDate.toISOString() : undefined,
            emailVerifiedAt: updatedUser.emailVerifiedAt ? updatedUser.emailVerifiedAt.toISOString() : undefined,
            phoneVerifiedAt: updatedUser.phoneVerifiedAt ? updatedUser.phoneVerifiedAt.toISOString() : undefined,
            verifiedAt: updatedUser.verifiedAt ? updatedUser.verifiedAt.toISOString() : undefined,
            lastLoginAt: updatedUser.lastLoginAt ? updatedUser.lastLoginAt.toISOString() : undefined,
            passwordChangedAt: updatedUser.passwordChangedAt ? updatedUser.passwordChangedAt.toISOString() : undefined,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
            termsAcceptedAt: updatedUser.termsAcceptedAt.toISOString(),
            privacyPolicyAcceptedAt: updatedUser.privacyPolicyAcceptedAt.toISOString(),
            businessInfo: updatedUser.businessInfo,
            carrierInfo: updatedUser.carrierInfo,
            addresses: [],
            devices: []
        };
    }
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        const hashedNewPassword = await this.hashPassword(newPassword);
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
                passwordChangedAt: new Date(),
                updatedAt: new Date()
            }
        });
        await prisma.userSession.updateMany({
            where: { userId },
            data: {
                isActive: false,
                lastActivity: new Date()
            }
        });
    }
    static async verifyContact(userId, type, code) {
        const updateData = type === 'email'
            ? {
                emailVerified: true,
                emailVerifiedAt: new Date(),
                verificationStatus: 'VERIFIED',
                verifiedAt: new Date()
            }
            : {
                phoneVerified: true,
                phoneVerifiedAt: new Date(),
                verificationStatus: 'VERIFIED',
                verifiedAt: new Date()
            };
        await prisma.user.update({
            where: { id: userId },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map