import { Address, BaseEntity, DeviceInfo, ID, Money, Status } from './common.types';
export type UserRole = 'customer' | 'carrier' | 'admin' | 'moderator' | 'support' | 'partner';
export type AccountType = 'individual' | 'business';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export interface UserPreferences {
    language: 'tr' | 'en';
    currency: 'TRY' | 'USD' | 'EUR';
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
        marketing: boolean;
    };
    privacy: {
        showProfile: boolean;
        showHistory: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
}
export interface BusinessInfo {
    companyName: string;
    taxNumber: string;
    taxOffice: string;
    tradeRegistryNumber?: string;
    sector: string;
    website?: string;
    employeeCount?: number;
    establishmentDate?: string;
    logo?: string;
}
export interface CarrierInfo {
    driverLicense: string;
    driverLicenseExpiry: string;
    commercialPermit: string;
    commercialPermitExpiry: string;
    vehicleCount: number;
    serviceAreas: string[];
    specializations: CarrierSpecialization[];
    rating: number;
    completedJobs: number;
    insurancePolicy: string;
    insuranceExpiry: string;
}
export type CarrierSpecialization = 'general' | 'cold_chain' | 'fragile' | 'hazardous' | 'oversized' | 'express' | 'international' | 'documents' | 'food' | 'pharmaceutical';
export interface User extends BaseEntity {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
    role: UserRole;
    accountType: AccountType;
    status: Status;
    emailVerified: boolean;
    phoneVerified: boolean;
    emailVerifiedAt?: string;
    phoneVerifiedAt?: string;
    verificationStatus: VerificationStatus;
    verificationDocuments?: string[];
    verificationNotes?: string;
    verifiedAt?: string;
    verifiedBy?: ID;
    businessInfo?: BusinessInfo;
    carrierInfo?: CarrierInfo;
    addresses: Address[];
    defaultAddressId?: ID;
    preferences: UserPreferences;
    totalShipments: number;
    totalSpent: Money;
    rating: number;
    reviewCount: number;
    lastLoginAt?: string;
    lastLoginIP?: string;
    passwordChangedAt?: string;
    twoFactorEnabled: boolean;
    devices: DeviceInfo[];
    subscriptionPlan?: 'free' | 'basic' | 'pro' | 'enterprise';
    subscriptionExpiresAt?: string;
    referralCode: string;
    referredBy?: ID;
    referralCount: number;
    gdprConsent: boolean;
    marketingConsent: boolean;
    termsAcceptedAt: string;
    privacyPolicyAcceptedAt: string;
}
export interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    accountType: AccountType;
    businessInfo?: Partial<BusinessInfo>;
    carrierInfo?: Partial<CarrierInfo>;
    preferences?: Partial<UserPreferences>;
    referralCode?: string;
}
export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
    businessInfo?: Partial<BusinessInfo>;
    carrierInfo?: Partial<CarrierInfo>;
    preferences?: Partial<UserPreferences>;
}
export interface UserProfile {
    id: ID;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: UserRole;
    accountType: AccountType;
    verificationStatus: VerificationStatus;
    rating: number;
    reviewCount: number;
    memberSince: string;
    businessInfo?: Pick<BusinessInfo, 'companyName' | 'sector' | 'website'>;
    carrierInfo?: Pick<CarrierInfo, 'specializations' | 'rating' | 'completedJobs' | 'serviceAreas'>;
}
export interface UserSession {
    id: ID;
    user: User;
    deviceInfo: DeviceInfo;
    ipAddress: string;
    userAgent: string;
    lastActivity: string;
    expiresAt: string;
    isActive: boolean;
}
export interface NotificationSettings {
    orderUpdates: boolean;
    promotions: boolean;
    systemAlerts: boolean;
    emailFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
    quietHours: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    };
}
export interface UserActivity extends BaseEntity {
    userId: ID;
    action: string;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
//# sourceMappingURL=user.types.d.ts.map