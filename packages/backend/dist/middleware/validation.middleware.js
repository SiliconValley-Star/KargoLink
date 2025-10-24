"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileType = exports.sanitizeInput = exports.validateBodySize = exports.validateUUID = exports.validatePassword = exports.validatePhone = exports.validateEmail = exports.customValidation = exports.sanitizeBody = exports.validateRequest = exports.ValidationRules = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("./errorHandler");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : error.type,
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));
        res.status(errorHandler_1.HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
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
exports.handleValidationErrors = handleValidationErrors;
exports.ValidationRules = {
    userRegistration: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        (0, express_validator_1.body)('password')
            .isLength({ min: 8, max: 128 })
            .withMessage('Password must be 8-128 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one lowercase, uppercase letter and number'),
        (0, express_validator_1.body)('firstName')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('First name must be 2-50 characters long')
            .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
            .withMessage('First name can only contain letters'),
        (0, express_validator_1.body)('lastName')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Last name must be 2-50 characters long')
            .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
            .withMessage('Last name can only contain letters'),
        (0, express_validator_1.body)('phone')
            .isMobilePhone('tr-TR')
            .withMessage('Valid Turkish phone number is required'),
        (0, express_validator_1.body)('role')
            .optional()
            .isIn(['customer', 'carrier', 'admin'])
            .withMessage('Invalid role'),
        (0, express_validator_1.body)('accountType')
            .optional()
            .isIn(['individual', 'business'])
            .withMessage('Account type must be individual or business'),
        (0, express_validator_1.body)('termsAccepted')
            .isBoolean()
            .custom((value) => {
            if (!value) {
                throw new Error('Terms and conditions must be accepted');
            }
            return true;
        })
    ],
    userLogin: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        (0, express_validator_1.body)('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    userProfileUpdate: [
        (0, express_validator_1.body)('firstName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('First name must be 2-50 characters long'),
        (0, express_validator_1.body)('lastName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Last name must be 2-50 characters long'),
        (0, express_validator_1.body)('phone')
            .optional()
            .isMobilePhone('tr-TR')
            .withMessage('Valid Turkish phone number is required'),
        (0, express_validator_1.body)('dateOfBirth')
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
    addressCreate: [
        (0, express_validator_1.body)('title')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Address title is required and must be max 100 characters'),
        (0, express_validator_1.body)('type')
            .isIn(['home', 'work', 'other'])
            .withMessage('Address type must be home, work, or other'),
        (0, express_validator_1.body)('country')
            .optional()
            .isISO31661Alpha2()
            .withMessage('Country must be a valid ISO code'),
        (0, express_validator_1.body)('city')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('City is required and must be 2-100 characters'),
        (0, express_validator_1.body)('district')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('District is required and must be 2-100 characters'),
        (0, express_validator_1.body)('neighborhood')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Neighborhood must be max 100 characters'),
        (0, express_validator_1.body)('streetAddress')
            .trim()
            .isLength({ min: 10, max: 500 })
            .withMessage('Street address is required and must be 10-500 characters'),
        (0, express_validator_1.body)('postalCode')
            .optional()
            .matches(/^\d{5}$/)
            .withMessage('Postal code must be 5 digits'),
        (0, express_validator_1.body)('latitude')
            .optional()
            .isFloat({ min: -90, max: 90 })
            .withMessage('Latitude must be between -90 and 90'),
        (0, express_validator_1.body)('longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
            .withMessage('Longitude must be between -180 and 180')
    ],
    shipmentCreate: [
        (0, express_validator_1.body)('pickupAddress')
            .notEmpty()
            .withMessage('Pickup address is required'),
        (0, express_validator_1.body)('deliveryAddress')
            .notEmpty()
            .withMessage('Delivery address is required'),
        (0, express_validator_1.body)('packages')
            .isArray({ min: 1 })
            .withMessage('At least one package is required'),
        (0, express_validator_1.body)('packages.*.weight')
            .isFloat({ min: 0.01, max: 1000 })
            .withMessage('Package weight must be between 0.01 and 1000 kg'),
        (0, express_validator_1.body)('packages.*.dimensions')
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
        (0, express_validator_1.body)('packages.*.description')
            .trim()
            .isLength({ min: 3, max: 500 })
            .withMessage('Package description must be 3-500 characters'),
        (0, express_validator_1.body)('category')
            .isIn(['documents', 'electronics', 'clothing', 'food', 'furniture', 'automotive', 'other'])
            .withMessage('Invalid package category'),
        (0, express_validator_1.body)('serviceType')
            .isIn(['standard', 'express', 'same_day', 'economy'])
            .withMessage('Invalid service type'),
        (0, express_validator_1.body)('totalValue')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Total value must be a positive number'),
        (0, express_validator_1.body)('specialServices')
            .optional()
            .isObject()
            .withMessage('Special services must be an object'),
        (0, express_validator_1.body)('requiresCustoms')
            .optional()
            .isBoolean()
            .withMessage('Requires customs must be a boolean')
    ],
    paymentInitialize: [
        (0, express_validator_1.body)('amount')
            .isFloat({ min: 1, max: 1000000 })
            .withMessage('Amount must be between 1 and 1,000,000'),
        (0, express_validator_1.body)('currency')
            .isIn(['TRY', 'USD', 'EUR', 'GBP'])
            .withMessage('Currency must be TRY, USD, EUR, or GBP'),
        (0, express_validator_1.body)('shipmentId')
            .optional()
            .isUUID()
            .withMessage('Shipment ID must be a valid UUID'),
        (0, express_validator_1.body)('paymentMethod')
            .optional()
            .isIn(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cash_on_delivery'])
            .withMessage('Invalid payment method'),
        (0, express_validator_1.body)('installmentCount')
            .optional()
            .isInt({ min: 1, max: 12 })
            .withMessage('Installment count must be between 1 and 12')
    ],
    fileUpload: [
        (0, express_validator_1.body)('purpose')
            .isIn(['profile', 'document', 'proof', 'invoice', 'identity'])
            .withMessage('Invalid file purpose'),
        (0, express_validator_1.body)('description')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('Description must be max 255 characters')
    ],
    pagination: [
        (0, express_validator_1.query)('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        (0, express_validator_1.query)('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        (0, express_validator_1.query)('sort')
            .optional()
            .matches(/^[a-zA-Z_]+$/)
            .withMessage('Sort field can only contain letters and underscores'),
        (0, express_validator_1.query)('order')
            .optional()
            .isIn(['asc', 'desc'])
            .withMessage('Order must be asc or desc')
    ],
    uuidParam: [
        (0, express_validator_1.param)('id')
            .isUUID()
            .withMessage('ID must be a valid UUID')
    ],
    trackingParam: [
        (0, express_validator_1.param)('trackingNumber')
            .matches(/^[A-Z0-9]{8,20}$/)
            .withMessage('Invalid tracking number format')
    ],
    dateRange: [
        (0, express_validator_1.query)('startDate')
            .optional()
            .isISO8601()
            .withMessage('Start date must be a valid ISO date'),
        (0, express_validator_1.query)('endDate')
            .optional()
            .isISO8601()
            .custom((endDate, { req }) => {
            if (req.query && req.query.startDate && endDate) {
                const start = new Date(req.query.startDate);
                const end = new Date(endDate);
                if (end <= start) {
                    throw new Error('End date must be after start date');
                }
            }
            return true;
        })
    ]
};
const validateRequest = (rules) => {
    return [...rules, exports.handleValidationErrors];
};
exports.validateRequest = validateRequest;
const sanitizeBody = (allowedFields) => {
    return (req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            const sanitized = {};
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
exports.sanitizeBody = sanitizeBody;
const customValidation = (validator) => {
    return (value, { req }) => {
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
exports.customValidation = customValidation;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePhone = (phone) => {
    const phoneRegex = /^(\+90|0)?[5-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};
exports.validatePhone = validatePhone;
const validatePassword = (password) => {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password);
};
exports.validatePassword = validatePassword;
const validateUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
exports.validateUUID = validateUUID;
const validateBodySize = (maxSize = 50 * 1024 * 1024) => {
    return (req, res, next) => {
        const contentLength = parseInt(req.get('content-length') || '0', 10);
        if (contentLength > maxSize) {
            throw new errorHandler_1.AppError(`Request body size ${(contentLength / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size ${(maxSize / 1024 / 1024).toFixed(2)}MB`, errorHandler_1.HTTP_STATUS.REQUEST_ENTITY_TOO_LARGE);
        }
        next();
    };
};
exports.validateBodySize = validateBodySize;
const sanitizeInput = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
};
exports.sanitizeInput = sanitizeInput;
const validateFileType = (allowedTypes, allowedSize = 10 * 1024 * 1024) => {
    return (req, res, next) => {
        if (!req.file && !req.files) {
            return next();
        }
        const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
        for (const file of files) {
            if (!file)
                continue;
            if (!allowedTypes.includes(file.mimetype)) {
                throw new errorHandler_1.AppError(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`, errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (file.size > allowedSize) {
                throw new errorHandler_1.AppError(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size ${(allowedSize / 1024 / 1024).toFixed(2)}MB`, errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
        }
        next();
    };
};
exports.validateFileType = validateFileType;
exports.default = {
    ValidationRules: exports.ValidationRules,
    validateRequest: exports.validateRequest,
    handleValidationErrors: exports.handleValidationErrors,
    sanitizeBody: exports.sanitizeBody,
    customValidation: exports.customValidation,
    validateFileType: exports.validateFileType
};
//# sourceMappingURL=validation.middleware.js.map