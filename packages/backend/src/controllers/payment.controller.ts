import { Request, Response } from 'express';
import { PaymentServiceManager } from '../services/payment/PaymentServiceManager';
import {
  PaymentRequest,
  RefundRequest,
  ServicePaymentProvider,
  ServiceCurrency,
  ServicePaymentMethod,
  RefundReason
} from '@cargolink/shared/src/types/payment-service.types';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import logger, { paymentLogger } from '../utils/logger';

/**
 * Payment Controller
 * Handles all payment-related HTTP requests
 */
export class PaymentController {
  private readonly paymentServiceManager: PaymentServiceManager;
  private readonly logger = paymentLogger.child({ component: 'PaymentController' });

  constructor(paymentServiceManager: PaymentServiceManager) {
    this.paymentServiceManager = paymentServiceManager;
  }

  // =============================================================================
  // PAYMENT OPERATIONS
  // =============================================================================

  /**
   * Initialize new payment
   * POST /payments/initialize
   */
  initializePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        amount,
        currency,
        shipmentId,
        paymentMethod,
        preferredProvider,
        installmentCount,
        description,
        successUrl,
        failureUrl,
        saveCard = false
      } = req.body;

      const user = req.user!;

      this.logger.info('Payment initialization request', {
        userId: user.userId,
        amount,
        currency,
        shipmentId,
        paymentMethod,
        preferredProvider
      });

      // Validate required fields
      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Valid payment amount is required'
          }
        });
        return;
      }

      if (!currency) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CURRENCY',
            message: 'Currency is required'
          }
        });
        return;
      }

      // Get shipment if provided
      let shipment = null;
      if (shipmentId) {
        shipment = await prisma.shipment.findFirst({
          where: {
            id: shipmentId,
            senderId: user.userId
          }
        });

        if (!shipment) {
          res.status(404).json({
            success: false,
            error: {
              code: 'SHIPMENT_NOT_FOUND',
              message: 'Shipment not found or access denied'
            }
          });
          return;
        }
      }

      // Get full user data for customer info
      const fullUser = await AuthService.getUserById(user.userId);
      if (!fullUser) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
        return;
      }

      // Get default address or use fallback
      const defaultAddress = fullUser.addresses?.find(addr => addr.isDefault);

      // Build payment request
      const paymentRequest: PaymentRequest = {
        orderId: `order_${Date.now()}_${user.userId}`,
        amount,
        currency: currency as ServiceCurrency,
        description: description || `Payment for shipment ${shipmentId || 'N/A'}`,
        customer: {
          id: fullUser.id.toString(),
          name: fullUser.firstName,
          surname: fullUser.lastName,
          email: fullUser.email,
          phone: fullUser.phone || '+90 555 000 0000',
          identityNumber: fullUser.businessInfo?.taxNumber || '',
          registrationDate: fullUser.createdAt,
          lastLoginDate: fullUser.lastLoginAt || new Date().toISOString()
        },
        billingAddress: {
          contactName: `${fullUser.firstName} ${fullUser.lastName}`,
          city: defaultAddress?.city || 'Istanbul',
          district: defaultAddress?.district || 'Kadikoy',
          address: defaultAddress?.addressLine1 || 'Default Address',
          postalCode: defaultAddress?.postalCode || '34710',
          country: defaultAddress?.country || 'Turkey'
        },
        basketItems: [{
          id: shipmentId || 'service_1',
          name: description || 'Cargo Service',
          category1: 'Logistics',
          category2: 'Shipping',
          itemType: 'PHYSICAL',
          unitPrice: amount,
          quantity: 1
        }],
        paymentMethod: paymentMethod as ServicePaymentMethod,
        installmentCount,
        successUrl: successUrl || `${process.env.FRONTEND_URL}/payment/success`,
        failureUrl: failureUrl || `${process.env.FRONTEND_URL}/payment/failure`,
        webhookUrl: `${process.env.API_BASE_URL}/api/payments/webhook`,
        metadata: {
          userId: user.userId,
          shipmentId,
          saveCard
        }
      };

      // Initialize payment
      const result = await this.paymentServiceManager.initializePayment(
        paymentRequest,
        preferredProvider as ServicePaymentProvider
      );

      if (result.success) {
        // Save payment to database
        const payment = await prisma.payment.create({
          data: {
            transactionId: result.data.paymentId,
            userId: user.userId,
            shipmentId,
            amount: amount,
            originalAmount: amount,
            method: paymentMethod || 'CREDIT_CARD',
            provider: result.data.provider.toLowerCase() as any,
            status: 'PENDING',
            providerTransactionId: result.data.providerPaymentId,
            fees: {},
            grossAmount: amount,
            netAmount: amount,
            expiresAt: result.data.expiresAt ? new Date(result.data.expiresAt) : undefined,
            refundableAmount: amount,
            reconciled: false
          }
        });

        this.logger.info('Payment initialized successfully', {
          userId: user.userId,
          paymentId: payment.id,
          transactionId: result.data.paymentId,
          provider: result.data.provider
        });

        res.json({
          success: true,
          data: {
            paymentId: payment.id,
            transactionId: result.data.paymentId,
            provider: result.data.provider,
            status: result.data.status,
            paymentUrl: result.data.paymentUrl,
            expiresAt: result.data.expiresAt,
            requiresRedirect: !!result.data.paymentUrl
          }
        });
      } else {
        this.logger.warn('Payment initialization failed', {
          userId: user.userId,
          error: result.error
        });

        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      this.logger.error('Payment initialization error', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'PAYMENT_INITIALIZATION_ERROR',
          message: 'Failed to initialize payment'
        }
      });
    }
  };

  /**
   * Verify payment after redirect from payment provider
   * POST /payments/verify
   */
  verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { paymentId, provider, ...verificationData } = req.body;

      this.logger.info('Payment verification request', {
        paymentId,
        provider
      });

      if (!paymentId || !provider) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'Payment ID and provider are required'
          }
        });
        return;
      }

      // Get payment from database
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { id: paymentId },
            { transactionId: paymentId },
            { providerTransactionId: paymentId }
          ]
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

      // Verify with payment provider
      const result = await this.paymentServiceManager.verifyPayment(
        paymentId,
        provider as ServicePaymentProvider,
        verificationData
      );

      if (result.success) {
        // Update payment status in database
        const updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: result.data.status === 'success' ? 'COMPLETED' : 'FAILED',
            paidAt: result.data.status === 'success' ? new Date() : null,
            processedAt: new Date(),
            providerStatus: result.data.status
          }
        });

        this.logger.info('Payment verified successfully', {
          paymentId: payment.id,
          transactionId: result.data.paymentId,
          status: result.data.status
        });

        res.json({
          success: true,
          data: {
            paymentId: updatedPayment.id,
            status: updatedPayment.status,
            amount: updatedPayment.amount,
            paidAt: updatedPayment.paidAt
          }
        });
      } else {
        // Update payment as failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            processedAt: new Date()
          }
        });

        this.logger.warn('Payment verification failed', {
          paymentId: payment.id,
          error: result.error
        });

        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      this.logger.error('Payment verification error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'PAYMENT_VERIFICATION_ERROR',
          message: 'Failed to verify payment'
        }
      });
    }
  };

  /**
   * Get payment status
   * GET /payments/:id/status
   */
  getPaymentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      // Get payment from database
      const payment = await prisma.payment.findFirst({
        where: {
          id,
          userId: user.userId
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
        data: {
          paymentId: payment.id,
          status: payment.status,
          amount: payment.amount,
          provider: payment.provider,
          createdAt: payment.createdAt,
          paidAt: payment.paidAt,
          processedAt: payment.processedAt
        }
      });
    } catch (error) {
      this.logger.error('Get payment status error', {
        userId: req.user?.userId,
        paymentId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'PAYMENT_STATUS_ERROR',
          message: 'Failed to get payment status'
        }
      });
    }
  };

  /**
   * Process webhook from payment providers
   * POST /payments/webhook/:provider
   */
  processWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provider } = req.params;
      const headers = req.headers as Record<string, string>;
      const body = req.body;

      this.logger.info('Webhook received', {
        provider,
        headers: Object.keys(headers),
        bodyKeys: typeof body === 'object' ? Object.keys(body) : 'non-object'
      });

      // Process webhook with payment provider
      const result = await this.paymentServiceManager.processWebhook(
        provider as ServicePaymentProvider,
        headers,
        body
      );

      if (result.success) {
        const webhook = result.data;

        // Find and update payment based on webhook data
        const payment = await prisma.payment.findFirst({
          where: {
            OR: [
              { transactionId: webhook.paymentId },
              { providerTransactionId: webhook.paymentId }
            ]
          }
        });

        if (payment) {
          const newStatus = webhook.status === 'success' ? 'COMPLETED' : 'FAILED';
          
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: newStatus,
              processedAt: new Date(),
              paidAt: webhook.status === 'success' ? new Date() : null,
              providerStatus: webhook.status
            }
          });

          this.logger.info('Payment updated from webhook', {
            paymentId: payment.id,
            transactionId: webhook.paymentId,
            status: newStatus,
            provider
          });
        }

        res.status(200).json({ success: true });
      } else {
        this.logger.warn('Webhook processing failed', {
          provider,
          error: result.error
        });

        res.status(400).json({ success: false });
      }
    } catch (error) {
      this.logger.error('Webhook processing error', {
        provider: req.params.provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ success: false });
    }
  };

  // =============================================================================
  // UTILITY ENDPOINTS
  // =============================================================================

  /**
   * Get installment options
   * GET /payments/installments
   */
  getInstallmentOptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount, currency, provider, cardBin } = req.query;

      if (!amount || !currency) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'Amount and currency are required'
          }
        });
        return;
      }

      const result = await this.paymentServiceManager.getInstallmentOptions(
        parseFloat(amount as string),
        currency as string,
        provider as ServicePaymentProvider,
        cardBin as string
      );

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      this.logger.error('Get installment options error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INSTALLMENT_OPTIONS_ERROR',
          message: 'Failed to get installment options'
        }
      });
    }
  };

  /**
   * Get available payment providers
   * GET /payments/providers
   */
  getProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      const providers = this.paymentServiceManager.getAvailableProviders();
      
      const providerConfigs = providers.map(provider => {
        const config = this.paymentServiceManager.getProviderConfig(provider);
        return {
          provider,
          name: config?.name,
          enabled: config?.enabled,
          supportedCurrencies: config?.supportedCurrencies,
          supportedPaymentMethods: config?.supportedPaymentMethods,
          supports3DSecure: config?.supports3DSecure,
          supportsInstallments: config?.supportsInstallments,
          supportsRefunds: config?.supportsRefunds
        };
      });

      res.json({
        success: true,
        data: providerConfigs
      });
    } catch (error) {
      this.logger.error('Get providers error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'GET_PROVIDERS_ERROR',
          message: 'Failed to get payment providers'
        }
      });
    }
  };

  /**
   * Get payment metrics (admin only)
   * GET /payments/metrics
   */
  getMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;

      // Check if user is admin
      if (user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admin access required'
          }
        });
        return;
      }

      const metrics = this.paymentServiceManager.getMetrics();
      const healthCheck = await this.paymentServiceManager.healthCheck();

      res.json({
        success: true,
        data: {
          metrics,
          healthCheck
        }
      });
    } catch (error) {
      this.logger.error('Get metrics error', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'GET_METRICS_ERROR',
          message: 'Failed to get payment metrics'
        }
      });
    }
  };
}