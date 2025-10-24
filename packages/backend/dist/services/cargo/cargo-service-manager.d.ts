import { CargoServiceProvider, QuoteRequest, CargoQuoteResponse, TrackingRequest, CargoTrackingResponse, ShipmentCreateRequest, ShipmentCreateResponse, CargoServiceResult, CargoServiceConfig, CargoQuote } from '@cargolink/shared';
export declare class CargoServiceManager {
    private services;
    private configs;
    constructor(configs: CargoServiceConfig[]);
    private initializeServices;
    getAllQuotes(request: QuoteRequest): Promise<CargoServiceResult<CargoQuoteResponse[]>>;
    getBestQuotes(request: QuoteRequest, maxResults?: number): Promise<CargoServiceResult<CargoQuote[]>>;
    trackShipment(request: TrackingRequest): Promise<CargoServiceResult<CargoTrackingResponse>>;
    createShipment(request: ShipmentCreateRequest, provider: CargoServiceProvider): Promise<CargoServiceResult<ShipmentCreateResponse>>;
    cancelShipment(trackingNumber: string, provider: CargoServiceProvider): Promise<CargoServiceResult<boolean>>;
    getAvailableProviders(): CargoServiceProvider[];
    getProviderConfig(provider: CargoServiceProvider): CargoServiceConfig | undefined;
    isProviderAvailable(provider: CargoServiceProvider): boolean;
    getProviderCapabilities(provider: CargoServiceProvider): {
        provider: CargoServiceProvider;
        name: any;
        supportedServices: any;
        supportedCountries: any;
        maxWeight: any;
        maxDimensions: any;
        features: any;
        enabled: any;
    } | null;
    getAllProviderCapabilities(): ({
        provider: CargoServiceProvider;
        name: any;
        supportedServices: any;
        supportedCountries: any;
        maxWeight: any;
        maxDimensions: any;
        features: any;
        enabled: any;
    } | null)[];
    refreshConfiguration(newConfigs: CargoServiceConfig[]): Promise<void>;
    healthCheck(): Promise<Record<CargoServiceProvider, boolean>>;
}
//# sourceMappingURL=cargo-service-manager.d.ts.map