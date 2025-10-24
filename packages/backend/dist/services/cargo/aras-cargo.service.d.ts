import { QuoteRequest, CargoQuoteResponse, TrackingRequest, CargoTrackingResponse, ShipmentCreateRequest, ShipmentCreateResponse as CargoShipmentCreateResponse, CargoServiceResult, ArasConfig } from '@cargolink/shared';
import { BaseCargoService } from './base-cargo.service';
export declare class ArasCargoService extends BaseCargoService {
    private readonly merchantId;
    constructor(config: ArasConfig);
    protected addAuthentication(config: any): void;
    getQuotes(request: QuoteRequest): Promise<CargoServiceResult<CargoQuoteResponse>>;
    trackShipment(request: TrackingRequest): Promise<CargoServiceResult<CargoTrackingResponse>>;
    createShipment(request: ShipmentCreateRequest): Promise<CargoServiceResult<CargoShipmentCreateResponse>>;
    cancelShipment(trackingNumber: string): Promise<CargoServiceResult<boolean>>;
    private transformToArasQuoteRequest;
    private transformFromArasQuotes;
    private transformToArasShipmentRequest;
    private transformArasEvents;
    private mapOurServiceTypeToAras;
    private mapArasServiceTypeToOur;
    private mapArasStatusToOur;
}
//# sourceMappingURL=aras-cargo.service.d.ts.map