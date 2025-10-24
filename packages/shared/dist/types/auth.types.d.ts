import { UserRole, AccountType } from './user.types';
import { ID } from './common.types';
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: UserRole;
    accountType?: AccountType;
    termsAccepted?: boolean;
    privacyPolicyAccepted?: boolean;
    referralCode?: string;
}
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface ForgotPasswordRequest {
    email: string;
}
export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
export interface VerifyEmailRequest {
    token: string;
    code: string;
}
export interface VerifyPhoneRequest {
    phone: string;
    code: string;
}
export interface ResendVerificationRequest {
    type: 'email' | 'phone';
    contact: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}
export interface LoginResponse {
    user: {
        id: ID;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        accountType: AccountType;
        isVerified: boolean;
    };
    tokens: AuthTokens;
    sessionId: string;
}
export interface RegisterResponse {
    user: {
        id: ID;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        accountType: AccountType;
    };
    message: string;
    requiresVerification: boolean;
}
export interface JWTPayload {
    userId: ID;
    email: string;
    role: UserRole;
    accountType: AccountType;
    sessionId?: string;
    iat: number;
    exp: number;
}
export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    forbiddenPatterns: string[];
}
export interface SessionInfo {
    id: string;
    userId: ID;
    deviceInfo: {
        platform: string;
        browser?: string;
        os?: string;
        userAgent: string;
    };
    location: {
        ip: string;
        country?: string;
        city?: string;
    };
    createdAt: string;
    lastActivity: string;
    expiresAt: string;
    isActive: boolean;
    isCurrent: boolean;
}
export interface TwoFactorSetupRequest {
    password: string;
}
export interface TwoFactorSetupResponse {
    secret: string;
    qrCode: string;
    backupCodes: string[];
}
export interface TwoFactorVerifyRequest {
    code: string;
    backupCode?: string;
}
export interface TwoFactorDisableRequest {
    password: string;
    code?: string;
    backupCode?: string;
}
export interface SocialLoginRequest {
    provider: 'google' | 'facebook' | 'apple' | 'linkedin';
    accessToken: string;
    refreshToken?: string;
}
export interface SocialLoginResponse extends LoginResponse {
    isNewUser: boolean;
    linkedAccounts: string[];
}
export interface AccountVerificationRequest {
    documents: {
        type: 'id_card' | 'passport' | 'driver_license' | 'business_license';
        front: string;
        back?: string;
    }[];
    additionalInfo?: {
        taxNumber?: string;
        businessName?: string;
        businessAddress?: string;
    };
}
export interface AccountVerificationResponse {
    status: 'pending' | 'approved' | 'rejected';
    message: string;
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    notes?: string;
}
export interface DeviceRegistrationRequest {
    deviceId: string;
    deviceName: string;
    platform: 'ios' | 'android' | 'web' | 'desktop';
    pushToken?: string;
    biometricEnabled?: boolean;
}
export interface TrustedDevice {
    id: string;
    deviceId: string;
    deviceName: string;
    platform: string;
    lastUsed: string;
    location: string;
    isCurrent: boolean;
    isTrusted: boolean;
}
export interface SecurityEvent {
    id: string;
    type: 'login' | 'logout' | 'password_change' | 'failed_login' | 'suspicious_activity';
    description: string;
    ip: string;
    userAgent: string;
    location?: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
}
export interface AuthApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        timestamp: string;
        requestId: string;
    };
}
//# sourceMappingURL=auth.types.d.ts.map