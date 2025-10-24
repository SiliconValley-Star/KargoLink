import { UserRole, AccountType } from './user.types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileImage?: string;
  companyName?: string;
  taxNumber?: string;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id?: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
  fcmToken?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  accountType?: AccountType;
  companyName?: string;
  taxNumber?: string;
  acceptTerms: boolean;
  termsAccepted?: boolean;
  acceptMarketing?: boolean;
  referralCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyPhoneRequest {
  userId: string;
  code: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  taxNumber?: string;
  profileImage?: string;
  address?: Address;
}

// JWT payload interface
export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  sessionId: string;
  iat: number;
  exp: number;
}

// Login response
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  sessionId: string;
}

// Register response
export interface RegisterResponse {
  user: User;
  tokens?: AuthTokens;
  emailVerificationRequired: boolean;
  phoneVerificationRequired: boolean;
}

// Simple auth response for admin panel
export interface AuthResponse {
  token: string;
  user: User;
  refreshToken?: string;
}