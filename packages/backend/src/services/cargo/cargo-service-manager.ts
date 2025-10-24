// Local type definitions to replace @cargolink/shared dependency
export enum CargoServiceProvider {
  YURTICI = 'yurtici',
  ARAS = 'aras',
  MNG = 'mng',
  PTT = 'ptt',
  UPS = 'ups',
  DHL = 'dhl',
  FEDEX = 'fedex',
  TNT = 'tnt'
}

export enum CargoServiceType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  ECONOMY = 'economy',
  PREMIUM = 'premium'
}

export enum CargoErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  UNSUPPORTED_SERVICE = 'UNSUPPORTED_SERVICE',
  PACKAGE_TOO_HEAVY = 'PACKAGE_TOO_HEAVY',
  PACKAGE_TOO_LARGE = 'PACKAGE_TOO_LARGE',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NO_QUOTES_AVAILABLE = 'NO_QUOTES_AVAILABLE',
  QUOTE_EXPIRED = 'QUOTE_EXPIRED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PARSING_ERROR = 'PARSING_ERROR'
}

export interface CargoAddress {
  country: string;
  city: string;
  district: string;
  neighborhood?: string;
  postalCode: string;
  address: string;
  fullName: string;
  phone: string;
  email?: string;
}

export interface CargoPackage {
  width: number;
  height: number;
  length: number;
  weight: number;
  value: number;
  description: string;
  quantity: number;
}

export interface QuoteRequest {
  fromAddress: CargoAddress;
  toAddress: CargoAddress;
  packages: CargoPackage[];
  serviceType?: CargoServiceType;
  pickupDate?: string;
  deliveryDate?: string;
  insuranceValue?: number;
  codAmount?: number;
  specialServices?: Array<{
    type: string;
    value?: number;
    description?: string;
  }>;
}

export interface Price {
  basePrice: number;
  taxAmount: number;
  fuelSurcharge?: number;
  additionalFees: Array<{
    name: string;
    amount: number;
    description?: string;
  }>;
  totalPrice: number;
  currency: 'TRY';
}

export interface CargoQuote {
  id: string;
  provider: CargoServiceProvider;
  serviceName: string;
  serviceType: CargoServiceType;
  price: Price;
  estimatedDeliveryDays: number;
  estimatedPickupDate?: string;
  estimatedDeliveryDate?: string;
  features: Array<{
    name: string;
    description: string;
    included: boolean;
    additionalCost?: number;
  }>;
  restrictions?: string[];
  validUntil: string;
  trackingCapable: boolean;
  insuranceIncluded: boolean;
  codSupported: boolean;
}

export interface CargoQuoteResponse {
  success: boolean;
  provider: CargoServiceProvider;
  quotes: CargoQuote[];
  error?: string;
  requestId?: string;
  timestamp: string;
}

export interface TrackingRequest {
  trackingNumber: string;
  provider: CargoServiceProvider;
}

export interface CargoTrackingResponse {
  success: boolean;
  provider: CargoServiceProvider;
  trackingNumber: string;
  status: string;
  events: Array<{
    timestamp: string;
    status: string;
    location: string;
    description: string;
    notes?: string;
  }>;
  currentLocation?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  error?: string;
  timestamp: string;
}

export interface ShipmentCreateRequest {
  fromAddress: CargoAddress;
  toAddress: CargoAddress;
  packages: CargoPackage[];
  serviceType: CargoServiceType;
  selectedQuoteId: string;
  pickupDate?: string;
  specialInstructions?: string;
  references?: Array<{
    type: 'invoice' | 'po' | 'customer' | 'internal';
    value: string;
  }>;
  notifications?: {
    email?: string;
    sms?: string;
    notifyOnPickup: boolean;
    notifyOnDelivery: boolean;
    notifyOnException: boolean;
  };
}

export interface ShipmentCreateResponse {
  success: boolean;
  provider: CargoServiceProvider;
  shipment?: {
    trackingNumber: string;
    provider: CargoServiceProvider;
    serviceType: CargoServiceType;
    status: string;
    createdAt: string;
    estimatedPickupDate?: string;
    estimatedDeliveryDate?: string;
    totalCost: number;
    currency: 'TRY';
    labels?: Array<{
      format: 'PDF' | 'PNG' | 'ZPL';
      size: 'A4' | '4x6' | '6x8';
      url?: string;
      content?: string;
    }>;
  };
  error?: string;
  timestamp: string;
}

export interface CargoServiceError {
  code: CargoErrorCode;
  message: string;
  provider: CargoServiceProvider;
  originalError?: any;
  retryable: boolean;
  timestamp: string;
}

export interface CargoServiceConfig {
  provider: CargoServiceProvider;
  name: string;
  apiEndpoint: string;
  apiUrl: string;
  apiKey: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  sandbox: boolean;
  enabled: boolean;
  timeout: number;
  retryAttempts: number;
  supportedServices: CargoServiceType[];
  supportedCountries: string[];
  maxWeight: number;
  maxDimensions: {
    width: number;
    height: number;
    length: number;
  };
  features: {
    tracking: boolean;
    insurance: boolean;
    cod: boolean;
    signature: boolean;
    weekendDelivery: boolean;
  };
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export type CargoServiceResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: CargoServiceError;
};

import { BaseCargoService } from './base-cargo.service';
import { YurticiCargoService } from './yurtici-cargo.service';
import { ArasCargoService } from './aras-cargo.service';
import { MngCargoService } from './mng-cargo.service';
import { logger } from '../../config/logger';

/**
 * Central Cargo Service Manager
 * Manages all cargo provider integrations and provides unified interface
 */
export class CargoServiceManager {
  private services: Map<CargoServiceProvider, BaseCargoService> = new Map();
  private configs: Map<CargoServiceProvider, CargoServiceConfig> = new Map();

  constructor(configs: CargoServiceConfig[]) {
    this.initializeServices(configs);
  }

  /**
   * Initialize cargo services based on configuration
   */
  private initializeServices(configs: CargoServiceConfig[]): void {
    for (const config of configs) {
      try {
        if (!config.enabled) {
          logger.info(`Cargo service ${config.provider} is disabled, skipping initialization`);
          continue;
        }

        this.configs.set(config.provider, config);
        
        let service: BaseCargoService;

        switch (config.provider) {
          case CargoServiceProvider.YURTICI:
            service = new YurticiCargoService(config as any);
            break;

          case CargoServiceProvider.ARAS:
            service = new ArasCargoService(config as any);
            break;

          case CargoServiceProvider.MNG:
            service = new MngCargoService(config as any);
            break;

          default:
            logger.warn(`Unsupported cargo service provider: ${config.provider}`);
            continue;
        }

        // Validate configuration
        if (service.validateConfig()) {
          this.services.set(config.provider, service);
          logger.info(`Cargo service ${config.provider} initialized successfully`);
        }

      } catch (error: any) {
        logger.error(`Failed to initialize cargo service ${config.provider}:`, error);
      }
    }

    logger.info(`Initialized ${this.services.size} cargo services:`, 
      Array.from(this.services.keys()));
  }

  /**
   * Get quotes from all available cargo providers
   */
  async getAllQuotes(request: QuoteRequest): Promise<CargoServiceResult<CargoQuoteResponse[]>> {
    try {
      const enabledServices = Array.from(this.services.values()).filter(service => service.isEnabled());
      
      if (enabledServices.length === 0) {
        return {
          success: false,
          error: {
            code: CargoErrorCode.SERVICE_UNAVAILABLE,
            message: 'No cargo services are available',
            provider: CargoServiceProvider.YURTICI, // Default provider for error
            retryable: false,
            timestamp: new Date().toISOString()
          }
        };
      }

      // Execute all quote requests in parallel
      const quotePromises = enabledServices.map(async (service) => {
        try {
          const result = await service.getQuotes(request);
          return result;
        } catch (error: any) {
          logger.error(`Failed to get quotes from ${service}:`, error);
          return {
            success: false,
            error: error
          } as CargoServiceResult<CargoQuoteResponse>;
        }
      });

      const results = await Promise.allSettled(quotePromises);
      const successfulQuotes: CargoQuoteResponse[] = [];
      const errors: CargoServiceError[] = [];

      // Process results
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulQuotes.push(result.value.data);
        } else if (result.status === 'fulfilled' && !result.value.success) {
          errors.push(result.value.error);
        } else if (result.status === 'rejected') {
          errors.push({
            code: CargoErrorCode.UNKNOWN_ERROR,
            message: result.reason?.message || 'Unknown error occurred',
            provider: CargoServiceProvider.YURTICI, // Default
            retryable: false,
            timestamp: new Date().toISOString()
          });
        }
      }

      if (successfulQuotes.length === 0) {
        return {
          success: false,
          error: {
            code: CargoErrorCode.NO_QUOTES_AVAILABLE,
            message: 'No quotes available from any provider',
            provider: CargoServiceProvider.YURTICI, // Default
            retryable: true,
            timestamp: new Date().toISOString()
          }
        };
      }

      // Log errors for monitoring
      if (errors.length > 0) {
        logger.warn(`Some cargo services failed to provide quotes:`, errors);
      }

      return { success: true, data: successfulQuotes };

    } catch (error: any) {
      logger.error('Failed to get quotes from cargo services:', error);
      return {
        success: false,
        error: {
          code: CargoErrorCode.UNKNOWN_ERROR,
          message: error.message || 'Failed to get quotes',
          provider: CargoServiceProvider.YURTICI, // Default
          retryable: true,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get best quotes (sorted by price and delivery time)
   */
  async getBestQuotes(request: QuoteRequest, maxResults: number = 5): Promise<CargoServiceResult<CargoQuote[]>> {
    const result = await this.getAllQuotes(request);
    
    if (!result.success) {
      return result as any;
    }

    // Collect all quotes from all providers
    const allQuotes: CargoQuote[] = [];
    for (const response of result.data) {
      allQuotes.push(...response.quotes);
    }

    // Sort quotes by total price (ascending) and delivery days (ascending)
    const sortedQuotes = allQuotes.sort((a, b) => {
      // Primary sort: price
      if (a.price.totalPrice !== b.price.totalPrice) {
        return a.price.totalPrice - b.price.totalPrice;
      }
      
      // Secondary sort: delivery time
      return a.estimatedDeliveryDays - b.estimatedDeliveryDays;
    });

    // Take top results
    const bestQuotes = sortedQuotes.slice(0, maxResults);

    return { success: true, data: bestQuotes };
  }

  /**
   * Track shipment with specific provider
   */
  async trackShipment(request: TrackingRequest): Promise<CargoServiceResult<CargoTrackingResponse>> {
    const service = this.services.get(request.provider);
    
    if (!service) {
      return {
        success: false,
        error: {
          code: CargoErrorCode.SERVICE_UNAVAILABLE,
          message: `Cargo service ${request.provider} is not available`,
          provider: request.provider,
          retryable: false,
          timestamp: new Date().toISOString()
        }
      };
    }

    return await service.trackShipment(request);
  }

  /**
   * Create shipment with specific provider
   */
  async createShipment(request: ShipmentCreateRequest, provider: CargoServiceProvider): Promise<CargoServiceResult<ShipmentCreateResponse>> {
    const service = this.services.get(provider);
    
    if (!service) {
      return {
        success: false,
        error: {
          code: CargoErrorCode.SERVICE_UNAVAILABLE,
          message: `Cargo service ${provider} is not available`,
          provider: provider,
          retryable: false,
          timestamp: new Date().toISOString()
        }
      };
    }

    return await service.createShipment(request);
  }

  /**
   * Cancel shipment with specific provider
   */
  async cancelShipment(trackingNumber: string, provider: CargoServiceProvider): Promise<CargoServiceResult<boolean>> {
    const service = this.services.get(provider);
    
    if (!service) {
      return {
        success: false,
        error: {
          code: CargoErrorCode.SERVICE_UNAVAILABLE,
          message: `Cargo service ${provider} is not available`,
          provider: provider,
          retryable: false,
          timestamp: new Date().toISOString()
        }
      };
    }

    return await service.cancelShipment(trackingNumber);
  }

  /**
   * Get available cargo providers
   */
  getAvailableProviders(): CargoServiceProvider[] {
    return Array.from(this.services.keys()).filter(provider => {
      const service = this.services.get(provider);
      return service?.isEnabled() || false;
    });
  }

  /**
   * Get service configuration for provider
   */
  getProviderConfig(provider: CargoServiceProvider): CargoServiceConfig | undefined {
    return this.configs.get(provider);
  }

  /**
   * Check if provider is available and enabled
   */
  isProviderAvailable(provider: CargoServiceProvider): boolean {
    const service = this.services.get(provider);
    return service?.isEnabled() || false;
  }

  /**
   * Get provider capabilities
   */
  getProviderCapabilities(provider: CargoServiceProvider) {
    const config = this.configs.get(provider);
    
    if (!config) {
      return null;
    }

    return {
      provider,
      name: config.name,
      supportedServices: config.supportedServices,
      supportedCountries: config.supportedCountries,
      maxWeight: config.maxWeight,
      maxDimensions: config.maxDimensions,
      features: config.features,
      enabled: config.enabled
    };
  }

  /**
   * Get all provider capabilities
   */
  getAllProviderCapabilities() {
    return Array.from(this.configs.keys())
      .map(provider => this.getProviderCapabilities(provider))
      .filter(Boolean);
  }

  /**
   * Refresh service configuration
   */
  async refreshConfiguration(newConfigs: CargoServiceConfig[]): Promise<void> {
    // Clear existing services
    this.services.clear();
    this.configs.clear();

    // Reinitialize with new configuration
    this.initializeServices(newConfigs);

    logger.info('Cargo service configuration refreshed');
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<Record<CargoServiceProvider, boolean>> {
    const healthStatus: Record<CargoServiceProvider, boolean> = {} as any;

    for (const [provider, service] of this.services.entries()) {
      try {
        // Simple health check - try to validate config and check if enabled
        const isHealthy = service.validateConfig() && service.isEnabled();
        healthStatus[provider] = isHealthy;
      } catch (error) {
        healthStatus[provider] = false;
        logger.error(`Health check failed for ${provider}:`, error);
      }
    }

    return healthStatus;
  }
}