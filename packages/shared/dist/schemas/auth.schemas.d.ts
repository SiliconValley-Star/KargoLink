import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    rememberMe: z.ZodOptional<z.ZodBoolean>;
    deviceInfo: z.ZodOptional<z.ZodObject<{
        deviceId: z.ZodString;
        platform: z.ZodEnum<["web", "mobile", "desktop"]>;
        userAgent: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        deviceId: string;
        platform: "web" | "mobile" | "desktop";
        userAgent?: string | undefined;
    }, {
        deviceId: string;
        platform: "web" | "mobile" | "desktop";
        userAgent?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    rememberMe?: boolean | undefined;
    deviceInfo?: {
        deviceId: string;
        platform: "web" | "mobile" | "desktop";
        userAgent?: string | undefined;
    } | undefined;
}, {
    email: string;
    password: string;
    rememberMe?: boolean | undefined;
    deviceInfo?: {
        deviceId: string;
        platform: "web" | "mobile" | "desktop";
        userAgent?: string | undefined;
    } | undefined;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodString;
    role: z.ZodEnum<["customer", "carrier"]>;
    accountType: z.ZodEnum<["individual", "business"]>;
    termsAccepted: z.ZodLiteral<true>;
    marketingConsent: z.ZodOptional<z.ZodBoolean>;
    referralCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: "customer" | "carrier";
    accountType: "individual" | "business";
    termsAccepted: true;
    marketingConsent?: boolean | undefined;
    referralCode?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: "customer" | "carrier";
    accountType: "individual" | "business";
    termsAccepted: true;
    marketingConsent?: boolean | undefined;
    referralCode?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const passwordResetRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export declare const passwordResetSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newPassword: string;
    token: string;
    confirmPassword: string;
}, {
    newPassword: string;
    token: string;
    confirmPassword: string;
}>, {
    newPassword: string;
    token: string;
    confirmPassword: string;
}, {
    newPassword: string;
    token: string;
    confirmPassword: string;
}>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export declare const emailVerificationSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export declare const phoneVerificationSchema: z.ZodObject<{
    phone: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    phone: string;
}, {
    code: string;
    phone: string;
}>;
export type PhoneVerificationInput = z.infer<typeof phoneVerificationSchema>;
export declare const sendSMSCodeSchema: z.ZodObject<{
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
}, {
    phone: string;
}>;
export type SendSMSCodeInput = z.infer<typeof sendSMSCodeSchema>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export declare const twoFactorSetupSchema: z.ZodEffects<z.ZodObject<{
    method: z.ZodEnum<["sms", "email", "authenticator"]>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    method: "email" | "sms" | "authenticator";
    email?: string | undefined;
    phone?: string | undefined;
}, {
    method: "email" | "sms" | "authenticator";
    email?: string | undefined;
    phone?: string | undefined;
}>, {
    method: "email" | "sms" | "authenticator";
    email?: string | undefined;
    phone?: string | undefined;
}, {
    method: "email" | "sms" | "authenticator";
    email?: string | undefined;
    phone?: string | undefined;
}>;
export type TwoFactorSetupInput = z.infer<typeof twoFactorSetupSchema>;
export declare const twoFactorVerifySchema: z.ZodObject<{
    code: z.ZodString;
    method: z.ZodEnum<["sms", "email", "authenticator"]>;
}, "strip", z.ZodTypeAny, {
    code: string;
    method: "email" | "sms" | "authenticator";
}, {
    code: string;
    method: "email" | "sms" | "authenticator";
}>;
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;
export declare const socialAuthSchema: z.ZodObject<{
    provider: z.ZodEnum<["google", "facebook", "apple"]>;
    accessToken: z.ZodString;
    idToken: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "google" | "facebook" | "apple";
    accessToken: string;
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    idToken?: string | undefined;
}, {
    provider: "google" | "facebook" | "apple";
    accessToken: string;
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    idToken?: string | undefined;
}>;
export type SocialAuthInput = z.infer<typeof socialAuthSchema>;
export declare const logoutSchema: z.ZodObject<{
    allDevices: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    deviceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    allDevices: boolean;
    deviceId?: string | undefined;
}, {
    deviceId?: string | undefined;
    allDevices?: boolean | undefined;
}>;
export type LogoutInput = z.infer<typeof logoutSchema>;
//# sourceMappingURL=auth.schemas.d.ts.map