import { QuoteRequest, CargoQuoteResponse, TrackingRequest, CargoTrackingResponse, ShipmentCreateRequest, ShipmentCreateResponse as CargoShipmentCreateResponse, CargoServiceResult, YurticiConfig } from '@cargolink/shared';
import { BaseCargoService } from './base-cargo.service';
export declare class YurticiCargoService extends BaseCargoService {
    private readonly customerId;
    constructor(config: YurticiConfig);
    protected addAuthentication(config: any): void;
    getQuotes(request: QuoteRequest): Promise<CargoServiceResult<CargoQuoteResponse>>;
    trackShipment(request: TrackingRequest): Promise<CargoServiceResult<CargoTrackingResponse>>;
    createShipment(request: ShipmentCreateRequest): Promise<CargoServiceResult<CargoShipmentCreateResponse>>;
    cancelShipment(trackingNumber: string): Promise<CargoServiceResult<boolean>>;
    private transformToYurticiQuoteRequest;
    private transformFromYurticiQuotes;
    private transformToYurticiShipmentRequest;
    private transformYurticiEvents;
    private mapOurServiceTypeToYurtici;
    private mapYurticiServiceTypeToOur;
    private mapYurticiStatusToOur;
}
//# sourceMappingURL=yurtici-cargo.service.d.ts.map