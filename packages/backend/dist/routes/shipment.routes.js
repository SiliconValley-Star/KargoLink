"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipmentRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const shipment_controller_1 = require("../controllers/shipment.controller");
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
const router = (0, express_1.Router)();
exports.shipmentRoutes = router;
const createShipmentValidation = [
    (0, express_validator_1.body)('senderAddressId')
        .isUUID()
        .withMessage('Invalid sender address ID'),
    (0, express_validator_1.body)('receiverAddressId')
        .isUUID()
        .withMessage('Invalid receiver address ID'),
    (0, express_validator_1.body)('items')
        .isArray({ min: 1 })
        .withMessage('Items must be a non-empty array'),
    (0, express_validator_1.body)('items.*.name')
        .notEmpty()
        .withMessage('Item name is required')
        .isLength({ max: 255 })
        .withMessage('Item name must be less than 255 characters'),
    (0, express_validator_1.body)('items.*.category')
        .isIn(['DOCUMENTS', 'CLOTHING', 'ELECTRONICS', 'FOOD', 'BOOKS', 'FRAGILE', 'LIQUID', 'OTHER'])
        .withMessage('Invalid item category'),
    (0, express_validator_1.body)('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Item quantity must be a positive integer'),
    (0, express_validator_1.body)('items.*.weight')
        .isFloat({ min: 0.1 })
        .withMessage('Item weight must be greater than 0.1'),
    (0, express_validator_1.body)('items.*.value')
        .isFloat({ min: 0 })
        .withMessage('Item value must be a positive number'),
    (0, express_validator_1.body)('items.*.description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Item description must be less than 1000 characters'),
    (0, express_validator_1.body)('items.*.dimensions.length')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Length must be a positive number'),
    (0, express_validator_1.body)('items.*.dimensions.width')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Width must be a positive number'),
    (0, express_validator_1.body)('items.*.dimensions.height')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Height must be a positive number'),
    (0, express_validator_1.body)('specialRequirements')
        .optional()
        .isArray()
        .withMessage('Special requirements must be an array'),
    (0, express_validator_1.body)('specialRequirements.*')
        .optional()
        .isIn(['FRAGILE_HANDLING', 'COLD_CHAIN', 'HAZARDOUS_MATERIAL', 'SIGNATURE_REQUIRED', 'INSURANCE_REQUIRED'])
        .withMessage('Invalid special requirement'),
    (0, express_validator_1.body)('preferredDeliveryDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid preferred delivery date'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must be less than 1000 characters'),
    validateRequest
];
const updateShipmentValidation = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('Invalid shipment ID'),
    (0, express_validator_1.body)('receiverAddressId')
        .optional()
        .isUUID()
        .withMessage('Invalid receiver address ID'),
    (0, express_validator_1.body)('items')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Items must be a non-empty array'),
    (0, express_validator_1.body)('specialRequirements')
        .optional()
        .isArray()
        .withMessage('Special requirements must be an array'),
    (0, express_validator_1.body)('preferredDeliveryDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid preferred delivery date'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must be less than 1000 characters'),
    validateRequest
];
const updateStatusValidation = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('Invalid shipment ID'),
    (0, express_validator_1.body)('status')
        .isIn(['PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    (0, express_validator_1.body)('location')
        .optional()
        .isString()
        .withMessage('Location must be a string'),
    (0, express_validator_1.body)('images')
        .optional()
        .isArray()
        .withMessage('Images must be an array'),
    validateRequest
];
const cancelShipmentValidation = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('Invalid shipment ID'),
    (0, express_validator_1.body)('reason')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Cancellation reason must be less than 1000 characters'),
    validateRequest
];
const listShipmentsValidation = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'])
        .withMessage('Invalid status'),
    (0, express_validator_1.query)('userId')
        .optional()
        .isUUID()
        .withMessage('Invalid user ID'),
    (0, express_validator_1.query)('cargoCompanyId')
        .optional()
        .isUUID()
        .withMessage('Invalid cargo company ID'),
    (0, express_validator_1.query)('search')
        .optional()
        .isString()
        .withMessage('Search must be a string'),
    (0, express_validator_1.query)('sortBy')
        .optional()
        .isIn(['createdAt', 'updatedAt', 'estimatedDelivery', 'totalAmount'])
        .withMessage('Invalid sort field'),
    (0, express_validator_1.query)('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc'),
    validateRequest
];
router.use(auth_middleware_1.authenticate);
router.post('/', createShipmentValidation, (req, res) => shipment_controller_1.ShipmentController.createShipment(req, res));
router.get('/', listShipmentsValidation, (req, res) => shipment_controller_1.ShipmentController.getUserShipments(req, res));
router.get('/:id', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid shipment ID'),
    validateRequest
], (req, res) => shipment_controller_1.ShipmentController.getShipment(req, res));
router.put('/:id', updateShipmentValidation, (req, res) => {
    res.status(501).json({
        success: false,
        error: {
            code: 'NOT_IMPLEMENTED',
            message: 'Update shipment functionality not yet implemented'
        }
    });
});
router.post('/:id/cancel', cancelShipmentValidation, (req, res) => shipment_controller_1.ShipmentController.cancelShipment(req, res));
router.get('/:id/tracking', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid shipment ID'),
    validateRequest
], (req, res) => {
    shipment_controller_1.ShipmentController.getShipment(req, res);
});
router.use((0, auth_middleware_1.authorize)(['admin']));
router.get('/admin/all', listShipmentsValidation, (req, res) => {
    req.query.adminAll = 'true';
    shipment_controller_1.ShipmentController.getUserShipments(req, res);
});
router.patch('/:id/status', updateStatusValidation, (req, res) => shipment_controller_1.ShipmentController.updateShipmentStatus(req, res));
router.get('/admin/statistics', [
    (0, express_validator_1.query)('period')
        .optional()
        .isIn(['day', 'week', 'month', 'year'])
        .withMessage('Invalid period'),
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date'),
    validateRequest
], (req, res) => shipment_controller_1.ShipmentController.getShipmentStats(req, res));
//# sourceMappingURL=shipment.routes.js.map