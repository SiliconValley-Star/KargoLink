"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CargoController = void 0;
const cargo_service_manager_1 = require("../services/cargo/cargo-service-manager");
const shared_1 = require("@cargolink/shared");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../config/logger");
class CargoController {
    static cargoManager;
    static initialize(configs) {
        this.cargoManager = new cargo_service_manager_1.CargoServiceManager(configs);
        logger_1.logger.info('Cargo service manager initialized');
    }
    static async getQuotes(req, res) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                throw new errorHandler_1.AppError('User not authenticated', errorHandler_1.HTTP_STATUS.UNAUTHORIZED);
            }
            const quoteRequest = req.body;
            if (!quoteRequest.fromAddress || !quoteRequest.toAddress || !quoteRequest.packages) {
                throw new errorHandler_1.AppError('From address, to address, and packages are required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (quoteRequest.packages.length === 0) {
                throw new errorHandler_1.AppError('At least one package is required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            const result = await this.cargoManager.getAllQuotes(quoteRequest);
            if (!result.success) {
                res.status(errorHandler_1.HTTP_STATUS.BAD_REQUEST).json({
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
                    totalQuotes: result.data.reduce((sum, response) => sum + response.quotes.length, 0),
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to get cargo quotes'
            });
        }
    }
    static async getBestQuotes(req, res) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                throw new errorHandler_1.AppError('User not authenticated', errorHandler_1.HTTP_STATUS.UNAUTHORIZED);
            }
            const quoteRequest = req.body;
            const { maxResults = 5 } = req.query;
            if (!quoteRequest.fromAddress || !quoteRequest.toAddress || !quoteRequest.packages) {
                throw new errorHandler_1.AppError('From address, to address, and packages are required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            const result = await this.cargoManager.getBestQuotes(quoteRequest, parseInt(maxResults) || 5);
            if (!result.success) {
                res.status(errorHandler_1.HTTP_STATUS.BAD_REQUEST).json({
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
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to get best quotes'
            });
        }
    }
    static async trackShipment(req, res) {
        try {
            const { provider, trackingNumber } = req.params;
            if (!provider || !trackingNumber) {
                throw new errorHandler_1.AppError('Provider and tracking number are required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!Object.values(shared_1.CargoServiceProvider).includes(provider)) {
                throw new errorHandler_1.AppError('Invalid cargo service provider', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            const trackingRequest = {
                trackingNumber,
                provider: provider
            };
            const result = await this.cargoManager.trackShipment(trackingRequest);
            if (!result.success) {
                res.status(errorHandler_1.HTTP_STATUS.BAD_REQUEST).json({
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
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to track shipment'
            });
        }
    }
    static async createShipment(req, res) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                throw new errorHandler_1.AppError('User not authenticated', errorHandler_1.HTTP_STATUS.UNAUTHORIZED);
            }
            const { provider } = req.params;
            const shipmentRequest = req.body;
            if (!provider) {
                throw new errorHandler_1.AppError('Provider is required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!Object.values(shared_1.CargoServiceProvider).includes(provider)) {
                throw new errorHandler_1.AppError('Invalid cargo service provider', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!shipmentRequest.fromAddress || !shipmentRequest.toAddress || !shipmentRequest.packages || !shipmentRequest.selectedQuoteId) {
                throw new errorHandler_1.AppError('From address, to address, packages, and selected quote ID are required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            const result = await this.cargoManager.createShipment(shipmentRequest, provider);
            if (!result.success) {
                res.status(errorHandler_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: result.error.code,
                        message: result.error.message
                    }
                });
                return;
            }
            res.status(errorHandler_1.HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Shipment created successfully',
                data: result.data
            });
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to create shipment'
            });
        }
    }
    static async cancelShipment(req, res) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                throw new errorHandler_1.AppError('User not authenticated', errorHandler_1.HTTP_STATUS.UNAUTHORIZED);
            }
            const { provider, trackingNumber } = req.params;
            if (!provider || !trackingNumber) {
                throw new errorHandler_1.AppError('Provider and tracking number are required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!Object.values(shared_1.CargoServiceProvider).includes(provider)) {
                throw new errorHandler_1.AppError('Invalid cargo service provider', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            const result = await this.cargoManager.cancelShipment(trackingNumber, provider);
            if (!result.success) {
                res.status(errorHandler_1.HTTP_STATUS.BAD_REQUEST).json({
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
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to cancel shipment'
            });
        }
    }
    static async getProviders(req, res) {
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
        }
        catch (error) {
            res.status(errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to get cargo providers'
            });
        }
    }
    static async getProviderCapabilities(req, res) {
        try {
            const { provider } = req.params;
            if (!provider) {
                throw new errorHandler_1.AppError('Provider is required', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!Object.values(shared_1.CargoServiceProvider).includes(provider)) {
                throw new errorHandler_1.AppError('Invalid cargo service provider', errorHandler_1.HTTP_STATUS.BAD_REQUEST);
            }
            const capabilities = this.cargoManager.getProviderCapabilities(provider);
            if (!capabilities) {
                throw new errorHandler_1.AppError('Provider not found or not configured', errorHandler_1.HTTP_STATUS.NOT_FOUND);
            }
            res.json({
                success: true,
                data: capabilities
            });
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to get provider capabilities'
            });
        }
    }
    static async healthCheck(req, res) {
        try {
            const currentUser = req.user;
            if (!currentUser || currentUser.role !== 'admin') {
                throw new errorHandler_1.AppError('Admin access required', errorHandler_1.HTTP_STATUS.FORBIDDEN);
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
        }
        catch (error) {
            const statusCode = error.statusCode || errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to check cargo services health'
            });
        }
    }
}
exports.CargoController = CargoController;
//# sourceMappingURL=cargo.controller.js.map