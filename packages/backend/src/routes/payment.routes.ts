import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation error handler middleware
 */
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
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

/**
 * Create payment routes
 */
export const createPaymentRoutes = (paymentController: PaymentController): Router => {
  const router = Router();

  // =============================================================================
  // PAYMENT OPERATIONS
  // =============================================================================

  /**
   * Initialize new payment
   * POST /payments/initialize
   * 
   * Body:
   * - amount: number (required)
   * - currency: string (required)
   * - shipmentId?: string
   * - paymentMethod?: string
   * - preferredProvider?: string
   * - installmentCount?: number
   * - description?: string
   * - successUrl?: string
   * - failureUrl?: string
   * - saveCard?: boolean
   */
  router.post('/initialize',
    authenticate,
    [
      body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),
      
      body('currency')
        .isIn(['TRY', 'USD', 'EUR', 'GBP'])
        .withMessage('Currency must be one of: TRY, USD, EUR, GBP'),
      
      body('shipmentId')
        .optional()
        .isUUID()
        .withMessage('Shipment ID must be a valid UUID'),
      
      body('paymentMethod')
        .optional()
        .isIn(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cash_on_delivery'])
        .withMessage('Invalid payment method'),
      
      body('preferredProvider')
        .optional()
        .isIn(['iyzico', 'paytr', 'stripe', 'paypal'])
        .withMessage('Invalid payment provider'),
      
      body('installmentCount')
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage('Installment count must be between 1 and 12'),
      
      body('description')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Description must not exceed 255 characters'),
      
      body('successUrl')
        .optional()
        .isURL()
        .withMessage('Success URL must be a valid URL'),
      
      body('failureUrl')
        .optional()
        .isURL()
        .withMessage('Failure URL must be a valid URL'),
      
      body('saveCard')
        .optional()
        .isBoolean()
        .withMessage('Save card must be a boolean'),
    ],
    handleValidationErrors,
    paymentController.initializePayment as any
  );

  /**
   * Verify payment after redirect
   * POST /payments/verify
   * 
   * Body:
   * - paymentId: string (required)
   * - provider: string (required)
   * - Additional verification data from payment provider
   */
  router.post('/verify',
    [
      body('paymentId')
        .notEmpty()
        .withMessage('Payment ID is required'),
      
      body('provider')
        .isIn(['iyzico', 'paytr', 'stripe', 'paypal'])
        .withMessage('Invalid payment provider'),
    ],
    handleValidationErrors,
    paymentController.verifyPayment
  );

  /**
   * Get payment status
   * GET /payments/:id/status
   */
  router.get('/:id/status',
    authenticate,
    [
      param('id')
        .isUUID()
        .withMessage('Payment ID must be a valid UUID'),
    ],
    handleValidationErrors,
    paymentController.getPaymentStatus as any
  );

  /**
   * Process refund
   * POST /payments/:id/refund
   * 
   * Body:
   * - amount?: number
   * - reason?: string
   * - description?: string
   */
  router.post('/:id/refund',
    authenticate,
    [
      param('id')
        .isUUID()
        .withMessage('Payment ID must be a valid UUID'),
      
      body('amount')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Refund amount must be greater than 0'),
      
      body('reason')
        .optional()
        .isIn(['customer_request', 'shipment_cancelled', 'service_issue', 'fraud_prevention', 'duplicate_payment'])
        .withMessage('Invalid refund reason'),
      
      body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    ],
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      // Note: Refund endpoint is not implemented in the current controller
      res.status(501).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Refund functionality is not yet implemented'
        }
      });
    }
  );

  // =============================================================================
  // WEBHOOK ENDPOINTS
  // =============================================================================

  /**
   * Process webhook from payment providers
   * POST /payments/webhook/:provider
   * 
   * This endpoint receives webhooks from payment providers and processes them
   * No authentication required as it comes from external providers
   */
  router.post('/webhook/:provider',
    [
      param('provider')
        .isIn(['iyzico', 'paytr', 'stripe', 'paypal'])
        .withMessage('Invalid payment provider'),
    ],
    handleValidationErrors,
    paymentController.processWebhook
  );

  // =============================================================================
  // UTILITY ENDPOINTS
  // =============================================================================

  /**
   * Get installment options
   * GET /payments/installments
   * 
   * Query parameters:
   * - amount: number (required)
   * - currency: string (required)
   * - provider?: string
   * - cardBin?: string
   */
  router.get('/installments',
    [
      query('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),
      
      query('currency')
        .isIn(['TRY', 'USD', 'EUR', 'GBP'])
        .withMessage('Currency must be one of: TRY, USD, EUR, GBP'),
      
      query('provider')
        .optional()
        .isIn(['iyzico', 'paytr', 'stripe', 'paypal'])
        .withMessage('Invalid payment provider'),
      
      query('cardBin')
        .optional()
        .isLength({ min: 6, max: 8 })
        .isNumeric()
        .withMessage('Card BIN must be 6-8 digits'),
    ],
    handleValidationErrors,
    paymentController.getInstallmentOptions
  );

  /**
   * Get available payment providers
   * GET /payments/providers
   * 
   * Returns list of available payment providers with their configurations
   */
  router.get('/providers',
    paymentController.getProviders
  );

  /**
   * Get payment metrics (admin only)
   * GET /payments/metrics
   * 
   * Returns payment metrics and health check for all providers
   * Requires admin role
   */
  router.get('/metrics',
    authenticate,
    authorize(['admin']),
    paymentController.getMetrics as any
  );

  // =============================================================================
  // USER PAYMENT HISTORY
  // =============================================================================

  /**
   * Get user's payment history
   * GET /payments/history
   * 
   * Query parameters:
   * - page?: number (default: 1)
   * - limit?: number (default: 20, max: 100)
   * - status?: string
   * - provider?: string
   * - fromDate?: string (ISO date)
   * - toDate?: string (ISO date)
   */
  router.get('/history',
    authenticate,
    [
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
        .isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'])
        .withMessage('Invalid payment status'),
      
      query('provider')
        .optional()
        .isIn(['iyzico', 'paytr', 'stripe', 'paypal'])
        .withMessage('Invalid payment provider'),
      
      query('fromDate')
        .optional()
        .isISO8601()
        .withMessage('From date must be a valid ISO date'),
      
      query('toDate')
        .optional()
        .isISO8601()
        .withMessage('To date must be a valid ISO date'),
    ],
    handleValidationErrors,
    async (req: any, res: Response) => {
      try {
        const {
          page = 1,
          limit = 20,
          status,
          provider,
          fromDate,
          toDate
        } = req.query;

        const user = req.user;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter conditions
        const where: any = { userId: user.userId };
        
        if (status) where.status = status;
        if (provider) where.provider = provider;
        if (fromDate || toDate) {
          where.createdAt = {};
          if (fromDate) where.createdAt.gte = new Date(fromDate);
          if (toDate) where.createdAt.lte = new Date(toDate);
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
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'PAYMENT_HISTORY_ERROR',
            message: 'Failed to get payment history'
          }
        });
      }
    }
  );

  /**
   * Get specific payment details
   * GET /payments/:id
   */
  router.get('/:id',
    authenticate,
    [
      param('id')
        .isUUID()
        .withMessage('Payment ID must be a valid UUID'),
    ],
    handleValidationErrors,
    async (req: any, res: Response): Promise<void> => {
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
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'PAYMENT_DETAILS_ERROR',
            message: 'Failed to get payment details'
          }
        });
      }
    }
  );

  return router;
};