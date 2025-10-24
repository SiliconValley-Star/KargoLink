import { z } from 'zod';
import { emailSchema, phoneSchema, nameSchema, taxNumberSchema, ibanSchema } from '../utils/validation';

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url().optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Business info schema
 */
export const businessInfoSchema = z.object({
  companyName: z.string().min(2, 'Şirket adı en az 2 karakter olmalı').max(100),
  taxNumber: taxNumberSchema,
  taxOffice: z.string().min(2, 'Vergi dairesi en az 2 karakter olmalı'),
  tradeRegistryNumber: z.string().optional(),
  sector: z.string().min(2, 'Sektör en az 2 karakter olmalı'),
  website: z.string().url().optional(),
  employeeCount: z.number().int().positive().optional(),
  establishmentDate: z.string().datetime().optional(),
  logo: z.string().url().optional(),
});

export type BusinessInfoInput = z.infer<typeof businessInfoSchema>;

/**
 * Carrier info schema
 */
export const carrierInfoSchema = z.object({
  driverLicense: z.string().min(5, 'Ehliyet numarası en az 5 karakter olmalı'),
  driverLicenseExpiry: z.string().datetime(),
  commercialPermit: z.string().min(5, 'Ticari belge numarası en az 5 karakter olmalı'),
  commercialPermitExpiry: z.string().datetime(),
  vehicleCount: z.number().int().positive().max(10),
  serviceAreas: z.array(z.string()).min(1, 'En az bir hizmet alanı seçmelisiniz'),
  specializations: z.array(z.enum([
    'general', 'cold_chain', 'fragile', 'hazardous', 'oversized',
    'express', 'international', 'documents', 'food', 'pharmaceutical'
  ])).min(1, 'En az bir uzmanlık alanı seçmelisiniz'),
  insurancePolicy: z.string().min(5, 'Sigorta poliçe numarası gerekli'),
  insuranceExpiry: z.string().datetime(),
});

export type CarrierInfoInput = z.infer<typeof carrierInfoSchema>;

/**
 * Address schema
 */
export const addressSchema = z.object({
  title: z.string().min(2, 'Adres başlığı en az 2 karakter olmalı').max(50),
  firstName: nameSchema,
  lastName: nameSchema,
  company: z.string().max(100).optional(),
  addressLine1: z.string().min(5, 'Adres en az 5 karakter olmalı').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2, 'Şehir en az 2 karakter olmalı').max(50),
  district: z.string().min(2, 'İlçe en az 2 karakter olmalı').max(50),
  neighborhood: z.string().max(50).optional(),
  postalCode: z.string().regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalı'),
  country: z.string().default('TR'),
  phone: phoneSchema,
  email: emailSchema.optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

/**
 * User preferences schema
 */
export const userPreferencesSchema = z.object({
  language: z.enum(['tr', 'en']).default('tr'),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
    marketing: z.boolean().default(false),
  }),
  privacy: z.object({
    showProfile: z.boolean().default(false),
    showHistory: z.boolean().default(false),
  }),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
});

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

/**
 * Notification settings schema
 */
export const notificationSettingsSchema = z.object({
  orderUpdates: z.boolean().default(true),
  promotions: z.boolean().default(false),
  systemAlerts: z.boolean().default(true),
  emailFrequency: z.enum(['immediate', 'daily', 'weekly', 'never']).default('immediate'),
  quietHours: z.object({
    enabled: z.boolean().default(false),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı').default('22:00'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı').default('08:00'),
  }),
});

export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;

/**
 * Document upload schema
 */
export const documentUploadSchema = z.object({
  type: z.enum(['identity', 'license', 'permit', 'insurance', 'tax_certificate', 'other']),
  name: z.string().min(2, 'Belge adı en az 2 karakter olmalı'),
  description: z.string().max(500).optional(),
  fileId: z.string().min(1, 'Dosya ID gerekli'),
  expiryDate: z.string().datetime().optional(),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

/**
 * Bank account schema
 */
export const bankAccountSchema = z.object({
  bankName: z.string().min(2, 'Banka adı en az 2 karakter olmalı'),
  bankCode: z.string().regex(/^\d{4}$/, 'Banka kodu 4 haneli olmalı'),
  accountNumber: z.string().min(8, 'Hesap numarası en az 8 karakter olmalı'),
  iban: ibanSchema,
  accountHolder: z.string().min(2, 'Hesap sahibi adı en az 2 karakter olmalı'),
  nickname: z.string().max(50).optional(),
  isDefault: z.boolean().optional(),
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;

/**
 * Device registration schema
 */
export const deviceRegistrationSchema = z.object({
  deviceId: z.string().min(1, 'Device ID gerekli'),
  platform: z.enum(['ios', 'android', 'web']),
  version: z.string().min(1, 'Versiyon gerekli'),
  pushToken: z.string().optional(),
  userAgent: z.string().optional(),
});

export type DeviceRegistrationInput = z.infer<typeof deviceRegistrationSchema>;

/**
 * User search schema
 */
export const userSearchSchema = z.object({
  query: z.string().min(1).optional(),
  role: z.enum(['customer', 'carrier', 'admin', 'moderator', 'support', 'partner']).optional(),
  accountType: z.enum(['individual', 'business']).optional(),
  verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
  city: z.string().optional(),
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'lastName', 'city', 'totalShipments']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type UserSearchInput = z.infer<typeof userSearchSchema>;

/**
 * Profile visibility schema
 */
export const profileVisibilitySchema = z.object({
  showEmail: z.boolean().default(false),
  showPhone: z.boolean().default(false),
  showAddress: z.boolean().default(false),
  showRating: z.boolean().default(true),
  showTotalShipments: z.boolean().default(true),
  showMemberSince: z.boolean().default(true),
});

export type ProfileVisibilityInput = z.infer<typeof profileVisibilitySchema>;