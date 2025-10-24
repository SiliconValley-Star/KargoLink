import { z } from 'zod';
export declare const emailSchema: z.ZodString;
export declare const phoneSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const nameSchema: z.ZodString;
export declare const taxNumberSchema: z.ZodString;
export declare const ibanSchema: z.ZodString;
export declare const postalCodeSchema: z.ZodString;
export declare const coordinatesSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
}, {
    latitude: number;
    longitude: number;
}>;
export declare const dimensionsSchema: z.ZodObject<{
    length: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    weight: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    weight: number;
    length: number;
    width: number;
    height: number;
}, {
    weight: number;
    length: number;
    width: number;
    height: number;
}>;
export declare const moneySchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodEnum<["TRY", "USD", "EUR"]>;
}, "strip", z.ZodTypeAny, {
    currency: "TRY" | "USD" | "EUR";
    amount: number;
}, {
    currency: "TRY" | "USD" | "EUR";
    amount: number;
}>;
export declare const ValidationUtils: {
    isValidEmail: (email: string) => boolean;
    isValidPhone: (phone: string) => boolean;
    isValidPassword: (password: string) => boolean;
    isValidTaxNumber: (taxNumber: string) => boolean;
    isValidTCIdentity: (identity: string) => boolean;
    isValidIBAN: (iban: string) => boolean;
    sanitizeString: (input: string) => string;
    formatPhone: (phone: string) => string;
    formatMoney: (amount: number, currency?: "TRY" | "USD" | "EUR") => string;
    isInTurkey: (latitude: number, longitude: number) => boolean;
    parseCoordinates: (lat: string | number, lng: string | number) => {
        latitude: number;
        longitude: number;
    };
    isValidFileType: (fileName: string, allowedTypes: string[]) => boolean;
    getPasswordStrength: (password: string) => "weak" | "medium" | "strong";
};
export default ValidationUtils;
//# sourceMappingURL=validation.d.ts.map