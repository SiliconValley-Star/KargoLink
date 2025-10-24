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

interface YurticiConfig extends CargoServiceConfig {
  provider: CargoServiceProvider.YURTICI;
  customerId?: string;
}

import { BaseCargoService } from './base-cargo.service';

/**
 * Yurtiçi Kargo API Integration
 * Türkiye'nin en yaygın özel kargo şirketlerinden biri
 */
export class YurticiCargoService extends BaseCargoService {
  private readonly customerId: string;

  constructor(config: YurticiConfig) {
    super(config);
    this.customerId = config.customerId || '';
  }

  /**
   * Add Yurtiçi Kargo specific authentication
   */
  protected addAuthentication(config: any): void {
    // Yurtiçi Kargo uses API Key in headers
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Customer-Id': this.customerId
    };
  }

  /**
   * Get quotes from Yurtiçi Kargo
   */
  async getQuotes(request: QuoteRequest): Promise<CargoServiceResult<CargoQuoteResponse>> {
    try {
      this.validateQuoteRequest(request);

      // Transform our request to Yurtiçi format
      const yurticiRequest = this.transformToYurticiQuoteRequest(request);
      
      const response = await this.makeRequest<any>(
        'POST',
        '/api/v1/quotes',
        yurticiRequest
      );

      // Transform Yurtiçi response to our format
      const quotes = this.transformFromYurticiQuotes(response.data || []);

      const result: CargoQuoteResponse = {
        success: true,
        provider: CargoServiceProvider.YURTICI,
        quotes,
        requestId: response.requestId,
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
   * Track shipment with Yurtiçi Kargo
   */
  async trackShipment(request: TrackingRequest): Promise<CargoServiceResult<CargoTrackingResponse>> {
    try {
      const response = await this.makeRequest<any>(
        'GET',
        `/api/v1/tracking/${request.trackingNumber}`
      );

      const trackingResponse: CargoTrackingResponse = {
        success: true,
        provider: CargoServiceProvider.YURTICI,
        trackingNumber: request.trackingNumber,
        status: this.mapYurticiStatusToOur(response.status),
        events: this.transformYurticiEvents(response.events || []),
        currentLocation: response.currentLocation,
        estimatedDeliveryDate: response.estimatedDeliveryDate,
        actualDeliveryDate: response.actualDeliveryDate,
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
   * Create shipment with Yurtiçi Kargo
   */
  async createShipment(request: ShipmentCreateRequest): Promise<CargoServiceResult<ShipmentCreateResponse>> {
    try {
      // Transform our request to Yurtiçi format
      const yurticiRequest = this.transformToYurticiShipmentRequest(request);
      
      const response = await this.makeRequest<any>(
        'POST',
        '/api/v1/shipments',
        yurticiRequest
      );

      const shipmentResponse = {
        success: true,
        provider: CargoServiceProvider.YURTICI,
        shipment: {
          trackingNumber: response.trackingNumber,
          provider: CargoServiceProvider.YURTICI,
          serviceType: request.serviceType,
          status: TrackingStatus.CREATED,
          createdAt: new Date().toISOString(),
          estimatedPickupDate: response.estimatedPickupDate,
          estimatedDeliveryDate: response.estimatedDeliveryDate,
          totalCost: response.totalCost || 0,
          currency: 'TRY',
          labels: response.labels ? [{
            format: 'PDF',
            size: 'A4',
            url: response.labelUrl,
            content: response.labelBase64
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
   * Cancel shipment with Yurtiçi Kargo
   */
  async cancelShipment(trackingNumber: string): Promise<CargoServiceResult<boolean>> {
    try {
      await this.makeRequest<any>(
        'DELETE',
        `/api/v1/shipments/${trackingNumber}`
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
   * Transform our quote request to Yurtiçi format
   */
  private transformToYurticiQuoteRequest(request: QuoteRequest): any {
    return {
      sender: {
        name: request.fromAddress.fullName,
        phone: request.fromAddress.phone,
        email: request.fromAddress.email,
        address: {
          country: request.fromAddress.country,
          city: request.fromAddress.city,
          district: request.fromAddress.district,
          neighborhood: request.fromAddress.neighborhood,
          postalCode: request.fromAddress.postalCode,
          addressLine: request.fromAddress.address
        }
      },
      receiver: {
        name: request.toAddress.fullName,
        phone: request.toAddress.phone,
        email: request.toAddress.email,
        address: {
          country: request.toAddress.country,
          city: request.toAddress.city,
          district: request.toAddress.district,
          neighborhood: request.toAddress.neighborhood,
          postalCode: request.toAddress.postalCode,
          addressLine: request.toAddress.address
        }
      },
      packages: request.packages.map(pkg => ({
        weight: pkg.weight,
        dimensions: {
          width: pkg.width,
          height: pkg.height,
          length: pkg.length
        },
        value: pkg.value,
        description: pkg.description,
        quantity: pkg.quantity
      })),
      serviceType: this.mapOurServiceTypeToYurtici(request.serviceType),
      pickupDate: request.pickupDate,
      deliveryDate: request.deliveryDate,
      insuranceValue: request.insuranceValue,
      codAmount: request.codAmount,
      specialServices: request.specialServices?.map(service => ({
        type: service.type,
        value: service.value
      }))
    };
  }

  /**
   * Transform Yurtiçi quotes to our format
   */
  private transformFromYurticiQuotes(yurticiQuotes: any[]): CargoQuote[] {
    return yurticiQuotes.map(quote => ({
      id: quote.id || `yurtici_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: CargoServiceProvider.YURTICI,
      serviceName: quote.serviceName || 'Yurtiçi Kargo',
      serviceType: this.mapYurticiServiceTypeToOur(quote.serviceType),
      price: {
        basePrice: quote.price?.baseAmount || 0,
        taxAmount: quote.price?.taxAmount || 0,
        fuelSurcharge: quote.price?.fuelSurcharge,
        additionalFees: quote.price?.additionalFees || [],
        totalPrice: quote.price?.totalAmount || 0,
        currency: 'TRY'
      },
      estimatedDeliveryDays: quote.estimatedDeliveryDays || 1,
      estimatedPickupDate: quote.estimatedPickupDate,
      estimatedDeliveryDate: quote.estimatedDeliveryDate,
      features: [
        {
          name: 'Door-to-Door Delivery',
          description: 'Kapıdan kapıya teslimat',
          included: true
        },
        {
          name: 'SMS Notification',
          description: 'SMS bildirimleri',
          included: true
        },
        {
          name: 'Online Tracking',
          description: 'Online takip',
          included: true
        }
      ],
      restrictions: quote.restrictions || [],
      validUntil: quote.validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      trackingCapable: true,
      insuranceIncluded: quote.insuranceIncluded || false,
      codSupported: quote.codSupported || true
    }));
  }

  /**
   * Transform Yurtiçi shipment request
   */
  private transformToYurticiShipmentRequest(request: ShipmentCreateRequest): any {
    return {
      quoteId: request.selectedQuoteId,
      sender: {
        name: request.fromAddress.fullName,
        phone: request.fromAddress.phone,
        email: request.fromAddress.email,
        address: {
          country: request.fromAddress.country,
          city: request.fromAddress.city,
          district: request.fromAddress.district,
          neighborhood: request.fromAddress.neighborhood,
          postalCode: request.fromAddress.postalCode,
          addressLine: request.fromAddress.address
        }
      },
      receiver: {
        name: request.toAddress.fullName,
        phone: request.toAddress.phone,
        email: request.toAddress.email,
        address: {
          country: request.toAddress.country,
          city: request.toAddress.city,
          district: request.toAddress.district,
          neighborhood: request.toAddress.neighborhood,
          postalCode: request.toAddress.postalCode,
          addressLine: request.toAddress.address
        }
      },
      packages: request.packages.map(pkg => ({
        weight: pkg.weight,
        dimensions: {
          width: pkg.width,
          height: pkg.height,
          length: pkg.length
        },
        value: pkg.value,
        description: pkg.description,
        quantity: pkg.quantity
      })),
      serviceType: this.mapOurServiceTypeToYurtici(request.serviceType),
      pickupDate: request.pickupDate,
      specialInstructions: request.specialInstructions,
      references: request.references,
      notifications: request.notifications
    };
  }

  /**
   * Transform Yurtiçi tracking events to our format
   */
  private transformYurticiEvents(yurticiEvents: any[]): CargoTrackingEvent[] {
    return yurticiEvents.map(event => ({
      timestamp: event.timestamp,
      status: this.mapYurticiStatusToOur(event.status),
      location: event.location || 'Unknown',
      description: event.description || 'Status updated',
      notes: event.notes
    }));
  }

  /**
   * Map our service type to Yurtiçi service type
   */
  private mapOurServiceTypeToYurtici(serviceType?: CargoServiceType): string {
    const mapping: Record<CargoServiceType, string> = {
      [CargoServiceType.STANDARD]: 'standard',
      [CargoServiceType.EXPRESS]: 'express',
      [CargoServiceType.OVERNIGHT]: 'overnight',
      [CargoServiceType.ECONOMY]: 'economy',
      [CargoServiceType.PREMIUM]: 'premium'
    };
    
    return mapping[serviceType || CargoServiceType.STANDARD] || 'standard';
  }

  /**
   * Map Yurtiçi service type to our service type
   */
  private mapYurticiServiceTypeToOur(yurticiType: string): CargoServiceType {
    const mapping: Record<string, CargoServiceType> = {
      'standard': CargoServiceType.STANDARD,
      'express': CargoServiceType.EXPRESS,
      'overnight': CargoServiceType.OVERNIGHT,
      'economy': CargoServiceType.ECONOMY,
      'premium': CargoServiceType.PREMIUM
    };
    
    return mapping[yurticiType?.toLowerCase()] || CargoServiceType.STANDARD;
  }

  /**
   * Map Yurtiçi status to our tracking status
   */
  private mapYurticiStatusToOur(yurticiStatus: string): TrackingStatus {
    const mapping: Record<string, TrackingStatus> = {
      'created': TrackingStatus.CREATED,
      'picked_up': TrackingStatus.PICKED_UP,
      'in_transit': TrackingStatus.IN_TRANSIT,
      'out_for_delivery': TrackingStatus.OUT_FOR_DELIVERY,
      'delivered': TrackingStatus.DELIVERED,
      'exception': TrackingStatus.EXCEPTION,
      'returned': TrackingStatus.RETURNED
    };
    
    return mapping[yurticiStatus?.toLowerCase()] || TrackingStatus.CREATED;
  }
}