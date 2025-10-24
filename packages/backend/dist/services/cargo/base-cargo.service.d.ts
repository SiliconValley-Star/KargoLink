import { AxiosInstance } from 'axios';
import { CargoServiceProvider, QuoteRequest, CargoQuoteResponse, TrackingRequest, CargoTrackingResponse, ShipmentCreateRequest, ShipmentCreateResponse, CargoServiceConfig, CargoServiceError, CargoErrorCode, CargoServiceResult } from '@cargolink/shared';
export declare abstract class BaseCargoService {
    protected config: CargoServiceConfig;
    protected provider: CargoServiceProvider;
    protected httpClient: AxiosInstance;
    constructor(config: CargoServiceConfig);
    private setupInterceptors;
    protected abstract addAuthentication(config: any): void;
    abstract getQuotes(request: QuoteRequest): Promise<CargoServiceResult<CargoQuoteResponse>>;
    abstract trackShipment(request: TrackingRequest): Promise<CargoServiceResult<CargoTrackingResponse>>;
    abstract createShipment(request: ShipmentCreateRequest): Promise<CargoServiceResult<ShipmentCreateResponse>>;
    abstract cancelShipment(trackingNumber: string): Promise<CargoServiceResult<boolean>>;
    validateConfig(): boolean;
    isEnabled(): boolean;
    supportsServiceType(serviceType: string): boolean;
    isWithinWeightLimits(totalWeight: number): boolean;
    isWithinDimensionLimits(width: number, height: number, length: number): boolean;
    protected createError(code: CargoErrorCode, message: string, originalError?: any, retryable?: boolean): CargoServiceError;
    protected handleHttpError(error: any): CargoServiceError;
    protected validateQuoteRequest(request: QuoteRequest): void;
    protected checkRateLimit(): Promise<void>;
    protected logRequest(method: string, url: string, data?: any): void;
    protected logResponse(method: string, url: string, response: any): void;
    protected makeRequest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any, headers?: Record<string, string>): Promise<T>;
}
//# sourceMappingURL=base-cargo.service.d.ts.map