"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: errors.array()
            }
        });
        return;
    }
    next();
};
const createPaymentRoutes = (paymentController) => {
    const router = (0, express_1.Router)();
    router.post('/initialize', auth_middleware_1.authenticate, [
        (0, express_validator_1.body)('amount')
            .isFloat({ min: 0.01 })
            .withMessage('Amount must be greater than 0'),
        (0, express_validator_1.body)('currency')
            .isIn(['TRY', 'USD', 'EUR', 'GBP'])
            .withMessage('Currency must be one of: TRY, USD, EUR, GBP'),
        (0, express_validator_1.body)('shipmentId')
            .optional()
            .isUUID()
            .withMessage('Shipment ID must be a valid UUID'),
        (0, express_validator_1.body)('paymentMethod')
            .optional()
            .isIn(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cash_on_delivery'])
            .withMessage('Invalid payment method'),
        (0, express_validator_1.body)('preferredProvider')
            .optional()
            .isIn(['iyzico', 'paytr', 'stripe', 'paypal'])
            .withMessage('Invalid payment provider'),
        (0, express_validator_1.body)('installmentCount')
            .optional()
            .isInt({ min: 1, max: 12 })
            .withMessage('Installment count must be between 1 and 12'),
        (0, express_validator_1.body)('description')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Description must not exceed 255 characters'),
        (0, express_validator_1.body)('successUrl')
            .optional()
            .isURL()
            .withMessage('Success URL must be a valid URL'),
        (0, express_validator_1.body)('failureUrl')
            .optional()
            .isURL()
            .withMessage('Failure URL must be a valid URL'),
        (0, express_validator_1.body)('saveCard')
            .optional()
            .isBoolean()
            .withMessage('Save card must be a boolean'),
    ], handleValidationErrors, paymentController.initializePayment);
    router.post('/verify', [
        (0, express_validator_1.body)('paymentId')
            .notEmpty()
            .withMessage('Payment ID is required'),
        (0, express_validator_1.body)('provider')
            .isIn(['iyzico', 'paytr', 'stripe', 'paypal'])
            .withMessage('Invalid payment provider'),
    ], handleValidationErrors, paymentController.verifyPayment);
    router.get('/:id/status', auth_middleware_1.authenticate, [
        (0, express_validator_1.param)('id')
            .isUUID()
            .withMessage('Payment ID must be a valid UUID'),
    ], handleValidationErrors, paymentController.getPaymentStatus);
    router.post('/:id/refund', auth_middleware_1.authenticate, [
        (0, express_validator_1.param)('id')
            .isUUID()
            .withMessage('Payment ID must be a valid UUID'),
        (0, express_validator_1.body)('amount')
            .optional()
            .isFloat({ min: 0.01 })
            .withMessage('Refund amount must be greater than 0'),
        (0, express_validator_1.body)('reason')
            .optional()
            .isIn(['customer_request', 'shipment_cancelled', 'service_issue', 'fraud_prevention', 'duplicate_payment'])
            .withMessage('Invalid refund reason'),
        (0, express_validator_1.body)('description')
            .optional()
            .isLength({ max: 500 })
            .withMessage('Description must not exceed 500 characters'),
    ], handleValidationErrors, (req, res, next) => {
        res.status(501).json({
            success: false,
            error: {
                code: 'NOT_IMPLEMENTED',
                message: 'Refund functionality is not yet implemented'
            }
        });
    });
    router.post('/webhook/:provider', [
        (0, express_validator_1.param)('provider')
            .isIn(['iyzico', 'paytr', 'stripe', 'paypal'])
            .withMessage('Invalid payment provider'),
    ], handleValidationErrors, paymentController.processWebhook);
    router.get('/installments', [
        (0, express_validator_1.query)('amount')
            .isFloat({ min: 0.01 })
            .withMessage('Amount must be greater than 0'),
        (0, express_validator_1.query)('currency')
            .isIn(['TRY', 'USD', 'EUR', 'GBP'])
            .withMessage('Currency must be one of: TRY, USD, EUR, GBP'),
        (0, express_validator_1.query)('provider')
            .optional()
            .isIn(['iyzico', 'paytr', 'stripe', 'paypal'])
            .withMessage('Invalid payment provider'),
        (0, express_validator_1.query)('cardBin')
            .optional()
            .isLength({ min: 6, max: 8 })
            .isNumeric()
            .withMessage('Card BIN must be 6-8 digits'),
    ], handleValidationErrors, paymentController.getInstallmentOptions);
    router.get('/providers', paymentController.getProviders);
    router.get('/metrics', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), paymentController.getMetrics);
    router.get('/history', auth_middleware_1.authenticate, [
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
            .isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'])
            .withMessage('Invalid payment status'),
        (0, express_validator_1.query)('provider')
            .optional()
            .isIn(['iyzico', 'paytr', 'stripe', 'paypal'])
            .withMessage('Invalid payment provider'),
        (0, express_validator_1.query)('fromDate')
            .optional()
            .isISO8601()
            .withMessage('From date must be a valid ISO date'),
        (0, express_validator_1.query)('toDate')
            .optional()
            .isISO8601()
            .withMessage('To date must be a valid ISO date'),
    ], handleValidationErrors, async (req, res) => {
        try {
            const { page = 1, limit = 20, status, provider, fromDate, toDate } = req.query;
            const user = req.user;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const where = { userId: user.userId };
            if (status)
                where.status = status;
            if (provider)
                where.provider = provider;
            if (fromDate || toDate) {
                where.createdAt = {};
                if (fromDate)
                    where.createdAt.gte = new Date(fromDate);
                if (toDate)
                    where.createdAt.lte = new Date(toDate);
            }
            const [payments, total] = await Promise.all([
                req.prisma?.payment.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit),
                    select: {
                        id: true,
                        transactionId: true,
                        amount: true,
                        method: true,
                        provider: true,
                        status: true,
                        createdAt: true,
                        paidAt: true,
                        processedAt: true,
                        shipmentId: true,
                        refundableAmount: true
                    }
                }) || [],
                req.prisma?.payment.count({ where }) || 0
            ]);
            res.json({
                success: true,
                data: {
                    payments,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages: Math.ceil(total / parseInt(limit)),
                        hasNext: skip + parseInt(limit) < total,
                        hasPrev: parseInt(page) > 1
                    }
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: {
                    code: 'PAYMENT_HISTORY_ERROR',
                    message: 'Failed to get payment history'
                }
            });
        }
    });
    router.get('/:id', auth_middleware_1.authenticate, [
        (0, express_validator_1.param)('id')
            .isUUID()
            .withMessage('Payment ID must be a valid UUID'),
    ], handleValidationErrors, async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;
            const payment = await req.prisma?.payment.findFirst({
                where: {
                    id,
                    userId: user.userId
                },
                include: {
                    refunds: {
                        select: {
                            id: true,
                            amount: true,
                            reason: true,
                            status: true,
                            requestedAt: true,
                            processedAt: true,
                            completedAt: true
                        }
                    }
                }
            });
            if (!payment) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'PAYMENT_NOT_FOUND',
                        message: 'Payment not found'
                    }
                });
                return;
            }
            res.json({
                success: true,
                data: payment
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: {
                    code: 'PAYMENT_DETAILS_ERROR',
                    message: 'Failed to get payment details'
                }
            });
        }
    });
    return router;
};
exports.createPaymentRoutes = createPaymentRoutes;
//# sourceMappingURL=payment.routes.js.map