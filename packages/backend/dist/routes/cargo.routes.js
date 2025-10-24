"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cargoRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const cargo_controller_1 = require("../controllers/cargo.controller");
const router = (0, express_1.Router)();
exports.cargoRoutes = router;
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: errors.array()
            }
        });
        return;
    }
    next();
};
const quoteRequestValidation = [
    (0, express_validator_1.body)('fromAddress.fullName')
        .notEmpty()
        .withMessage('Sender full name is required')
        .isLength({ max: 255 })
        .withMessage('Sender name must be less than 255 characters'),
    (0, express_validator_1.body)('fromAddress.phone')
        .notEmpty()
        .withMessage('Sender phone is required')
        .isMobilePhone('tr-TR')
        .withMessage('Invalid Turkish phone number'),
    (0, express_validator_1.body)('fromAddress.city')
        .notEmpty()
        .withMessage('Sender city is required'),
    (0, express_validator_1.body)('fromAddress.district')
        .notEmpty()
        .withMessage('Sender district is required'),
    (0, express_validator_1.body)('fromAddress.address')
        .notEmpty()
        .withMessage('Sender address is required')
        .isLength({ max: 500 })
        .withMessage('Address must be less than 500 characters'),
    (0, express_validator_1.body)('fromAddress.postalCode')
        .optional()
        .matches(/^\d{5}$/)
        .withMessage('Postal code must be 5 digits'),
    (0, express_validator_1.body)('toAddress.fullName')
        .notEmpty()
        .withMessage('Receiver full name is required')
        .isLength({ max: 255 })
        .withMessage('Receiver name must be less than 255 characters'),
    (0, express_validator_1.body)('toAddress.phone')
        .notEmpty()
        .withMessage('Receiver phone is required')
        .isMobilePhone('tr-TR')
        .withMessage('Invalid Turkish phone number'),
    (0, express_validator_1.body)('toAddress.city')
        .notEmpty()
        .withMessage('Receiver city is required'),
    (0, express_validator_1.body)('toAddress.district')
        .notEmpty()
        .withMessage('Receiver district is required'),
    (0, express_validator_1.body)('toAddress.address')
        .notEmpty()
        .withMessage('Receiver address is required')
        .isLength({ max: 500 })
        .withMessage('Address must be less than 500 characters'),
    (0, express_validator_1.body)('toAddress.postalCode')
        .optional()
        .matches(/^\d{5}$/)
        .withMessage('Postal code must be 5 digits'),
    (0, express_validator_1.body)('packages')
        .isArray({ min: 1 })
        .withMessage('At least one package is required'),
    (0, express_validator_1.body)('packages.*.weight')
        .isFloat({ min: 0.1, max: 1000 })
        .withMessage('Package weight must be between 0.1 and 1000 kg'),
    (0, express_validator_1.body)('packages.*.width')
        .isFloat({ min: 1, max: 200 })
        .withMessage('Package width must be between 1 and 200 cm'),
    (0, express_validator_1.body)('packages.*.height')
        .isFloat({ min: 1, max: 200 })
        .withMessage('Package height must be between 1 and 200 cm'),
    (0, express_validator_1.body)('packages.*.length')
        .isFloat({ min: 1, max: 200 })
        .withMessage('Package length must be between 1 and 200 cm'),
    (0, express_validator_1.body)('packages.*.value')
        .isFloat({ min: 0 })
        .withMessage('Package value must be a positive number'),
    (0, express_validator_1.body)('packages.*.description')
        .notEmpty()
        .withMessage('Package description is required')
        .isLength({ max: 255 })
        .withMessage('Package description must be less than 255 characters'),
    (0, express_validator_1.body)('packages.*.quantity')
        .isInt({ min: 1, max: 100 })
        .withMessage('Package quantity must be between 1 and 100'),
    (0, express_validator_1.body)('serviceType')
        .optional()
        .isIn(['standard', 'express', 'overnight', 'economy', 'premium'])
        .withMessage('Invalid service type'),
    (0, express_validator_1.body)('pickupDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid pickup date format'),
    (0, express_validator_1.body)('deliveryDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid delivery date format'),
    (0, express_validator_1.body)('insuranceValue')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Insurance value must be a positive number'),
    (0, express_validator_1.body)('codAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('COD amount must be a positive number'),
    validateRequest
];
const shipmentCreateValidation = [
    ...quoteRequestValidation.slice(0, -1),
    (0, express_validator_1.body)('selectedQuoteId')
        .notEmpty()
        .withMessage('Selected quote ID is required'),
    (0, express_validator_1.body)('serviceType')
        .notEmpty()
        .withMessage('Service type is required')
        .isIn(['standard', 'express', 'overnight', 'economy', 'premium'])
        .withMessage('Invalid service type'),
    (0, express_validator_1.body)('specialInstructions')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Special instructions must be less than 1000 characters'),
    (0, express_validator_1.body)('references')
        .optional()
        .isArray()
        .withMessage('References must be an array'),
    (0, express_validator_1.body)('references.*.type')
        .optional()
        .isIn(['invoice', 'po', 'customer', 'internal'])
        .withMessage('Invalid reference type'),
    (0, express_validator_1.body)('references.*.value')
        .optional()
        .notEmpty()
        .withMessage('Reference value is required'),
    (0, express_validator_1.body)('notifications.email')
        .optional()
        .isEmail()
        .withMessage('Invalid email format'),
    (0, express_validator_1.body)('notifications.sms')
        .optional()
        .isMobilePhone('tr-TR')
        .withMessage('Invalid Turkish phone number'),
    validateRequest
];
const providerValidation = [
    (0, express_validator_1.param)('provider')
        .notEmpty()
        .withMessage('Provider is required')
        .isIn(['yurtici', 'aras', 'mng', 'ptt', 'ups', 'dhl', 'fedex', 'tnt', 'ceva', 'tnt_express', 'sf_express', 'db_schenker', 'maersk', 'japan_post', 'royal_mail', 'hermes', 'dpkg', 'chronopost', 'correos', 'surat'])
        .withMessage('Invalid cargo service provider'),
    validateRequest
];
const trackingValidation = [
    ...providerValidation,
    (0, express_validator_1.param)('trackingNumber')
        .notEmpty()
        .withMessage('Tracking number is required')
        .isLength({ min: 5, max: 50 })
        .withMessage('Tracking number must be between 5 and 50 characters'),
    validateRequest
];
router.get('/providers', cargo_controller_1.CargoController.getProviders);
router.get('/providers/:provider', providerValidation, cargo_controller_1.CargoController.getProviderCapabilities);
router.get('/track/:provider/:trackingNumber', trackingValidation, cargo_controller_1.CargoController.trackShipment);
router.use(auth_middleware_1.authenticate);
router.post('/quotes', quoteRequestValidation, cargo_controller_1.CargoController.getQuotes);
router.post('/quotes/best', [
    ...quoteRequestValidation.slice(0, -1),
    (0, express_validator_1.query)('maxResults')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Max results must be between 1 and 20'),
    validateRequest
], cargo_controller_1.CargoController.getBestQuotes);
router.post('/shipment/:provider', [...providerValidation.slice(0, -1), ...shipmentCreateValidation.slice(-1)], cargo_controller_1.CargoController.createShipment);
router.delete('/shipment/:provider/:trackingNumber', trackingValidation, cargo_controller_1.CargoController.cancelShipment);
router.use((0, auth_middleware_1.authorize)(['admin']));
router.get('/health', cargo_controller_1.CargoController.healthCheck);
//# sourceMappingURL=cargo.routes.js.map