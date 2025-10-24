import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Geçici local type tanımları (@cargolink/shared eksik olduğu için)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: UserRole;
  accountType?: 'individual' | 'business';
  acceptTerms: boolean;
  termsAccepted: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export type UserRole = 'customer' | 'carrier' | 'admin' | 'moderator' | 'support' | 'partner';
export type Status = 'active' | 'inactive' | 'suspended' | 'banned';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  accountType: 'individual' | 'business';
  status: Status;
  avatar?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  emailVerified: boolean;
  phoneVerified: boolean;
  verificationStatus: string;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  verifiedAt?: string;
  lastLoginAt?: string;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt: string;
  termsAcceptedAt: string;
  privacyPolicyAcceptedAt: string;
  businessInfo?: any;
  carrierInfo?: any;
  addresses: any[];
  devices: any[];
  preferences?: any;
}

const prisma = new PrismaClient();

// Enum mapping functions
const mapRoleToPrisma = (role: UserRole): any => {
  const roleMap: Record<UserRole, string> = {
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

const mapRoleFromPrisma = (role: any): UserRole => {
  const roleMap: Record<string, UserRole> = {
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

const mapAccountTypeToPrisma = (accountType: string): any => {
  return accountType === 'individual' ? 'INDIVIDUAL' : 'BUSINESS';
};

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId?: string;
}

export interface LoginRequestExtended extends LoginRequest {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private static readonly ACCESS_TOKEN_EXPIRES_IN = '24h';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  /**
   * Generate JWT tokens for user
   */
  static async generateTokens(user: any, sessionId?: string): Promise<AuthTokens> {
    const payload: TokenPayload = {
      userId: user.id.toString(),
      email: user.email,
      role: mapRoleFromPrisma(user.role),
      sessionId
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    };
  }

  /**
   * Verify JWT access token
   */
  static async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify JWT refresh token
   */
  static async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return bcryptjs.hash(password, rounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  /**
   * Register new user
   */
  static async register(data: RegisterRequest): Promise<User> {
    // Check if user already exists
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

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        phone: data.phone!,  // Non-null assertion - phone is required in controller
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
        preferences: JSON.stringify({
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
        }),
        // Add carrier-specific info if role is carrier
        ...(data.role === 'carrier' && {
          carrierInfo: JSON.stringify({
            driverLicense: '',
            commercialPermit: '',
            vehicleCount: 0,
            serviceAreas: [],
            specializations: ['general'],
            rating: 0,
            completedJobs: 0
          })
        })
      }
    });

    // Remove password from response and convert to shared type
    const { password: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      role: mapRoleFromPrisma(user.role),
      accountType: user.accountType.toLowerCase() as 'individual' | 'business',
      status: user.status.toLowerCase() as Status,
      verificationStatus: user.verificationStatus.toLowerCase() as any,
      gender: user.gender ? user.gender.toLowerCase() as 'male' | 'female' | 'other' : undefined,
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
      businessInfo: user.businessInfo as any,
      carrierInfo: user.carrierInfo as any,
      addresses: [],
      devices: []
    } as unknown as User;
  }

  /**
   * Login user
   */
  static async login(data: LoginRequestExtended): Promise<{ user: User; tokens: AuthTokens; sessionId: string }> {
    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase() },
          { phone: data.email } // Can also login with phone in email field
        ]
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new Error('Account is not active');
    }

    // Compare password
    const isPasswordValid = await this.comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Create user session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken: '', // Will be updated with refresh token
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: data.ipAddress || '',
        userAgent: data.userAgent,
        deviceInfo: JSON.stringify({
          platform: 'web',
          userAgent: data.userAgent || ''
        }),
        isActive: true
      }
    });

    // Generate tokens
    const tokens = await this.generateTokens(user, session.id);

    // Update session with refresh token
    await prisma.userSession.update({
      where: { id: session.id },
      data: { refreshToken: tokens.refreshToken }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        lastActiveAt: new Date()
      }
    });

    // Remove password from response and convert to shared type
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: {
        ...userWithoutPassword,
        role: mapRoleFromPrisma(user.role),
        accountType: user.accountType.toLowerCase() as 'individual' | 'business',
        status: user.status.toLowerCase() as Status,
        verificationStatus: user.verificationStatus.toLowerCase() as any,
        gender: user.gender ? user.gender.toLowerCase() as 'male' | 'female' | 'other' : undefined,
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
        businessInfo: user.businessInfo as any,
        carrierInfo: user.carrierInfo as any,
        addresses: [],
        devices: []
      } as unknown as User,
      tokens,
      sessionId: session.id
    };
  }

  /**
   * Refresh tokens
   */
  static async refreshTokens(data: RefreshTokenRequest): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = await this.verifyRefreshToken(data.refreshToken);

      // Find user session
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

      // Check if user is still active
      if (session.user.status !== 'ACTIVE') {
        throw new Error('Account is not active');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(session.user, session.id);

      // Update session with new refresh token
      await prisma.userSession.update({
        where: { id: session.id },
        data: { 
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lastActivity: new Date()
        }
      });

      // Update user last active
      await prisma.user.update({
        where: { id: session.user.id },
        data: { lastActiveAt: new Date() }
      });

      return tokens;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user (invalidate session)
   */
  static async logout(userId: string, sessionId?: string): Promise<void> {
    if (sessionId) {
      // Logout specific session
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { 
          isActive: false,
          lastActivity: new Date()
        }
      });
    } else {
      // Logout all sessions for user
      await prisma.userSession.updateMany({
        where: { userId },
        data: { 
          isActive: false,
          lastActivity: new Date()
        }
      });
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          where: { isActive: true },
          orderBy: { isDefault: 'desc' }
        }
      }
    });

    if (!user) return null;

    // Remove password from response and convert to shared type
    const { password: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      role: mapRoleFromPrisma(user.role),
      accountType: user.accountType.toLowerCase() as 'individual' | 'business',
      status: user.status.toLowerCase() as Status,
      verificationStatus: user.verificationStatus.toLowerCase() as any,
      gender: user.gender ? user.gender.toLowerCase() as 'male' | 'female' | 'other' : undefined,
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
      businessInfo: user.businessInfo as any,
      carrierInfo: user.carrierInfo as any,
      addresses: user.addresses || [],
      devices: []
    } as unknown as User;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    // Only allow safe fields to be updated
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'avatar',
      'birthDate',
      'gender'
    ];
    
    const updateData: any = {};
    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = (data as any)[key];
      }
    });
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    // Remove password from response and convert to shared type
    const { password: _, ...userWithoutPassword } = updatedUser;
    return {
      ...userWithoutPassword,
      role: mapRoleFromPrisma(updatedUser.role),
      accountType: updatedUser.accountType.toLowerCase() as 'individual' | 'business',
      status: updatedUser.status.toLowerCase() as Status,
      verificationStatus: updatedUser.verificationStatus.toLowerCase() as any,
      gender: updatedUser.gender ? updatedUser.gender.toLowerCase() as 'male' | 'female' | 'other' : undefined,
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
      businessInfo: updatedUser.businessInfo as any,
      carrierInfo: updatedUser.carrierInfo as any,
      addresses: [],
      devices: []
    } as unknown as User;
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Logout all other sessions (force re-login)
    await prisma.userSession.updateMany({
      where: { userId },
      data: { 
        isActive: false,
        lastActivity: new Date()
      }
    });
  }

  /**
   * Verify email/phone (simplified version)
   */
  static async verifyContact(
    userId: string, 
    type: 'email' | 'phone',
    code: string
  ): Promise<void> {
    // In a real implementation, you would verify the code against a stored verification code
    // For now, we'll just mark it as verified
    
    const updateData = type === 'email' 
      ? { 
          emailVerified: true, 
          emailVerifiedAt: new Date(),
          verificationStatus: 'VERIFIED' as const,
          verifiedAt: new Date()
        }
      : { 
          phoneVerified: true, 
          phoneVerifiedAt: new Date(),
          verificationStatus: 'VERIFIED' as const,
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