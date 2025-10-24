"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.socialAuthSchema = exports.twoFactorVerifySchema = exports.twoFactorSetupSchema = exports.refreshTokenSchema = exports.sendSMSCodeSchema = exports.phoneVerificationSchema = exports.emailVerificationSchema = exports.changePasswordSchema = exports.passwordResetSchema = exports.passwordResetRequestSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../utils/validation");
exports.loginSchema = zod_1.z.object({
    email: validation_1.emailSchema,
    password: zod_1.z.string().min(1, 'Şifre gerekli'),
    rememberMe: zod_1.z.boolean().optional(),
    deviceInfo: zod_1.z.object({
        deviceId: zod_1.z.string(),
        platform: zod_1.z.enum(['web', 'mobile', 'desktop']),
        userAgent: zod_1.z.string().optional(),
    }).optional(),
});
exports.registerSchema = zod_1.z.object({
    email: validation_1.emailSchema,
    password: validation_1.passwordSchema,
    firstName: validation_1.nameSchema,
    lastName: validation_1.nameSchema,
    phone: validation_1.phoneSchema,
    role: zod_1.z.enum(['customer', 'carrier']),
    accountType: zod_1.z.enum(['individual', 'business']),
    termsAccepted: zod_1.z.literal(true, {
        errorMap: () => ({ message: 'Kullanım koşullarını kabul etmelisiniz' })
    }),
    marketingConsent: zod_1.z.boolean().optional(),
    referralCode: zod_1.z.string().optional(),
});
exports.passwordResetRequestSchema = zod_1.z.object({
    email: validation_1.emailSchema,
});
exports.passwordResetSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token gerekli'),
    newPassword: validation_1.passwordSchema,
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Mevcut şifre gerekli'),
    newPassword: validation_1.passwordSchema,
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Yeni şifre mevcut şifreden farklı olmalı',
    path: ['newPassword'],
});
exports.emailVerificationSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Doğrulama kodu gerekli'),
});
exports.phoneVerificationSchema = zod_1.z.object({
    phone: validation_1.phoneSchema,
    code: zod_1.z.string().regex(/^\d{6}$/, 'Doğrulama kodu 6 haneli olmalı'),
});
exports.sendSMSCodeSchema = zod_1.z.object({
    phone: validation_1.phoneSchema,
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token gerekli'),
});
exports.twoFactorSetupSchema = zod_1.z.object({
    method: zod_1.z.enum(['sms', 'email', 'authenticator']),
    phone: validation_1.phoneSchema.optional(),
    email: validation_1.emailSchema.optional(),
}).refine((data) => {
    if (data.method === 'sms' && !data.phone) {
        return false;
    }
    if (data.method === 'email' && !data.email) {
        return false;
    }
    return true;
}, {
    message: 'Seçilen yöntem için gerekli bilgi sağlanmalı',
});
exports.twoFactorVerifySchema = zod_1.z.object({
    code: zod_1.z.string().regex(/^\d{6}$/, 'Doğrulama kodu 6 haneli olmalı'),
    method: zod_1.z.enum(['sms', 'email', 'authenticator']),
});
exports.socialAuthSchema = zod_1.z.object({
    provider: zod_1.z.enum(['google', 'facebook', 'apple']),
    accessToken: zod_1.z.string().min(1, 'Access token gerekli'),
    idToken: zod_1.z.string().optional(),
    email: validation_1.emailSchema.optional(),
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
});
exports.logoutSchema = zod_1.z.object({
    allDevices: zod_1.z.boolean().optional().default(false),
    deviceId: zod_1.z.string().optional(),
});
//# sourceMappingURL=auth.schemas.js.map