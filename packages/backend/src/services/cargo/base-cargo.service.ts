import axios, { AxiosInstance } from 'axios';
import {
  CargoServiceProvider,
  QuoteRequest,
  CargoQuoteResponse,
  TrackingRequest,
  CargoTrackingResponse,
  ShipmentCreateRequest,
  ShipmentCreateResponse,
  CargoServiceConfig,
  CargoServiceError,
  CargoErrorCode,
  CargoServiceResult,
  CargoServiceType
} from './cargo-service-manager';

/**
 * Abstract base class for all cargo service integrations
 * Defines common interface and shared functionality
 */
export abstract class BaseCargoService {
  protected config: CargoServiceConfig;
  protected provider: CargoServiceProvider;
  protected httpClient: AxiosInstance;

  constructor(config: CargoServiceConfig) {
    this.config = config;
    this.provider = config.provider;
    this.httpClient = axios.create({
      baseURL: config.apiEndpoint,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CargoLink/1.0.0'
      }
    });

    this.setupInterceptors();
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.httpClient.interceptors.request.use((config) => {
      // Add API key to headers or query params based on provider
      this.addAuthentication(config);
      return config;
    });

    // Response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        throw this.handleHttpError(error);
      }
    );
  }

  /**
   * Add authentication to request config - to be implemented by child classes
   */
  protected abstract addAuthentication(config: any): void;

  /**
   * Get quotes from cargo provider
   */
  abstract getQuotes(request: QuoteRequest): Promise<CargoServiceResult<CargoQuoteResponse>>;

  /**
   * Track shipment by tracking number
   */
  abstract trackShipment(request: TrackingRequest): Promise<CargoServiceResult<CargoTrackingResponse>>;

  /**
   * Create shipment with selected quote
   */
  abstract createShipment(request: ShipmentCreateRequest): Promise<CargoServiceResult<ShipmentCreateResponse>>;

  /**
   * Cancel shipment
   */
  abstract cancelShipment(trackingNumber: string): Promise<CargoServiceResult<boolean>>;

  /**
   * Validate service configuration
   */
  validateConfig(): boolean {
    if (!this.config.apiKey) {
      throw new Error(`API key is required for ${this.provider}`);
    }
    
    if (!this.config.apiEndpoint) {
      throw new Error(`API endpoint is required for ${this.provider}`);
    }

    return true;
  }

  /**
   * Check if service is enabled and available
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Check if service supports specific service type
   */
  supportsServiceType(serviceType: string): boolean {
    return this.config.supportedServices.includes(serviceType as any);
  }

  /**
   * Check package weight limits
   */
  isWithinWeightLimits(totalWeight: number): boolean {
    return totalWeight <= this.config.maxWeight;
  }

  /**
   * Check package dimension limits
   */
  isWithinDimensionLimits(width: number, height: number, length: number): boolean {
    const { maxDimensions } = this.config;
    return (
      width <= maxDimensions.width &&
      height <= maxDimensions.height &&
      length <= maxDimensions.length
    );
  }

  /**
   * Create standardized error object
   */
  protected createError(
    code: CargoErrorCode, 
    message: string, 
    originalError?: any,
    retryable: boolean = false
  ): CargoServiceError {
    return {
      code,
      message,
      provider: this.provider,
      originalError,
      retryable,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Handle HTTP errors from cargo provider APIs
   */
  protected handleHttpError(error: any): CargoServiceError {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return this.createError(
            CargoErrorCode.INVALID_ADDRESS, 
            data?.message || 'Invalid request parameters',
            error
          );
        
        case 401:
        case 403:
          return this.createError(
            CargoErrorCode.INVALID_CREDENTIALS,
            'Invalid API credentials',
            error
          );
        
        case 429:
          return this.createError(
            CargoErrorCode.RATE_LIMIT_EXCEEDED,
            'Rate limit exceeded, please try again later',
            error,
            true
          );
        
        case 500:
        case 502:
        case 503:
        case 504:
          return this.createError(
            CargoErrorCode.SERVICE_UNAVAILABLE,
            'Cargo service temporarily unavailable',
            error,
            true
          );
        
        default:
          return this.createError(
            CargoErrorCode.UNKNOWN_ERROR,
            data?.message || 'Unknown error occurred',
            error
          );
      }
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return this.createError(
        CargoErrorCode.CONNECTION_FAILED,
        'Failed to connect to cargo service',
        error,
        true
      );
    }

    if (error.code === 'ETIMEDOUT') {
      return this.createError(
        CargoErrorCode.TIMEOUT,
        'Request timeout',
        error,
        true
      );
    }

    return this.createError(
      CargoErrorCode.UNKNOWN_ERROR,
      error.message || 'Unknown error occurred',
      error
    );
  }

  /**
   * Validate quote request before sending to provider
   */
  protected validateQuoteRequest(request: QuoteRequest): void {
    // Validate addresses
    if (!request.fromAddress || !request.toAddress) {
      throw this.createError(
        CargoErrorCode.INVALID_ADDRESS,
        'From and to addresses are required'
      );
    }

    // Validate packages
    if (!request.packages || request.packages.length === 0) {
      throw this.createError(
        CargoErrorCode.PACKAGE_TOO_HEAVY,
        'At least one package is required'
      );
    }

    // Check weight limits
    const totalWeight = request.packages.reduce((sum: number, pkg: any) => sum + pkg.weight, 0);
    if (!this.isWithinWeightLimits(totalWeight)) {
      throw this.createError(
        CargoErrorCode.PACKAGE_TOO_HEAVY,
        `Total weight ${totalWeight}kg exceeds limit of ${this.config.maxWeight}kg`
      );
    }

    // Check dimension limits
    for (const pkg of request.packages) {
      if (!this.isWithinDimensionLimits(pkg.width, pkg.height, pkg.length)) {
        throw this.createError(
          CargoErrorCode.PACKAGE_TOO_LARGE,
          `Package dimensions exceed maximum allowed size`
        );
      }
    }
  }

  /**
   * Rate limiting check
   */
  protected async checkRateLimit(): Promise<void> {
    // TODO: Implement rate limiting logic with Redis
    // For now, just a placeholder
  }

  /**
   * Log request/response for debugging
   */
  protected logRequest(method: string, url: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.provider}] ${method} ${url}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  protected logResponse(method: string, url: string, response: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.provider}] Response for ${method} ${url}`, JSON.stringify(response, null, 2));
    }
  }

  /**
   * Generic HTTP client wrapper with error handling
   */
  protected async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    try {
      await this.checkRateLimit();
      
      this.logRequest(method, url, data);
      
      const response = await this.httpClient({
        method,
        url,
        data,
        headers
      });
      
      this.logResponse(method, url, response.data);
      
      return response.data;
    } catch (error) {
      throw error; // Error is already handled by interceptor
    }
  }
}