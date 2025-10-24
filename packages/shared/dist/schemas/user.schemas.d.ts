import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    birthDate?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    birthDate?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export declare const businessInfoSchema: z.ZodObject<{
    companyName: z.ZodString;
    taxNumber: z.ZodString;
    taxOffice: z.ZodString;
    tradeRegistryNumber: z.ZodOptional<z.ZodString>;
    sector: z.ZodString;
    website: z.ZodOptional<z.ZodString>;
    employeeCount: z.ZodOptional<z.ZodNumber>;
    establishmentDate: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyName: string;
    sector: string;
    taxNumber: string;
    taxOffice: string;
    website?: string | undefined;
    tradeRegistryNumber?: string | undefined;
    employeeCount?: number | undefined;
    establishmentDate?: string | undefined;
    logo?: string | undefined;
}, {
    companyName: string;
    sector: string;
    taxNumber: string;
    taxOffice: string;
    website?: string | undefined;
    tradeRegistryNumber?: string | undefined;
    employeeCount?: number | undefined;
    establishmentDate?: string | undefined;
    logo?: string | undefined;
}>;
export type BusinessInfoInput = z.infer<typeof businessInfoSchema>;
export declare const carrierInfoSchema: z.ZodObject<{
    driverLicense: z.ZodString;
    driverLicenseExpiry: z.ZodString;
    commercialPermit: z.ZodString;
    commercialPermitExpiry: z.ZodString;
    vehicleCount: z.ZodNumber;
    serviceAreas: z.ZodArray<z.ZodString, "many">;
    specializations: z.ZodArray<z.ZodEnum<["general", "cold_chain", "fragile", "hazardous", "oversized", "express", "international", "documents", "food", "pharmaceutical"]>, "many">;
    insurancePolicy: z.ZodString;
    insuranceExpiry: z.ZodString;
}, "strip", z.ZodTypeAny, {
    specializations: ("general" | "cold_chain" | "fragile" | "hazardous" | "oversized" | "express" | "international" | "documents" | "food" | "pharmaceutical")[];
    serviceAreas: string[];
    driverLicense: string;
    driverLicenseExpiry: string;
    commercialPermit: string;
    commercialPermitExpiry: string;
    vehicleCount: number;
    insurancePolicy: string;
    insuranceExpiry: string;
}, {
    specializations: ("general" | "cold_chain" | "fragile" | "hazardous" | "oversized" | "express" | "international" | "documents" | "food" | "pharmaceutical")[];
    serviceAreas: string[];
    driverLicense: string;
    driverLicenseExpiry: string;
    commercialPermit: string;
    commercialPermitExpiry: string;
    vehicleCount: number;
    insurancePolicy: string;
    insuranceExpiry: string;
}>;
export type CarrierInfoInput = z.infer<typeof carrierInfoSchema>;
export declare const addressSchema: z.ZodObject<{
    title: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodString;
    addressLine2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    district: z.ZodString;
    neighborhood: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    coordinates: z.ZodOptional<z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        latitude: number;
        longitude: number;
    }, {
        latitude: number;
        longitude: number;
    }>>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
    email?: string | undefined;
    company?: string | undefined;
    addressLine2?: string | undefined;
    neighborhood?: string | undefined;
    isDefault?: boolean | undefined;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
}, {
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    city: string;
    district: string;
    postalCode: string;
    email?: string | undefined;
    company?: string | undefined;
    addressLine2?: string | undefined;
    neighborhood?: string | undefined;
    country?: string | undefined;
    isDefault?: boolean | undefined;
    coordinates?: {
        latitude: number;
        longitude: number;
    } | undefined;
}>;
export type AddressInput = z.infer<typeof addressSchema>;
export declare const userPreferencesSchema: z.ZodObject<{
    language: z.ZodDefault<z.ZodEnum<["tr", "en"]>>;
    currency: z.ZodDefault<z.ZodEnum<["TRY", "USD", "EUR"]>>;
    notifications: z.ZodObject<{
        email: z.ZodDefault<z.ZodBoolean>;
        push: z.ZodDefault<z.ZodBoolean>;
        sms: z.ZodDefault<z.ZodBoolean>;
        marketing: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email: boolean;
        sms: boolean;
        push: boolean;
        marketing: boolean;
    }, {
        email?: boolean | undefined;
        sms?: boolean | undefined;
        push?: boolean | undefined;
        marketing?: boolean | undefined;
    }>;
    privacy: z.ZodObject<{
        showProfile: z.ZodDefault<z.ZodBoolean>;
        showHistory: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        showProfile: boolean;
        showHistory: boolean;
    }, {
        showProfile?: boolean | undefined;
        showHistory?: boolean | undefined;
    }>;
    theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
}, "strip", z.ZodTypeAny, {
    currency: "TRY" | "USD" | "EUR";
    language: "tr" | "en";
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
        marketing: boolean;
    };
    privacy: {
        showProfile: boolean;
        showHistory: boolean;
    };
    theme: "light" | "dark" | "auto";
}, {
    notifications: {
        email?: boolean | undefined;
        sms?: boolean | undefined;
        push?: boolean | undefined;
        marketing?: boolean | undefined;
    };
    privacy: {
        showProfile?: boolean | undefined;
        showHistory?: boolean | undefined;
    };
    currency?: "TRY" | "USD" | "EUR" | undefined;
    language?: "tr" | "en" | undefined;
    theme?: "light" | "dark" | "auto" | undefined;
}>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export declare const notificationSettingsSchema: z.ZodObject<{
    orderUpdates: z.ZodDefault<z.ZodBoolean>;
    promotions: z.ZodDefault<z.ZodBoolean>;
    systemAlerts: z.ZodDefault<z.ZodBoolean>;
    emailFrequency: z.ZodDefault<z.ZodEnum<["immediate", "daily", "weekly", "never"]>>;
    quietHours: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        startTime: z.ZodDefault<z.ZodString>;
        endTime: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        startTime: string;
        endTime: string;
    }, {
        enabled?: boolean | undefined;
        startTime?: string | undefined;
        endTime?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    orderUpdates: boolean;
    promotions: boolean;
    systemAlerts: boolean;
    emailFrequency: "immediate" | "daily" | "weekly" | "never";
    quietHours: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    };
}, {
    quietHours: {
        enabled?: boolean | undefined;
        startTime?: string | undefined;
        endTime?: string | undefined;
    };
    orderUpdates?: boolean | undefined;
    promotions?: boolean | undefined;
    systemAlerts?: boolean | undefined;
    emailFrequency?: "immediate" | "daily" | "weekly" | "never" | undefined;
}>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export declare const documentUploadSchema: z.ZodObject<{
    type: z.ZodEnum<["identity", "license", "permit", "insurance", "tax_certificate", "other"]>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    fileId: z.ZodString;
    expiryDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "other" | "insurance" | "license" | "tax_certificate" | "identity" | "permit";
    fileId: string;
    description?: string | undefined;
    expiryDate?: string | undefined;
}, {
    name: string;
    type: "other" | "insurance" | "license" | "tax_certificate" | "identity" | "permit";
    fileId: string;
    description?: string | undefined;
    expiryDate?: string | undefined;
}>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export declare const bankAccountSchema: z.ZodObject<{
    bankName: z.ZodString;
    bankCode: z.ZodString;
    accountNumber: z.ZodString;
    iban: z.ZodString;
    accountHolder: z.ZodString;
    nickname: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    iban: string;
    accountHolder: string;
    isDefault?: boolean | undefined;
    nickname?: string | undefined;
}, {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    iban: string;
    accountHolder: string;
    isDefault?: boolean | undefined;
    nickname?: string | undefined;
}>;
export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export declare const deviceRegistrationSchema: z.ZodObject<{
    deviceId: z.ZodString;
    platform: z.ZodEnum<["ios", "android", "web"]>;
    version: z.ZodString;
    pushToken: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    deviceId: string;
    platform: "ios" | "android" | "web";
    version: string;
    userAgent?: string | undefined;
    pushToken?: string | undefined;
}, {
    deviceId: string;
    platform: "ios" | "android" | "web";
    version: string;
    userAgent?: string | undefined;
    pushToken?: string | undefined;
}>;
export type DeviceRegistrationInput = z.infer<typeof deviceRegistrationSchema>;
export declare const userSearchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["customer", "carrier", "admin", "moderator", "support", "partner"]>>;
    accountType: z.ZodOptional<z.ZodEnum<["individual", "business"]>>;
    verificationStatus: z.ZodOptional<z.ZodEnum<["unverified", "pending", "verified", "rejected"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending", "suspended"]>>;
    city: z.ZodOptional<z.ZodString>;
    dateRange: z.ZodOptional<z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        endDate: string;
    }, {
        startDate: string;
        endDate: string;
    }>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "lastName", "city", "totalShipments"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "lastName" | "city" | "createdAt" | "totalShipments";
    sortOrder: "asc" | "desc";
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
    role?: "customer" | "carrier" | "admin" | "moderator" | "support" | "partner" | undefined;
    accountType?: "individual" | "business" | undefined;
    city?: string | undefined;
    status?: "active" | "inactive" | "pending" | "suspended" | undefined;
    query?: string | undefined;
    verificationStatus?: "pending" | "unverified" | "verified" | "rejected" | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
    role?: "customer" | "carrier" | "admin" | "moderator" | "support" | "partner" | undefined;
    accountType?: "individual" | "business" | undefined;
    city?: string | undefined;
    status?: "active" | "inactive" | "pending" | "suspended" | undefined;
    query?: string | undefined;
    sortBy?: "lastName" | "city" | "createdAt" | "totalShipments" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    verificationStatus?: "pending" | "unverified" | "verified" | "rejected" | undefined;
}>;
export type UserSearchInput = z.infer<typeof userSearchSchema>;
export declare const profileVisibilitySchema: z.ZodObject<{
    showEmail: z.ZodDefault<z.ZodBoolean>;
    showPhone: z.ZodDefault<z.ZodBoolean>;
    showAddress: z.ZodDefault<z.ZodBoolean>;
    showRating: z.ZodDefault<z.ZodBoolean>;
    showTotalShipments: z.ZodDefault<z.ZodBoolean>;
    showMemberSince: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    showEmail: boolean;
    showPhone: boolean;
    showAddress: boolean;
    showRating: boolean;
    showTotalShipments: boolean;
    showMemberSince: boolean;
}, {
    showEmail?: boolean | undefined;
    showPhone?: boolean | undefined;
    showAddress?: boolean | undefined;
    showRating?: boolean | undefined;
    showTotalShipments?: boolean | undefined;
    showMemberSince?: boolean | undefined;
}>;
export type ProfileVisibilityInput = z.infer<typeof profileVisibilitySchema>;
//# sourceMappingURL=user.schemas.d.ts.map