"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileVisibilitySchema = exports.userSearchSchema = exports.deviceRegistrationSchema = exports.bankAccountSchema = exports.documentUploadSchema = exports.notificationSettingsSchema = exports.userPreferencesSchema = exports.addressSchema = exports.carrierInfoSchema = exports.businessInfoSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../utils/validation");
exports.updateProfileSchema = zod_1.z.object({
    firstName: validation_1.nameSchema.optional(),
    lastName: validation_1.nameSchema.optional(),
    phone: validation_1.phoneSchema.optional(),
    avatar: zod_1.z.string().url().optional(),
    birthDate: zod_1.z.string().datetime().optional(),
    gender: zod_1.z.enum(['male', 'female', 'other']).optional(),
});
exports.businessInfoSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2, 'Şirket adı en az 2 karakter olmalı').max(100),
    taxNumber: validation_1.taxNumberSchema,
    taxOffice: zod_1.z.string().min(2, 'Vergi dairesi en az 2 karakter olmalı'),
    tradeRegistryNumber: zod_1.z.string().optional(),
    sector: zod_1.z.string().min(2, 'Sektör en az 2 karakter olmalı'),
    website: zod_1.z.string().url().optional(),
    employeeCount: zod_1.z.number().int().positive().optional(),
    establishmentDate: zod_1.z.string().datetime().optional(),
    logo: zod_1.z.string().url().optional(),
});
exports.carrierInfoSchema = zod_1.z.object({
    driverLicense: zod_1.z.string().min(5, 'Ehliyet numarası en az 5 karakter olmalı'),
    driverLicenseExpiry: zod_1.z.string().datetime(),
    commercialPermit: zod_1.z.string().min(5, 'Ticari belge numarası en az 5 karakter olmalı'),
    commercialPermitExpiry: zod_1.z.string().datetime(),
    vehicleCount: zod_1.z.number().int().positive().max(10),
    serviceAreas: zod_1.z.array(zod_1.z.string()).min(1, 'En az bir hizmet alanı seçmelisiniz'),
    specializations: zod_1.z.array(zod_1.z.enum([
        'general', 'cold_chain', 'fragile', 'hazardous', 'oversized',
        'express', 'international', 'documents', 'food', 'pharmaceutical'
    ])).min(1, 'En az bir uzmanlık alanı seçmelisiniz'),
    insurancePolicy: zod_1.z.string().min(5, 'Sigorta poliçe numarası gerekli'),
    insuranceExpiry: zod_1.z.string().datetime(),
});
exports.addressSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Adres başlığı en az 2 karakter olmalı').max(50),
    firstName: validation_1.nameSchema,
    lastName: validation_1.nameSchema,
    company: zod_1.z.string().max(100).optional(),
    addressLine1: zod_1.z.string().min(5, 'Adres en az 5 karakter olmalı').max(200),
    addressLine2: zod_1.z.string().max(200).optional(),
    city: zod_1.z.string().min(2, 'Şehir en az 2 karakter olmalı').max(50),
    district: zod_1.z.string().min(2, 'İlçe en az 2 karakter olmalı').max(50),
    neighborhood: zod_1.z.string().max(50).optional(),
    postalCode: zod_1.z.string().regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalı'),
    country: zod_1.z.string().default('TR'),
    phone: validation_1.phoneSchema,
    email: validation_1.emailSchema.optional(),
    coordinates: zod_1.z.object({
        latitude: zod_1.z.number().min(-90).max(90),
        longitude: zod_1.z.number().min(-180).max(180),
    }).optional(),
    isDefault: zod_1.z.boolean().optional(),
});
exports.userPreferencesSchema = zod_1.z.object({
    language: zod_1.z.enum(['tr', 'en']).default('tr'),
    currency: zod_1.z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
    notifications: zod_1.z.object({
        email: zod_1.z.boolean().default(true),
        push: zod_1.z.boolean().default(true),
        sms: zod_1.z.boolean().default(false),
        marketing: zod_1.z.boolean().default(false),
    }),
    privacy: zod_1.z.object({
        showProfile: zod_1.z.boolean().default(false),
        showHistory: zod_1.z.boolean().default(false),
    }),
    theme: zod_1.z.enum(['light', 'dark', 'auto']).default('auto'),
});
exports.notificationSettingsSchema = zod_1.z.object({
    orderUpdates: zod_1.z.boolean().default(true),
    promotions: zod_1.z.boolean().default(false),
    systemAlerts: zod_1.z.boolean().default(true),
    emailFrequency: zod_1.z.enum(['immediate', 'daily', 'weekly', 'never']).default('immediate'),
    quietHours: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı').default('22:00'),
        endTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı').default('08:00'),
    }),
});
exports.documentUploadSchema = zod_1.z.object({
    type: zod_1.z.enum(['identity', 'license', 'permit', 'insurance', 'tax_certificate', 'other']),
    name: zod_1.z.string().min(2, 'Belge adı en az 2 karakter olmalı'),
    description: zod_1.z.string().max(500).optional(),
    fileId: zod_1.z.string().min(1, 'Dosya ID gerekli'),
    expiryDate: zod_1.z.string().datetime().optional(),
});
exports.bankAccountSchema = zod_1.z.object({
    bankName: zod_1.z.string().min(2, 'Banka adı en az 2 karakter olmalı'),
    bankCode: zod_1.z.string().regex(/^\d{4}$/, 'Banka kodu 4 haneli olmalı'),
    accountNumber: zod_1.z.string().min(8, 'Hesap numarası en az 8 karakter olmalı'),
    iban: validation_1.ibanSchema,
    accountHolder: zod_1.z.string().min(2, 'Hesap sahibi adı en az 2 karakter olmalı'),
    nickname: zod_1.z.string().max(50).optional(),
    isDefault: zod_1.z.boolean().optional(),
});
exports.deviceRegistrationSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1, 'Device ID gerekli'),
    platform: zod_1.z.enum(['ios', 'android', 'web']),
    version: zod_1.z.string().min(1, 'Versiyon gerekli'),
    pushToken: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
});
exports.userSearchSchema = zod_1.z.object({
    query: zod_1.z.string().min(1).optional(),
    role: zod_1.z.enum(['customer', 'carrier', 'admin', 'moderator', 'support', 'partner']).optional(),
    accountType: zod_1.z.enum(['individual', 'business']).optional(),
    verificationStatus: zod_1.z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
    city: zod_1.z.string().optional(),
    dateRange: zod_1.z.object({
        startDate: zod_1.z.string().datetime(),
        endDate: zod_1.z.string().datetime(),
    }).optional(),
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'lastName', 'city', 'totalShipments']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.profileVisibilitySchema = zod_1.z.object({
    showEmail: zod_1.z.boolean().default(false),
    showPhone: zod_1.z.boolean().default(false),
    showAddress: zod_1.z.boolean().default(false),
    showRating: zod_1.z.boolean().default(true),
    showTotalShipments: zod_1.z.boolean().default(true),
    showMemberSince: zod_1.z.boolean().default(true),
});
//# sourceMappingURL=user.schemas.js.map