import {
  CargoServiceProvider,
  QuoteRequest,
  CargoQuoteResponse,
  TrackingRequest,
  CargoTrackingResponse,
  ShipmentCreateRequest,
  ShipmentCreateResponse,
  CargoServiceResult,
  CargoErrorCode,
  CargoServiceConfig,
  CargoQuote,
  CargoServiceType
} from './cargo-service-manager';

// Local type definitions
enum TrackingStatus {
  CREATED = 'created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  RETURNED = 'returned'
}

interface CargoTrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
  notes?: string;
}

interface ArasConfig extends CargoServiceConfig {
  provider: CargoServiceProvider.ARAS;
  merchantId?: string;
}
import { BaseCargoService } from './base-cargo.service';

/**
 * Aras Kargo API Integration
 * Hızlı ve yaygın hizmet ağı
 */
export class ArasCargoService extends BaseCargoService {
  private readonly merchantId: string;

  constructor(config: ArasConfig) {
    super(config);
    this.merchantId = config.merchantId || '';
  }

  /**
   * Add Aras Kargo specific authentication
   */
  protected addAuthentication(config: any): void {
    // Aras Kargo uses API Key + Merchant ID
    config.headers = {
      ...config.headers,
      'X-API-Key': this.config.apiKey,
      'X-Merchant-ID': this.merchantId,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get quotes from Aras Kargo
   */
  async getQuotes(request: QuoteRequest): Promise<CargoServiceResult<CargoQuoteResponse>> {
    try {
      this.validateQuoteRequest(request);

      // Transform our request to Aras format
      const arasRequest = this.transformToArasQuoteRequest(request);
      
      const response = await this.makeRequest<any>(
        'POST',
        '/shipment/pricing',
        arasRequest
      );

      // Transform Aras response to our format
      const quotes = this.transformFromArasQuotes(response.prices || []);

      const result: CargoQuoteResponse = {
        success: true,
        provider: CargoServiceProvider.ARAS,
        quotes,
        requestId: response.transactionId,
        timestamp: new Date().toISOString()
      };

      return { success: true, data: result };

    } catch (error: any) {
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Track shipment with Aras Kargo
   */
  async trackShipment(request: TrackingRequest): Promise<CargoServiceResult<CargoTrackingResponse>> {
    try {
      const response = await this.makeRequest<any>(
        'GET',
        `/shipment/track?trackingNumber=${request.trackingNumber}`
      );

      const trackingData = response.trackingData || {};

      const trackingResponse: CargoTrackingResponse = {
        success: true,
        provider: CargoServiceProvider.ARAS,
        trackingNumber: request.trackingNumber,
        status: this.mapArasStatusToOur(trackingData.currentStatus),
        events: this.transformArasEvents(trackingData.movements || []),
        currentLocation: trackingData.currentLocation,
        estimatedDeliveryDate: trackingData.estimatedDelivery,
        actualDeliveryDate: trackingData.deliveredAt,
        timestamp: new Date().toISOString()
      };

      return { success: true, data: trackingResponse };

    } catch (error: any) {
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Create shipment with Aras Kargo
   */
  async createShipment(request: ShipmentCreateRequest): Promise<CargoServiceResult<ShipmentCreateResponse>> {
    try {
      // Transform our request to Aras format
      const arasRequest = this.transformToArasShipmentRequest(request);
      
      const response = await this.makeRequest<any>(
        'POST',
        '/shipment/create',
        arasRequest
      );

      const shipmentResponse = {
        success: true,
        provider: CargoServiceProvider.ARAS,
        shipment: {
          trackingNumber: response.trackingNumber || response.cargoTrackingNumber,
          provider: CargoServiceProvider.ARAS,
          serviceType: request.serviceType,
          status: TrackingStatus.CREATED,
          createdAt: new Date().toISOString(),
          estimatedPickupDate: response.pickupDate,
          estimatedDeliveryDate: response.deliveryDate,
          totalCost: response.totalPrice || 0,
          currency: 'TRY',
          labels: response.waybillUrl ? [{
            format: 'PDF',
            size: 'A4',
            url: response.waybillUrl,
            content: response.waybillBase64
          }] : undefined
        },
        timestamp: new Date().toISOString()
      } as unknown as ShipmentCreateResponse;

      return { success: true, data: shipmentResponse };

    } catch (error: any) {
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Cancel shipment with Aras Kargo
   */
  async cancelShipment(trackingNumber: string): Promise<CargoServiceResult<boolean>> {
    try {
      await this.makeRequest<any>(
        'POST',
        '/shipment/cancel',
        { trackingNumber }
      );

      return { success: true, data: true };

    } catch (error: any) {
      return {
        success: false,
        error: error
      };
    }
  }

  // =============================================================================
  // PRIVATE TRANSFORMATION METHODS
  // =============================================================================

  /**
   * Transform our quote request to Aras format
   */
  private transformToArasQuoteRequest(request: QuoteRequest): any {
    return {
      senderInfo: {
        name: request.fromAddress.fullName,
        phone: request.fromAddress.phone,
        email: request.fromAddress.email,
        cityName: request.fromAddress.city,
        districtName: request.fromAddress.district,
        address: request.fromAddress.address,
        postalCode: request.fromAddress.postalCode
      },
      receiverInfo: {
        name: request.toAddress.fullName,
        phone: request.toAddress.phone,
        email: request.toAddress.email,
        cityName: request.toAddress.city,
        districtName: request.toAddress.district,
        address: request.toAddress.address,
        postalCode: request.toAddress.postalCode
      },
      cargoDetails: {
        pieceCount: request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0),
        totalWeight: request.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
        totalValue: request.packages.reduce((sum, pkg) => sum + pkg.value, 0),
        description: request.packages.map(pkg => pkg.description).join(', '),
        packageDetails: request.packages.map(pkg => ({
          weight: pkg.weight,
          width: pkg.width,
          height: pkg.height,
          length: pkg.length,
          value: pkg.value,
          description: pkg.description,
          quantity: pkg.quantity
        }))
      },
      serviceOptions: {
        serviceType: this.mapOurServiceTypeToAras(request.serviceType),
        insuranceAmount: request.insuranceValue || 0,
        codAmount: request.codAmount || 0,
        pickupDate: request.pickupDate,
        deliveryDate: request.deliveryDate
      },
      specialServices: request.specialServices?.map(service => service.type) || []
    };
  }

  /**
   * Transform Aras quotes to our format
   */
  private transformFromArasQuotes(arasQuotes: any[]): CargoQuote[] {
    return arasQuotes.map(quote => ({
      id: quote.priceId || `aras_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: CargoServiceProvider.ARAS,
      serviceName: quote.serviceName || 'Aras Kargo',
      serviceType: this.mapArasServiceTypeToOur(quote.serviceType),
      price: {
        basePrice: quote.basePrice || 0,
        taxAmount: quote.kdv || 0,
        fuelSurcharge: quote.fuelSurcharge || 0,
        additionalFees: [
          ...(quote.insuranceFee ? [{ name: 'Insurance Fee', amount: quote.insuranceFee }] : []),
          ...(quote.codFee ? [{ name: 'COD Fee', amount: quote.codFee }] : [])
        ],
        totalPrice: quote.totalPrice || 0,
        currency: 'TRY'
      },
      estimatedDeliveryDays: quote.deliveryDays || 1,
      estimatedPickupDate: quote.pickupDate,
      estimatedDeliveryDate: quote.deliveryDate,
      features: [
        {
          name: 'Fast Delivery',
          description: 'Hızlı teslimat',
          included: true
        },
        {
          name: 'SMS & Email Notifications',
          description: 'SMS ve E-posta bildirimleri',
          included: true
        },
        {
          name: 'Online Tracking',
          description: 'Online takip sistemi',
          included: true
        },
        {
          name: 'Insurance Available',
          description: 'Sigorta seçeneği mevcut',
          included: false,
          additionalCost: quote.insuranceFee || 0
        }
      ],
      restrictions: quote.restrictions || [],
      validUntil: quote.validUntil || new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
      trackingCapable: true,
      insuranceIncluded: quote.insuranceIncluded || false,
      codSupported: quote.codSupported !== false
    }));
  }

  /**
   * Transform Aras shipment request
   */
  private transformToArasShipmentRequest(request: ShipmentCreateRequest): any {
    return {
      priceId: request.selectedQuoteId,
      senderInfo: {
        name: request.fromAddress.fullName,
        phone: request.fromAddress.phone,
        email: request.fromAddress.email,
        cityName: request.fromAddress.city,
        districtName: request.fromAddress.district,
        address: request.fromAddress.address,
        postalCode: request.fromAddress.postalCode
      },
      receiverInfo: {
        name: request.toAddress.fullName,
        phone: request.toAddress.phone,
        email: request.toAddress.email,
        cityName: request.toAddress.city,
        districtName: request.toAddress.district,
        address: request.toAddress.address,
        postalCode: request.toAddress.postalCode
      },
      cargoDetails: {
        pieceCount: request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0),
        totalWeight: request.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
        totalValue: request.packages.reduce((sum, pkg) => sum + pkg.value, 0),
        description: request.packages.map(pkg => pkg.description).join(', '),
        packageDetails: request.packages.map(pkg => ({
          weight: pkg.weight,
          width: pkg.width,
          height: pkg.height,
          length: pkg.length,
          value: pkg.value,
          description: pkg.description,
          quantity: pkg.quantity
        }))
      },
      serviceOptions: {
        serviceType: this.mapOurServiceTypeToAras(request.serviceType),
        pickupDate: request.pickupDate,
        specialInstructions: request.specialInstructions
      },
      notifications: {
        smsNotification: request.notifications?.sms || request.fromAddress.phone,
        emailNotification: request.notifications?.email || request.fromAddress.email,
        notifyOnPickup: request.notifications?.notifyOnPickup !== false,
        notifyOnDelivery: request.notifications?.notifyOnDelivery !== false
      },
      references: request.references?.reduce((acc, ref) => {
        acc[ref.type] = ref.value;
        return acc;
      }, {} as any) || {}
    };
  }

  /**
   * Transform Aras tracking events to our format
   */
  private transformArasEvents(arasEvents: any[]): CargoTrackingEvent[] {
    return arasEvents.map(event => ({
      timestamp: event.processTime || event.timestamp,
      status: this.mapArasStatusToOur(event.processType || event.status),
      location: event.processUnitName || event.location || 'Unknown',
      description: event.processDescription || event.description || 'Status updated',
      notes: event.explanation || event.notes
    }));
  }

  /**
   * Map our service type to Aras service type
   */
  private mapOurServiceTypeToAras(serviceType?: CargoServiceType): string {
    const mapping: Record<CargoServiceType, string> = {
      [CargoServiceType.STANDARD]: 'STANDART',
      [CargoServiceType.EXPRESS]: 'EKSPRES',
      [CargoServiceType.OVERNIGHT]: 'HIZLI',
      [CargoServiceType.ECONOMY]: 'EKONOMIK',
      [CargoServiceType.PREMIUM]: 'PREMIUM'
    };
    
    return mapping[serviceType || CargoServiceType.STANDARD] || 'STANDART';
  }

  /**
   * Map Aras service type to our service type
   */
  private mapArasServiceTypeToOur(arasType: string): CargoServiceType {
    const mapping: Record<string, CargoServiceType> = {
      'STANDART': CargoServiceType.STANDARD,
      'EKSPRES': CargoServiceType.EXPRESS,
      'HIZLI': CargoServiceType.OVERNIGHT,
      'EKONOMIK': CargoServiceType.ECONOMY,
      'PREMIUM': CargoServiceType.PREMIUM
    };
    
    return mapping[arasType?.toUpperCase()] || CargoServiceType.STANDARD;
  }

  /**
   * Map Aras status to our tracking status
   */
  private mapArasStatusToOur(arasStatus: string): TrackingStatus {
    const statusMap: Record<string, TrackingStatus> = {
      // Aras specific status mappings
      'KARGO_ALINDI': TrackingStatus.PICKED_UP,
      'TRANSFER_MERKEZI': TrackingStatus.IN_TRANSIT,
      'DAGITIMDA': TrackingStatus.OUT_FOR_DELIVERY,
      'TESLIM_EDILDI': TrackingStatus.DELIVERED,
      'IADE': TrackingStatus.RETURNED,
      'PROBLEM': TrackingStatus.EXCEPTION,
      
      // Generic mappings
      'created': TrackingStatus.CREATED,
      'picked_up': TrackingStatus.PICKED_UP,
      'in_transit': TrackingStatus.IN_TRANSIT,
      'out_for_delivery': TrackingStatus.OUT_FOR_DELIVERY,
      'delivered': TrackingStatus.DELIVERED,
      'exception': TrackingStatus.EXCEPTION,
      'returned': TrackingStatus.RETURNED
    };
    
    return statusMap[arasStatus?.toUpperCase()] || TrackingStatus.CREATED;
  }
}