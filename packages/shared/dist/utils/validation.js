"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = exports.moneySchema = exports.dimensionsSchema = exports.coordinatesSchema = exports.postalCodeSchema = exports.ibanSchema = exports.taxNumberSchema = exports.nameSchema = exports.passwordSchema = exports.phoneSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z
    .string()
    .email('Geçerli bir e-posta adresi girin')
    .toLowerCase();
exports.phoneSchema = zod_1.z
    .string()
    .regex(/^\+90[0-9]{10}$/, 'Geçerli bir telefon numarası girin (+905XXXXXXXXX)');
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermeli');
exports.nameSchema = zod_1.z
    .string()
    .min(2, 'İsim en az 2 karakter olmalı')
    .max(50, 'İsim en fazla 50 karakter olmalı')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'İsim sadece harf içerebilir');
exports.taxNumberSchema = zod_1.z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Vergi numarası 10-11 haneli olmalı');
exports.ibanSchema = zod_1.z
    .string()
    .regex(/^TR[0-9]{24}$/, 'Geçerli bir IBAN girin (TR ile başlayan 26 karakter)');
exports.postalCodeSchema = zod_1.z
    .string()
    .regex(/^[0-9]{5}$/, 'Posta kodu 5 haneli olmalı');
exports.coordinatesSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
});
exports.dimensionsSchema = zod_1.z.object({
    length: zod_1.z.number().positive('Uzunluk pozitif olmalı'),
    width: zod_1.z.number().positive('Genişlik pozitif olmalı'),
    height: zod_1.z.number().positive('Yükseklik pozitif olmalı'),
    weight: zod_1.z.number().positive('Ağırlık pozitif olmalı'),
});
exports.moneySchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Tutar pozitif olmalı'),
    currency: zod_1.z.enum(['TRY', 'USD', 'EUR']),
});
exports.ValidationUtils = {
    isValidEmail: (email) => {
        try {
            exports.emailSchema.parse(email);
            return true;
        }
        catch {
            return false;
        }
    },
    isValidPhone: (phone) => {
        try {
            exports.phoneSchema.parse(phone);
            return true;
        }
        catch {
            return false;
        }
    },
    isValidPassword: (password) => {
        try {
            exports.passwordSchema.parse(password);
            return true;
        }
        catch {
            return false;
        }
    },
    isValidTaxNumber: (taxNumber) => {
        if (!/^[0-9]{10}$/.test(taxNumber)) {
            return false;
        }
        const digits = taxNumber.split('').map(Number);
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            const digit = digits[i];
            if (digit === undefined)
                return false;
            sum += digit * (10 - i);
        }
        const checkDigit = (11 - (sum % 11)) % 11;
        const lastDigit = digits[9];
        return lastDigit !== undefined && checkDigit === lastDigit;
    },
    isValidTCIdentity: (identity) => {
        if (!/^[0-9]{11}$/.test(identity)) {
            return false;
        }
        const digits = identity.split('').map(Number);
        if (digits.length !== 11 || digits.some(d => d === undefined || isNaN(d))) {
            return false;
        }
        if (digits[0] === 0) {
            return false;
        }
        const oddSum = (digits[0] ?? 0) + (digits[2] ?? 0) + (digits[4] ?? 0) + (digits[6] ?? 0) + (digits[8] ?? 0);
        const evenSum = (digits[1] ?? 0) + (digits[3] ?? 0) + (digits[5] ?? 0) + (digits[7] ?? 0);
        const tenthDigit = ((oddSum * 7) - evenSum) % 10;
        if (tenthDigit !== (digits[9] ?? -1)) {
            return false;
        }
        const eleventhDigit = (digits.slice(0, 10).reduce((sum, digit) => sum + (digit ?? 0), 0)) % 10;
        return eleventhDigit === (digits[10] ?? -1);
    },
    isValidIBAN: (iban) => {
        const cleanIban = iban.replace(/\s/g, '').toUpperCase();
        if (!/^TR[0-9]{24}$/.test(cleanIban)) {
            return false;
        }
        const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
        const numeric = rearranged.replace(/[A-Z]/g, (letter) => (letter.charCodeAt(0) - 55).toString());
        let remainder = '';
        for (const digit of numeric) {
            remainder = ((remainder + digit).replace(/^0+/, '') || '0');
            if (remainder.length >= 7) {
                remainder = (parseInt(remainder) % 97).toString();
            }
        }
        return parseInt(remainder) % 97 === 1;
    },
    sanitizeString: (input) => {
        return input
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[<>]/g, '');
    },
    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('90')) {
            return '+' + cleaned;
        }
        else if (cleaned.startsWith('0')) {
            return '+90' + cleaned.slice(1);
        }
        else {
            return '+90' + cleaned;
        }
    },
    formatMoney: (amount, currency = 'TRY') => {
        const formatter = new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
        });
        return formatter.format(amount);
    },
    isInTurkey: (latitude, longitude) => {
        return (latitude >= 36 && latitude <= 42 &&
            longitude >= 26 && longitude <= 45);
    },
    parseCoordinates: (lat, lng) => {
        const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
        const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;
        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error('Geçersiz koordinat formatı');
        }
        if (latitude < -90 || latitude > 90) {
            throw new Error('Enlem -90 ile 90 arasında olmalı');
        }
        if (longitude < -180 || longitude > 180) {
            throw new Error('Boylam -180 ile 180 arasında olmalı');
        }
        return { latitude, longitude };
    },
    isValidFileType: (fileName, allowedTypes) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        return extension ? allowedTypes.includes(extension) : false;
    },
    getPasswordStrength: (password) => {
        let score = 0;
        if (password.length >= 8)
            score++;
        if (password.length >= 12)
            score++;
        if (/[a-z]/.test(password))
            score++;
        if (/[A-Z]/.test(password))
            score++;
        if (/[0-9]/.test(password))
            score++;
        if (/[^a-zA-Z0-9]/.test(password))
            score++;
        if (score <= 2)
            return 'weak';
        if (score <= 4)
            return 'medium';
        return 'strong';
    }
};
exports.default = exports.ValidationUtils;
//# sourceMappingURL=validation.js.map