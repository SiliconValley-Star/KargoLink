import { z } from 'zod';

/**
 * Common validation schemas
 */
export const emailSchema = z
  .string()
  .email('Geçerli bir e-posta adresi girin')
  .toLowerCase();

export const phoneSchema = z
  .string()
  .regex(/^\+90[0-9]{10}$/, 'Geçerli bir telefon numarası girin (+905XXXXXXXXX)');

export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalı')
  .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermeli');

export const nameSchema = z
  .string()
  .min(2, 'İsim en az 2 karakter olmalı')
  .max(50, 'İsim en fazla 50 karakter olmalı')
  .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'İsim sadece harf içerebilir');

export const taxNumberSchema = z
  .string()
  .regex(/^[0-9]{10,11}$/, 'Vergi numarası 10-11 haneli olmalı');

export const ibanSchema = z
  .string()
  .regex(/^TR[0-9]{24}$/, 'Geçerli bir IBAN girin (TR ile başlayan 26 karakter)');

export const postalCodeSchema = z
  .string()
  .regex(/^[0-9]{5}$/, 'Posta kodu 5 haneli olmalı');

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const dimensionsSchema = z.object({
  length: z.number().positive('Uzunluk pozitif olmalı'),
  width: z.number().positive('Genişlik pozitif olmalı'),
  height: z.number().positive('Yükseklik pozitif olmalı'),
  weight: z.number().positive('Ağırlık pozitif olmalı'),
});

export const moneySchema = z.object({
  amount: z.number().positive('Tutar pozitif olmalı'),
  currency: z.enum(['TRY', 'USD', 'EUR']),
});

/**
 * Validation utilities
 */
export const ValidationUtils = {
  /**
   * Check if string is valid email
   */
  isValidEmail: (email: string): boolean => {
    try {
      emailSchema.parse(email);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if string is valid phone number
   */
  isValidPhone: (phone: string): boolean => {
    try {
      phoneSchema.parse(phone);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if password meets requirements
   */
  isValidPassword: (password: string): boolean => {
    try {
      passwordSchema.parse(password);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if Turkish tax number is valid
   */
  isValidTaxNumber: (taxNumber: string): boolean => {
    if (!/^[0-9]{10}$/.test(taxNumber)) {
      return false;
    }

    const digits = taxNumber.split('').map(Number);
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      const digit = digits[i];
      if (digit === undefined) return false;
      sum += digit * (10 - i);
    }

    const checkDigit = (11 - (sum % 11)) % 11;
    const lastDigit = digits[9];
    return lastDigit !== undefined && checkDigit === lastDigit;
  },

  /**
   * Check if Turkish identity number is valid
   */
  isValidTCIdentity: (identity: string): boolean => {
    if (!/^[0-9]{11}$/.test(identity)) {
      return false;
    }

    const digits = identity.split('').map(Number);
    
    // Check if all digits are valid numbers
    if (digits.length !== 11 || digits.some(d => d === undefined || isNaN(d))) {
      return false;
    }

    // First digit cannot be 0
    if (digits[0] === 0) {
      return false;
    }

    // Calculate 10th digit
    const oddSum = (digits[0] ?? 0) + (digits[2] ?? 0) + (digits[4] ?? 0) + (digits[6] ?? 0) + (digits[8] ?? 0);
    const evenSum = (digits[1] ?? 0) + (digits[3] ?? 0) + (digits[5] ?? 0) + (digits[7] ?? 0);
    const tenthDigit = ((oddSum * 7) - evenSum) % 10;
    
    if (tenthDigit !== (digits[9] ?? -1)) {
      return false;
    }

    // Calculate 11th digit
    const eleventhDigit = (digits.slice(0, 10).reduce((sum, digit) => sum + (digit ?? 0), 0)) % 10;
    return eleventhDigit === (digits[10] ?? -1);
  },

  /**
   * Check if IBAN is valid
   */
  isValidIBAN: (iban: string): boolean => {
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    
    if (!/^TR[0-9]{24}$/.test(cleanIban)) {
      return false;
    }

    // Move first 4 characters to end and replace letters with numbers
    const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
    const numeric = rearranged.replace(/[A-Z]/g, (letter) => 
      (letter.charCodeAt(0) - 55).toString()
    );

    // Calculate mod 97
    let remainder = '';
    for (const digit of numeric) {
      remainder = ((remainder + digit).replace(/^0+/, '') || '0');
      if (remainder.length >= 7) {
        remainder = (parseInt(remainder) % 97).toString();
      }
    }

    return parseInt(remainder) % 97 === 1;
  },

  /**
   * Sanitize string input
   */
  sanitizeString: (input: string): string => {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[<>]/g, ''); // Remove potential HTML tags
  },

  /**
   * Format phone number
   */
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('90')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      return '+90' + cleaned.slice(1);
    } else {
      return '+90' + cleaned;
    }
  },

  /**
   * Format money amount
   */
  formatMoney: (amount: number, currency: 'TRY' | 'USD' | 'EUR' = 'TRY'): string => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  },

  /**
   * Check if coordinates are in Turkey
   */
  isInTurkey: (latitude: number, longitude: number): boolean => {
    // Rough bounds for Turkey
    return (
      latitude >= 36 && latitude <= 42 &&
      longitude >= 26 && longitude <= 45
    );
  },

  /**
   * Validate and parse coordinates
   */
  parseCoordinates: (lat: string | number, lng: string | number) => {
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

  /**
   * Validate file type
   */
  isValidFileType: (fileName: string, allowedTypes: string[]): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  },

  /**
   * Check password strength
   */
  getPasswordStrength: (password: string): 'weak' | 'medium' | 'strong' => {
    let score = 0;

    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character types
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }
};

export default ValidationUtils;