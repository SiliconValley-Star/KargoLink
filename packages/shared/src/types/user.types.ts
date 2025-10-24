import { Address, BaseEntity, Contact, DeviceInfo, ID, Money, Status } from './common.types';

/**
 * User roles in the system
 */
export type UserRole = 
  | 'customer'     // Individual or business customer
  | 'carrier'      // Independent carrier/driver
  | 'admin'        // Platform administrator
  | 'moderator'    // Content moderator
  | 'support'      // Customer support
  | 'partner';     // Partner company representative

/**
 * User account types
 */
export type AccountType = 
  | 'individual'   // Bireysel kullanıcı
  | 'business';    // Kurumsal kullanıcı

/**
 * Verification status for users
 */
export type VerificationStatus = 
  | 'unverified' 
  | 'pending' 
  | 'verified' 
  | 'rejected';

/**
 * User preferences
 */
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

/**
 * Business information for corporate accounts
 */
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

/**
 * Carrier-specific information
 */
export interface CarrierInfo {
  driverLicense: string;
  driverLicenseExpiry: string;
  commercialPermit: string;
  commercialPermitExpiry: string;
  vehicleCount: number;
  serviceAreas: string[]; // City codes
  specializations: CarrierSpecialization[];
  rating: number;
  completedJobs: number;
  insurancePolicy: string;
  insuranceExpiry: string;
}

/**
 * Carrier specializations
 */
export type CarrierSpecialization = 
  | 'general'           // Genel kargo
  | 'cold_chain'        // Soğuk zincir
  | 'fragile'          // Kırılabilir ürünler
  | 'hazardous'        // Tehlikeli madde
  | 'oversized'        // Büyük boy
  | 'express'          // Hızlı teslimat
  | 'international'    // Uluslararası
  | 'documents'        // Evrak taşımacılığı
  | 'food'            // Gıda ürünleri
  | 'pharmaceutical'; // İlaç taşımacılığı

/**
 * User profile information
 */
export interface User extends BaseEntity {
  // Basic Information
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  
  // Account Information
  role: UserRole;
  accountType: AccountType;
  status: Status;
  emailVerified: boolean;
  phoneVerified: boolean;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  
  // Verification
  verificationStatus: VerificationStatus;
  verificationDocuments?: string[]; // File URLs
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: ID;
  
  // Business/Carrier Info
  businessInfo?: BusinessInfo;
  carrierInfo?: CarrierInfo;
  
  // Addresses
  addresses: Address[];
  defaultAddressId?: ID;
  
  // Preferences & Settings
  preferences: UserPreferences;
  
  // Statistics
  totalShipments: number;
  totalSpent: Money;
  rating: number;
  reviewCount: number;
  
  // Security
  lastLoginAt?: string;
  lastLoginIP?: string;
  passwordChangedAt?: string;
  twoFactorEnabled: boolean;
  
  // Devices
  devices: DeviceInfo[];
  
  // Subscription & Billing
  subscriptionPlan?: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionExpiresAt?: string;
  
  // Referral
  referralCode: string;
  referredBy?: ID;
  referralCount: number;
  
  // Compliance
  gdprConsent: boolean;
  marketingConsent: boolean;
  termsAcceptedAt: string;
  privacyPolicyAcceptedAt: string;
}

/**
 * User create request
 */
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

/**
 * User update request
 */
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

/**
 * User profile response (public information)
 */
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

/**
 * User session information
 */
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

/**
 * User notification settings
 */
export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  systemAlerts: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
  };
}

/**
 * User activity log
 */
export interface UserActivity extends BaseEntity {
  userId: ID;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}