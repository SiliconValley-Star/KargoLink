import { Request, Response } from 'express';
import {
  CargoServiceManager,
  CargoServiceProvider,
  CargoServiceConfig,
  QuoteRequest,
  TrackingRequest,
  ShipmentCreateRequest
} from '../services/cargo/cargo-service-manager';
import { AppError, HTTP_STATUS } from '../middleware/errorHandler';
import { logger } from '../config/logger';

/**
 * Cargo Controller
 * Handles cargo price comparison and shipment operations
 */
export class CargoController {
  private static cargoManager: CargoServiceManager;

  /**
   * Initialize cargo service manager
   */
  static initialize(configs: CargoServiceConfig[]): void {
    this.cargoManager = new CargoServiceManager(configs);
    logger.info('Cargo service manager initialized');
  }

  /**
   * Get quotes from all available cargo providers
   * POST /api/v1/cargo/quotes
   */
  static async getQuotes(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const quoteRequest: QuoteRequest = req.body;

      // Validate request
      if (!quoteRequest.fromAddress || !quoteRequest.toAddress || !quoteRequest.packages) {
        throw new AppError('From address, to address, and packages are required', HTTP_STATUS.BAD_REQUEST);
      }

      if (quoteRequest.packages.length === 0) {
        throw new AppError('At least one package is required', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await this.cargoManager.getAllQuotes(quoteRequest);

      if (!result.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: result.error.code,
            message: result.error.message
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          quotes: result.data,
          totalProviders: result.data.length,
          totalQuotes: result.data.reduce((sum: number, response: any) => sum + response.quotes.length, 0),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get cargo quotes'
      });
    }
  }

  /**
   * Get best quotes sorted by price and delivery time
   * POST /api/v1/cargo/quotes/best
   */
  static async getBestQuotes(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const quoteRequest: QuoteRequest = req.body;
      const { maxResults = 5 } = req.query;

      // Validate request
      if (!quoteRequest.fromAddress || !quoteRequest.toAddress || !quoteRequest.packages) {
        throw new AppError('From address, to address, and packages are required', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await this.cargoManager.getBestQuotes(
        quoteRequest, 
        parseInt(maxResults as string) || 5
      );

      if (!result.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: result.error.code,
            message: result.error.message
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          quotes: result.data,
          count: result.data.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get best quotes'
      });
    }
  }

  /**
   * Track shipment
   * GET /api/v1/cargo/track/:provider/:trackingNumber
   */
  static async trackShipment(req: Request, res: Response) {
    try {
      const { provider, trackingNumber } = req.params;

      if (!provider || !trackingNumber) {
        throw new AppError('Provider and tracking number are required', HTTP_STATUS.BAD_REQUEST);
      }

      // Validate provider
      const validProviders = Object.values(CargoServiceProvider);
      if (!validProviders.includes(provider as CargoServiceProvider)) {
        throw new AppError('Invalid cargo service provider', HTTP_STATUS.BAD_REQUEST);
      }

      const trackingRequest: TrackingRequest = {
        trackingNumber,
        provider: provider as CargoServiceProvider
      };

      const result = await this.cargoManager.trackShipment(trackingRequest);

      if (!result.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: result.error.code,
            message: result.error.message
          }
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to track shipment'
      });
    }
  }

  /**
   * Create shipment with selected provider
   * POST /api/v1/cargo/shipment/:provider
   */
  static async createShipment(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const { provider } = req.params;
      const shipmentRequest: ShipmentCreateRequest = req.body;

      if (!provider) {
        throw new AppError('Provider is required', HTTP_STATUS.BAD_REQUEST);
      }

      // Validate provider
      const validProviders = Object.values(CargoServiceProvider);
      if (!validProviders.includes(provider as CargoServiceProvider)) {
        throw new AppError('Invalid cargo service provider', HTTP_STATUS.BAD_REQUEST);
      }

      // Validate request
      if (!shipmentRequest.fromAddress || !shipmentRequest.toAddress || !shipmentRequest.packages || !shipmentRequest.selectedQuoteId) {
        throw new AppError('From address, to address, packages, and selected quote ID are required', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await this.cargoManager.createShipment(
        shipmentRequest,
        provider as CargoServiceProvider
      );

      if (!result.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: result.error.code,
            message: result.error.message
          }
        });
        return;
      }

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Shipment created successfully',
        data: result.data
      });

    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to create shipment'
      });
    }
  }

  /**
   * Cancel shipment
   * DELETE /api/v1/cargo/shipment/:provider/:trackingNumber
   */
  static async cancelShipment(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const { provider, trackingNumber } = req.params;

      if (!provider || !trackingNumber) {
        throw new AppError('Provider and tracking number are required', HTTP_STATUS.BAD_REQUEST);
      }

      // Validate provider
      const validProviders = Object.values(CargoServiceProvider);
      if (!validProviders.includes(provider as CargoServiceProvider)) {
        throw new AppError('Invalid cargo service provider', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await this.cargoManager.cancelShipment(
        trackingNumber,
        provider as CargoServiceProvider
      );

      if (!result.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: result.error.code,
            message: result.error.message
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Shipment cancelled successfully',
        data: { cancelled: result.data }
      });

    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to cancel shipment'
      });
    }
  }

  /**
   * Get available cargo providers
   * GET /api/v1/cargo/providers
   */
  static async getProviders(req: Request, res: Response) {
    try {
      const providers = this.cargoManager.getAvailableProviders();
      const capabilities = this.cargoManager.getAllProviderCapabilities();

      res.json({
        success: true,
        data: {
          providers,
          capabilities,
          count: providers.length
        }
      });

    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to get cargo providers'
      });
    }
  }

  /**
   * Get provider capabilities
   * GET /api/v1/cargo/providers/:provider
   */
  static async getProviderCapabilities(req: Request, res: Response) {
    try {
      const { provider } = req.params;

      if (!provider) {
        throw new AppError('Provider is required', HTTP_STATUS.BAD_REQUEST);
      }

      // Validate provider
      if (!Object.values(CargoServiceProvider).includes(provider as CargoServiceProvider)) {
        throw new AppError('Invalid cargo service provider', HTTP_STATUS.BAD_REQUEST);
      }

      const capabilities = this.cargoManager.getProviderCapabilities(provider as CargoServiceProvider);

      if (!capabilities) {
        throw new AppError('Provider not found or not configured', HTTP_STATUS.NOT_FOUND);
      }

      res.json({
        success: true,
        data: capabilities
      });

    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get provider capabilities'
      });
    }
  }

  /**
   * Health check for all cargo services
   * GET /api/v1/cargo/health
   */
  static async healthCheck(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      
      // Only admin can access health check
      if (!currentUser || currentUser.role !== 'admin') {
        throw new AppError('Admin access required', HTTP_STATUS.FORBIDDEN);
      }

      const healthStatus = await this.cargoManager.healthCheck();

      const totalServices = Object.keys(healthStatus).length;
      const healthyServices = Object.values(healthStatus).filter(Boolean).length;

      res.json({
        success: true,
        data: {
          status: healthyServices === totalServices ? 'healthy' : 'degraded',
          services: healthStatus,
          summary: {
            total: totalServices,
            healthy: healthyServices,
            unhealthy: totalServices - healthyServices
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to check cargo services health'
      });
    }
  }
}