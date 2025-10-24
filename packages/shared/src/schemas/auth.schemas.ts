import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema, nameSchema } from '../utils/validation';

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre gerekli'),
  rememberMe: z.boolean().optional(),
  deviceInfo: z.object({
    deviceId: z.string(),
    platform: z.enum(['web', 'mobile', 'desktop']),
    userAgent: z.string().optional(),
  }).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Register schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  role: z.enum(['customer', 'carrier']),
  accountType: z.enum(['individual', 'business']),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Kullanım koşullarını kabul etmelisiniz' })
  }),
  marketingConsent: z.boolean().optional(),
  referralCode: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token gerekli'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Yeni şifre mevcut şifreden farklı olmalı',
  path: ['newPassword'],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Email verification schema
 */
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Doğrulama kodu gerekli'),
});

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;

/**
 * Phone verification schema
 */
export const phoneVerificationSchema = z.object({
  phone: phoneSchema,
  code: z.string().regex(/^\d{6}$/, 'Doğrulama kodu 6 haneli olmalı'),
});

export type PhoneVerificationInput = z.infer<typeof phoneVerificationSchema>;

/**
 * Send SMS code schema
 */
export const sendSMSCodeSchema = z.object({
  phone: phoneSchema,
});

export type SendSMSCodeInput = z.infer<typeof sendSMSCodeSchema>;

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token gerekli'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Two-factor authentication setup schema
 */
export const twoFactorSetupSchema = z.object({
  method: z.enum(['sms', 'email', 'authenticator']),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
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

export type TwoFactorSetupInput = z.infer<typeof twoFactorSetupSchema>;

/**
 * Two-factor authentication verify schema
 */
export const twoFactorVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Doğrulama kodu 6 haneli olmalı'),
  method: z.enum(['sms', 'email', 'authenticator']),
});

export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;

/**
 * Social auth schema
 */
export const socialAuthSchema = z.object({
  provider: z.enum(['google', 'facebook', 'apple']),
  accessToken: z.string().min(1, 'Access token gerekli'),
  idToken: z.string().optional(),
  email: emailSchema.optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type SocialAuthInput = z.infer<typeof socialAuthSchema>;

/**
 * Logout schema
 */
export const logoutSchema = z.object({
  allDevices: z.boolean().optional().default(false),
  deviceId: z.string().optional(),
});

export type LogoutInput = z.infer<typeof logoutSchema>;