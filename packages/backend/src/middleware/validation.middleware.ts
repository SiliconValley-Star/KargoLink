import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { AppError, HTTP_STATUS } from './errorHandler';

/**
 * Handle validation results
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : error.type,
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined
    }));

    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errorMessages
      },
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  next();
};

/**
 * Common validation rules
 */
export const ValidationRules = {
  // User validation
  userRegistration: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be 8-128 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase, uppercase letter and number'),
    
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be 2-50 characters long')
      .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
      .withMessage('First name can only contain letters'),
    
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be 2-50 characters long')
      .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
      .withMessage('Last name can only contain letters'),
    
    body('phone')
      .isMobilePhone('tr-TR')
      .withMessage('Valid Turkish phone number is required'),
    
    body('role')
      .optional()
      .isIn(['customer', 'carrier', 'admin'])
      .withMessage('Invalid role'),
    
    body('accountType')
      .optional()
      .isIn(['individual', 'business'])
      .withMessage('Account type must be individual or business'),
    
    body('termsAccepted')
      .isBoolean()
      .custom((value) => {
        if (!value) {
          throw new Error('Terms and conditions must be accepted');
        }
        return true;
      })
  ],

  userLogin: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  userProfileUpdate: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be 2-50 characters long'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be 2-50 characters long'),
    
    body('phone')
      .optional()
      .isMobilePhone('tr-TR')
      .withMessage('Valid Turkish phone number is required'),
    
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18 || age > 120) {
          throw new Error('Age must be between 18 and 120 years');
        }
        return true;
      })
  ],

  // Address validation
  addressCreate: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Address title is required and must be max 100 characters'),
    
    body('type')
      .isIn(['home', 'work', 'other'])
      .withMessage('Address type must be home, work, or other'),
    
    body('country')
      .optional()
      .isISO31661Alpha2()
      .withMessage('Country must be a valid ISO code'),
    
    body('city')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('City is required and must be 2-100 characters'),
    
    body('district')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('District is required and must be 2-100 characters'),
    
    body('neighborhood')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Neighborhood must be max 100 characters'),
    
    body('streetAddress')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Street address is required and must be 10-500 characters'),
    
    body('postalCode')
      .optional()
      .matches(/^\d{5}$/)
      .withMessage('Postal code must be 5 digits'),
    
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180')
  ],

  // Shipment validation
  shipmentCreate: [
    body('pickupAddress')
      .notEmpty()
      .withMessage('Pickup address is required'),
    
    body('deliveryAddress')
      .notEmpty()
      .withMessage('Delivery address is required'),
    
    body('packages')
      .isArray({ min: 1 })
      .withMessage('At least one package is required'),
    
    body('packages.*.weight')
      .isFloat({ min: 0.01, max: 1000 })
      .withMessage('Package weight must be between 0.01 and 1000 kg'),
    
    body('packages.*.dimensions')
      .optional()
      .custom((value) => {
        if (value && (!value.length || !value.width || !value.height)) {
          throw new Error('All dimensions (length, width, height) are required');
        }
        if (value && (value.length > 300 || value.width > 300 || value.height > 300)) {
          throw new Error('Dimensions cannot exceed 300 cm');
        }
        return true;
      }),
    
    body('packages.*.description')
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('Package description must be 3-500 characters'),
    
    body('category')
      .isIn(['documents', 'electronics', 'clothing', 'food', 'furniture', 'automotive', 'other'])
      .withMessage('Invalid package category'),
    
    body('serviceType')
      .isIn(['standard', 'express', 'same_day', 'economy'])
      .withMessage('Invalid service type'),
    
    body('totalValue')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total value must be a positive number'),
    
    body('specialServices')
      .optional()
      .isObject()
      .withMessage('Special services must be an object'),
    
    body('requiresCustoms')
      .optional()
      .isBoolean()
      .withMessage('Requires customs must be a boolean')
  ],

  // Payment validation
  paymentInitialize: [
    body('amount')
      .isFloat({ min: 1, max: 1000000 })
      .withMessage('Amount must be between 1 and 1,000,000'),
    
    body('currency')
      .isIn(['TRY', 'USD', 'EUR', 'GBP'])
      .withMessage('Currency must be TRY, USD, EUR, or GBP'),
    
    body('shipmentId')
      .optional()
      .isUUID()
      .withMessage('Shipment ID must be a valid UUID'),
    
    body('paymentMethod')
      .optional()
      .isIn(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cash_on_delivery'])
      .withMessage('Invalid payment method'),
    
    body('installmentCount')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Installment count must be between 1 and 12')
  ],

  // File upload validation
  fileUpload: [
    body('purpose')
      .isIn(['profile', 'document', 'proof', 'invoice', 'identity'])
      .withMessage('Invalid file purpose'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Description must be max 255 characters')
  ],

  // Query parameter validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('sort')
      .optional()
      .matches(/^[a-zA-Z_]+$/)
      .withMessage('Sort field can only contain letters and underscores'),
    
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc')
  ],

  // ID parameter validation
  uuidParam: [
    param('id')
      .isUUID()
      .withMessage('ID must be a valid UUID')
  ],

  trackingParam: [
    param('trackingNumber')
      .matches(/^[A-Z0-9]{8,20}$/)
      .withMessage('Invalid tracking number format')
  ],

  // Date range validation
  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO date'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .custom((endDate, { req }) => {
        if (req.query && req.query.startDate && endDate) {
          const start = new Date(req.query.startDate as string);
          const end = new Date(endDate);
          if (end <= start) {
            throw new Error('End date must be after start date');
          }
        }
        return true;
      })
  ]
};

/**
 * Composite validation middleware
 */
export const validateRequest = (rules: ValidationChain[]) => {
  return [...rules, handleValidationErrors];
};

/**
 * Sanitize request body
 */
export const sanitizeBody = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      const sanitized: any = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          sanitized[field] = req.body[field];
        }
      });
      
      req.body = sanitized;
    }
    
    next();
  };
};

/**
 * Custom validation helper
 */
export const customValidation = (validator: (value: any, req: Request) => boolean | string) => {
  return (value: any, { req }: { req: Request }) => {
    const result = validator(value, req);
    if (typeof result === 'string') {
      throw new Error(result);
    }
    if (!result) {
      throw new Error('Validation failed');
    }
    return true;
  };
};

/**
 * Individual validation functions
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Turkish phone number format
  const phoneRegex = /^(\+90|0)?[5-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /\d/.test(password);
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateBodySize = (maxSize: number = 50 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    
    if (contentLength > maxSize) {
      throw new AppError(
        `Request body size ${(contentLength / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
        HTTP_STATUS.REQUEST_ENTITY_TOO_LARGE
      );
    }
    
    next();
  };
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * File validation helper
 */
export const validateFileType = (allowedTypes: string[], allowedSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
    
    for (const file of files) {
      if (!file) continue;
      
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        throw new AppError(
          `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      
      // Check file size
      if (file.size > allowedSize) {
        throw new AppError(
          `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size ${(allowedSize / 1024 / 1024).toFixed(2)}MB`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
    
    next();
  };
};

export default {
  ValidationRules,
  validateRequest,
  handleValidationErrors,
  sanitizeBody,
  customValidation,
  validateFileType
};