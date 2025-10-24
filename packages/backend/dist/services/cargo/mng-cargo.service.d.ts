import { QuoteRequest, CargoQuoteResponse, TrackingRequest, CargoTrackingResponse, ShipmentCreateRequest, ShipmentCreateResponse as CargoShipmentCreateResponse, CargoServiceResult, MngConfig } from '@cargolink/shared';
import { BaseCargoService } from './base-cargo.service';
export declare class MngCargoService extends BaseCargoService {
    private readonly customerId;
    constructor(config: MngConfig);
    protected addAuthentication(config: any): void;
    getQuotes(request: QuoteRequest): Promise<CargoServiceResult<CargoQuoteResponse>>;
    trackShipment(request: TrackingRequest): Promise<CargoServiceResult<CargoTrackingResponse>>;
    createShipment(request: ShipmentCreateRequest): Promise<CargoServiceResult<CargoShipmentCreateResponse>>;
    cancelShipment(trackingNumber: string): Promise<CargoServiceResult<boolean>>;
    private transformToMngQuoteRequest;
    private transformFromMngQuotes;
    private transformToMngShipmentRequest;
    private transformMngEvents;
    private calculateTotalVolume;
    private mapSpecialServices;
    private mapOurServiceTypeToMng;
    private mapMngServiceTypeToOur;
    private mapMngStatusToOur;
}
//# sourceMappingURL=mng-cargo.service.d.ts.map