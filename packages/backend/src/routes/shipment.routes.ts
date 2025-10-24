import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { authenticate as authenticateToken, authorize as requireRole } from '../middleware/auth.middleware';
import { ShipmentController } from '../controllers/shipment.controller';

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

const router: Router = Router();
// ShipmentController is static, no need to instantiate

// Create shipment validation
const createShipmentValidation = [
  body('pickupAddress')
    .notEmpty()
    .withMessage('Pickup address is required'),
  body('pickupAddress.firstName')
    .notEmpty()
    .withMessage('Pickup address first name is required'),
  body('pickupAddress.lastName')
    .notEmpty()
    .withMessage('Pickup address last name is required'),
  body('pickupAddress.addressLine1')
    .notEmpty()
    .withMessage('Pickup address line 1 is required'),
  body('pickupAddress.city')
    .notEmpty()
    .withMessage('Pickup address city is required'),
  body('pickupAddress.postalCode')
    .notEmpty()
    .withMessage('Pickup address postal code is required'),
  body('deliveryAddress')
    .notEmpty()
    .withMessage('Delivery address is required'),
  body('deliveryAddress.firstName')
    .notEmpty()
    .withMessage('Delivery address first name is required'),
  body('deliveryAddress.lastName')
    .notEmpty()
    .withMessage('Delivery address last name is required'),
  body('deliveryAddress.addressLine1')
    .notEmpty()
    .withMessage('Delivery address line 1 is required'),
  body('deliveryAddress.city')
    .notEmpty()
    .withMessage('Delivery address city is required'),
  body('deliveryAddress.postalCode')
    .notEmpty()
    .withMessage('Delivery address postal code is required'),
  body('packages')
    .isArray({ min: 1 })
    .withMessage('Packages must be a non-empty array'),
  body('packages.*.description')
    .notEmpty()
    .withMessage('Package description is required')
    .isLength({ max: 500 })
    .withMessage('Package description must be less than 500 characters'),
  body('packages.*.weight')
    .isFloat({ min: 0.1 })
    .withMessage('Package weight must be greater than 0.1 kg'),
  body('packages.*.dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a positive number'),
  body('packages.*.dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a positive number'),
  body('packages.*.dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
  body('category')
    .isIn(['GENERAL', 'ELECTRONICS', 'CLOTHING', 'FOOD', 'DOCUMENTS', 'FRAGILE', 'OTHER'])
    .withMessage('Invalid category'),
  body('serviceType')
    .isIn(['STANDARD', 'EXPRESS', 'SAME_DAY', 'ECONOMY'])
    .withMessage('Invalid service type'),
  body('totalValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total value must be a positive number'),
  body('instructions')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Instructions must be less than 1000 characters'),
  validateRequest
];

// Update shipment validation
const updateShipmentValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid shipment ID'),
  body('receiverAddressId')
    .optional()
    .isUUID()
    .withMessage('Invalid receiver address ID'),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('specialRequirements')
    .optional()
    .isArray()
    .withMessage('Special requirements must be an array'),
  body('preferredDeliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid preferred delivery date'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  validateRequest
];

// Update status validation
const updateStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid shipment ID'),
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'])
    .withMessage('Invalid status'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  validateRequest
];

// Cancel shipment validation
const cancelShipmentValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid shipment ID'),
  body('reason')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Cancellation reason must be less than 1000 characters'),
  validateRequest
];

// Query validation for list shipments
const listShipmentsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'])
    .withMessage('Invalid status'),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID'),
  query('cargoCompanyId')
    .optional()
    .isUUID()
    .withMessage('Invalid cargo company ID'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'estimatedDelivery', 'totalAmount'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  validateRequest
];

// **PUBLIC ROUTES** (no authentication required)

// **AUTHENTICATED ROUTES**
// Apply authentication middleware to all routes below
router.use(authenticateToken);

// **USER ROUTES**
// Create new shipment
router.post(
  '/',
  createShipmentValidation,
  (req: Request, res: Response) => ShipmentController.createShipment(req, res)
);

// Get user's shipments
router.get(
  '/',
  listShipmentsValidation,
  (req: Request, res: Response) => ShipmentController.getUserShipments(req, res)
);

// Get specific shipment
router.get(
  '/:id',
  [
    param('id').custom((value) => {
      // Accept either CUID (for ID) or tracking number format
      const cuidRegex = /^c[a-z0-9]{24}$/;
      const trackingRegex = /^CL[A-Z0-9]{10,20}$/;
      if (!cuidRegex.test(value) && !trackingRegex.test(value)) {
        throw new Error('Invalid shipment ID or tracking number');
      }
      return true;
    }),
    validateRequest
  ],
  (req: Request, res: Response) => ShipmentController.getShipment(req, res)
);

// Update shipment (only for pending shipments)
router.put(
  '/:id',
  updateShipmentValidation,
  (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Update shipment functionality not yet implemented'
      }
    });
  }
);

// Cancel shipment
router.post(
  '/:id/cancel',
  cancelShipmentValidation,
  (req: Request, res: Response) => ShipmentController.cancelShipment(req, res)
);

// Get shipment tracking
router.get(
  '/:id/tracking',
  [
    param('id').custom((value) => {
      // Accept either CUID (for ID) or tracking number format
      const cuidRegex = /^c[a-z0-9]{24}$/;
      const trackingRegex = /^CL[A-Z0-9]{10,20}$/;
      if (!cuidRegex.test(value) && !trackingRegex.test(value)) {
        throw new Error('Invalid shipment ID or tracking number');
      }
      return true;
    }),
    validateRequest
  ],
  (req: Request, res: Response) => {
    // Tracking is included in getShipment, redirect there
    ShipmentController.getShipment(req, res);
  }
);

// **ADMIN ROUTES**
// Apply admin role requirement to all routes below
router.use(requireRole(['admin']));

// Get all shipments (admin only)
router.get(
  '/admin/all',
  listShipmentsValidation,
  (req: Request, res: Response) => {
    // For admin, use getUserShipments without user filtering
    req.query.adminAll = 'true';
    ShipmentController.getUserShipments(req, res);
  }
);

// Update shipment status (admin/cargo company only)
router.patch(
  '/:id/status',
  updateStatusValidation,
  (req: Request, res: Response) => ShipmentController.updateShipmentStatus(req, res)
);

// Get shipment statistics (admin only)
router.get(
  '/admin/statistics',
  [
    query('period')
      .optional()
      .isIn(['day', 'week', 'month', 'year'])
      .withMessage('Invalid period'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date'),
    validateRequest
  ],
  (req: Request, res: Response) => ShipmentController.getShipmentStats(req, res)
);

export { router as shipmentRoutes };