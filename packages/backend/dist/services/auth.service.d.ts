import { LoginRequest, RegisterRequest, RefreshTokenRequest, User, UserRole } from '@cargolink/shared';
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
export declare class AuthService {
    private static readonly ACCESS_TOKEN_EXPIRES_IN;
    private static readonly REFRESH_TOKEN_EXPIRES_IN;
    static generateTokens(user: any, sessionId?: string): Promise<AuthTokens>;
    static verifyAccessToken(token: string): Promise<TokenPayload>;
    static verifyRefreshToken(token: string): Promise<TokenPayload>;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static register(data: RegisterRequest): Promise<User>;
    static login(data: LoginRequestExtended): Promise<{
        user: User;
        tokens: AuthTokens;
        sessionId: string;
    }>;
    static refreshTokens(data: RefreshTokenRequest): Promise<AuthTokens>;
    static logout(userId: string, sessionId?: string): Promise<void>;
    static getUserById(userId: string): Promise<User | null>;
    static updateProfile(userId: string, data: Partial<User>): Promise<User>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static verifyContact(userId: string, type: 'email' | 'phone', code: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map