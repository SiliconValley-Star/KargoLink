import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { authenticate as authenticateToken, authorize as requireRole } from '../middleware/auth.middleware';
import { CargoController } from '../controllers/cargo.controller';

const router: Router = Router();

// Custom validation middleware for express-validator
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
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

// Quote request validation
const quoteRequestValidation = [
  body('fromAddress.fullName')
    .notEmpty()
    .withMessage('Sender full name is required')
    .isLength({ max: 255 })
    .withMessage('Sender name must be less than 255 characters'),
  body('fromAddress.phone')
    .notEmpty()
    .withMessage('Sender phone is required')
    .isMobilePhone('tr-TR')
    .withMessage('Invalid Turkish phone number'),
  body('fromAddress.city')
    .notEmpty()
    .withMessage('Sender city is required'),
  body('fromAddress.district')
    .notEmpty()
    .withMessage('Sender district is required'),
  body('fromAddress.address')
    .notEmpty()
    .withMessage('Sender address is required')
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters'),
  body('fromAddress.postalCode')
    .optional()
    .matches(/^\d{5}$/)
    .withMessage('Postal code must be 5 digits'),

  body('toAddress.fullName')
    .notEmpty()
    .withMessage('Receiver full name is required')
    .isLength({ max: 255 })
    .withMessage('Receiver name must be less than 255 characters'),
  body('toAddress.phone')
    .notEmpty()
    .withMessage('Receiver phone is required')
    .isMobilePhone('tr-TR')
    .withMessage('Invalid Turkish phone number'),
  body('toAddress.city')
    .notEmpty()
    .withMessage('Receiver city is required'),
  body('toAddress.district')
    .notEmpty()
    .withMessage('Receiver district is required'),
  body('toAddress.address')
    .notEmpty()
    .withMessage('Receiver address is required')
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters'),
  body('toAddress.postalCode')
    .optional()
    .matches(/^\d{5}$/)
    .withMessage('Postal code must be 5 digits'),

  body('packages')
    .isArray({ min: 1 })
    .withMessage('At least one package is required'),
  body('packages.*.weight')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Package weight must be between 0.1 and 1000 kg'),
  body('packages.*.width')
    .isFloat({ min: 1, max: 200 })
    .withMessage('Package width must be between 1 and 200 cm'),
  body('packages.*.height')
    .isFloat({ min: 1, max: 200 })
    .withMessage('Package height must be between 1 and 200 cm'),
  body('packages.*.length')
    .isFloat({ min: 1, max: 200 })
    .withMessage('Package length must be between 1 and 200 cm'),
  body('packages.*.value')
    .isFloat({ min: 0 })
    .withMessage('Package value must be a positive number'),
  body('packages.*.description')
    .notEmpty()
    .withMessage('Package description is required')
    .isLength({ max: 255 })
    .withMessage('Package description must be less than 255 characters'),
  body('packages.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Package quantity must be between 1 and 100'),

  body('serviceType')
    .optional()
    .isIn(['standard', 'express', 'overnight', 'economy', 'premium'])
    .withMessage('Invalid service type'),
  body('pickupDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid pickup date format'),
  body('deliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid delivery date format'),
  body('insuranceValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Insurance value must be a positive number'),
  body('codAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('COD amount must be a positive number'),

  validateRequest
];

// Shipment creation validation
const shipmentCreateValidation = [
  ...quoteRequestValidation.slice(0, -1), // Reuse quote validation except validateRequest
  body('selectedQuoteId')
    .notEmpty()
    .withMessage('Selected quote ID is required'),
  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['standard', 'express', 'overnight', 'economy', 'premium'])
    .withMessage('Invalid service type'),
  body('specialInstructions')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Special instructions must be less than 1000 characters'),
  body('references')
    .optional()
    .isArray()
    .withMessage('References must be an array'),
  body('references.*.type')
    .optional()
    .isIn(['invoice', 'po', 'customer', 'internal'])
    .withMessage('Invalid reference type'),
  body('references.*.value')
    .optional()
    .notEmpty()
    .withMessage('Reference value is required'),
  body('notifications.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('notifications.sms')
    .optional()
    .isMobilePhone('tr-TR')
    .withMessage('Invalid Turkish phone number'),

  validateRequest
];

// Provider validation
const providerValidation = [
  param('provider')
    .notEmpty()
    .withMessage('Provider is required')
    .isIn(['yurtici', 'aras', 'mng', 'ptt', 'ups', 'dhl', 'fedex', 'tnt', 'ceva', 'tnt_express', 'sf_express', 'db_schenker', 'maersk', 'japan_post', 'royal_mail', 'hermes', 'dpkg', 'chronopost', 'correos', 'surat'])
    .withMessage('Invalid cargo service provider'),
  validateRequest
];

// Tracking validation
const trackingValidation = [
  ...providerValidation,
  param('trackingNumber')
    .notEmpty()
    .withMessage('Tracking number is required')
    .isLength({ min: 5, max: 50 })
    .withMessage('Tracking number must be between 5 and 50 characters'),
  validateRequest
];

// **PUBLIC ROUTES**

// Get available cargo providers
router.get('/providers', CargoController.getProviders);

// Get provider capabilities
router.get('/providers/:provider', providerValidation, CargoController.getProviderCapabilities);

// Track shipment (public access for tracking)
router.get('/track/:provider/:trackingNumber', trackingValidation, CargoController.trackShipment);

// **AUTHENTICATED ROUTES**
// Apply authentication middleware to all routes below
router.use(authenticateToken);

// Get quotes from all providers
router.post('/quotes', quoteRequestValidation, CargoController.getQuotes);

// Get best quotes sorted by price and delivery time
router.post('/quotes/best', 
  [
    ...quoteRequestValidation.slice(0, -1), // Reuse quote validation except validateRequest
    query('maxResults')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Max results must be between 1 and 20'),
    validateRequest
  ],
  CargoController.getBestQuotes
);

// Create shipment with selected provider
router.post('/shipment/:provider', 
  [...providerValidation.slice(0, -1), ...shipmentCreateValidation.slice(-1)], // Combine validations
  CargoController.createShipment
);

// Cancel shipment
router.delete('/shipment/:provider/:trackingNumber', 
  trackingValidation,
  CargoController.cancelShipment
);

// **ADMIN ROUTES**
// Apply admin role requirement to routes below
router.use(requireRole(['admin']));

// Health check for all cargo services
router.get('/health', CargoController.healthCheck);

export { router as cargoRoutes };