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

interface MngConfig extends CargoServiceConfig {
  provider: CargoServiceProvider.MNG;
  customerId?: string;
}
import { BaseCargoService } from './base-cargo.service';

/**
 * MNG Kargo API Integration
 * Yurtiçi ve yurtdışı taşımacılık hizmeti sunar
 */
export class MngCargoService extends BaseCargoService {
  private readonly customerId: string;

  constructor(config: MngConfig) {
    super(config);
    this.customerId = config.customerId || '';
  }

  /**
   * Add MNG Kargo specific authentication
   */
  protected addAuthentication(config: any): void {
    // MNG Kargo uses Basic Auth + Customer ID
    const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
    
    config.headers = {
      ...config.headers,
      'Authorization': `Basic ${credentials}`,
      'X-Customer-Code': this.customerId,
      'X-API-Key': this.config.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get quotes from MNG Kargo
   */
  async getQuotes(request: QuoteRequest): Promise<CargoServiceResult<CargoQuoteResponse>> {
    try {
      this.validateQuoteRequest(request);

      // Transform our request to MNG format
      const mngRequest = this.transformToMngQuoteRequest(request);
      
      const response = await this.makeRequest<any>(
        'POST',
        '/api/pricing/calculate',
        mngRequest
      );

      // Transform MNG response to our format
      const quotes = this.transformFromMngQuotes(response.result?.priceList || []);

      const result: CargoQuoteResponse = {
        success: true,
        provider: CargoServiceProvider.MNG,
        quotes,
        requestId: response.requestId || response.transactionId,
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
   * Track shipment with MNG Kargo
   */
  async trackShipment(request: TrackingRequest): Promise<CargoServiceResult<CargoTrackingResponse>> {
    try {
      const response = await this.makeRequest<any>(
        'POST',
        '/api/tracking/query',
        {
          trackingNumber: request.trackingNumber,
          language: 'tr'
        }
      );

      const trackingData = response.result || {};

      const trackingResponse: CargoTrackingResponse = {
        success: true,
        provider: CargoServiceProvider.MNG,
        trackingNumber: request.trackingNumber,
        status: this.mapMngStatusToOur(trackingData.lastStatus?.statusCode),
        events: this.transformMngEvents(trackingData.statusHistory || []),
        currentLocation: trackingData.currentLocation?.name,
        estimatedDeliveryDate: trackingData.estimatedDeliveryDate,
        actualDeliveryDate: trackingData.deliveryDate,
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
   * Create shipment with MNG Kargo
   */
  async createShipment(request: ShipmentCreateRequest): Promise<CargoServiceResult<ShipmentCreateResponse>> {
    try {
      // Transform our request to MNG format
      const mngRequest = this.transformToMngShipmentRequest(request);
      
      const response = await this.makeRequest<any>(
        'POST',
        '/api/shipment/create',
        mngRequest
      );

      const shipmentData = response.result || {};

      const shipmentResponse = {
        success: true,
        provider: CargoServiceProvider.MNG,
        shipment: {
          trackingNumber: shipmentData.trackingNumber || shipmentData.referenceNumber,
          provider: CargoServiceProvider.MNG,
          serviceType: request.serviceType,
          status: TrackingStatus.CREATED,
          createdAt: new Date().toISOString(),
          estimatedPickupDate: shipmentData.estimatedPickupDate,
          estimatedDeliveryDate: shipmentData.estimatedDeliveryDate,
          totalCost: shipmentData.totalAmount || 0,
          currency: 'TRY',
          labels: shipmentData.labelData ? [{
            format: 'PDF',
            size: 'A4',
            url: shipmentData.labelUrl,
            content: shipmentData.labelData
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
   * Cancel shipment with MNG Kargo
   */
  async cancelShipment(trackingNumber: string): Promise<CargoServiceResult<boolean>> {
    try {
      await this.makeRequest<any>(
        'POST',
        '/api/shipment/cancel',
        { 
          trackingNumber,
          reason: 'Customer request'
        }
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
   * Transform our quote request to MNG format
   */
  private transformToMngQuoteRequest(request: QuoteRequest): any {
    return {
      origin: {
        name: request.fromAddress.fullName,
        phone: request.fromAddress.phone,
        email: request.fromAddress.email,
        city: request.fromAddress.city,
        district: request.fromAddress.district,
        address: request.fromAddress.address,
        postalCode: request.fromAddress.postalCode,
        country: request.fromAddress.country || 'TR'
      },
      destination: {
        name: request.toAddress.fullName,
        phone: request.toAddress.phone,
        email: request.toAddress.email,
        city: request.toAddress.city,
        district: request.toAddress.district,
        address: request.toAddress.address,
        postalCode: request.toAddress.postalCode,
        country: request.toAddress.country || 'TR'
      },
      shipmentDetails: {
        packageCount: request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0),
        totalWeight: request.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
        totalVolume: this.calculateTotalVolume(request.packages),
        declaredValue: request.packages.reduce((sum, pkg) => sum + pkg.value, 0),
        contentDescription: request.packages.map(pkg => pkg.description).join(', '),
        packages: request.packages.map((pkg, index) => ({
          id: index + 1,
          weight: pkg.weight,
          dimensions: {
            length: pkg.length,
            width: pkg.width,
            height: pkg.height
          },
          value: pkg.value,
          description: pkg.description,
          quantity: pkg.quantity
        }))
      },
      serviceOptions: {
        serviceType: this.mapOurServiceTypeToMng(request.serviceType),
        insuranceRequired: (request.insuranceValue || 0) > 0,
        insuranceAmount: request.insuranceValue || 0,
        codRequired: (request.codAmount || 0) > 0,
        codAmount: request.codAmount || 0,
        pickupDate: request.pickupDate,
        deliveryDate: request.deliveryDate
      },
      additionalServices: this.mapSpecialServices(request.specialServices || [])
    };
  }

  /**
   * Transform MNG quotes to our format
   */
  private transformFromMngQuotes(mngQuotes: any[]): CargoQuote[] {
    return mngQuotes.map(quote => ({
      id: quote.quoteId || `mng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: CargoServiceProvider.MNG,
      serviceName: quote.serviceName || 'MNG Kargo',
      serviceType: this.mapMngServiceTypeToOur(quote.serviceCode),
      price: {
        basePrice: quote.basePrice || 0,
        taxAmount: quote.taxAmount || (quote.basePrice * 0.18) || 0,
        fuelSurcharge: quote.fuelSurcharge || 0,
        additionalFees: [
          ...(quote.insuranceFee ? [{ name: 'Insurance Fee', amount: quote.insuranceFee }] : []),
          ...(quote.codFee ? [{ name: 'COD Fee', amount: quote.codFee }] : []),
          ...(quote.deliveryFee ? [{ name: 'Delivery Fee', amount: quote.deliveryFee }] : [])
        ],
        totalPrice: quote.totalPrice || 0,
        currency: 'TRY'
      },
      estimatedDeliveryDays: quote.transitDays || 1,
      estimatedPickupDate: quote.pickupDate,
      estimatedDeliveryDate: quote.deliveryDate,
      features: [
        {
          name: 'Nationwide Coverage',
          description: 'Türkiye geneli kapsama alanı',
          included: true
        },
        {
          name: 'International Service',
          description: 'Uluslararası gönderim imkanı',
          included: quote.internationalCapable || false
        },
        {
          name: 'Real-time Tracking',
          description: 'Gerçek zamanlı takip',
          included: true
        },
        {
          name: 'SMS Notifications',
          description: 'SMS bildirimleri',
          included: true
        },
        {
          name: 'Insurance Protection',
          description: 'Sigorta koruması',
          included: false,
          additionalCost: quote.insuranceFee || 0
        }
      ],
      restrictions: quote.restrictions || [],
      validUntil: quote.validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      trackingCapable: true,
      insuranceIncluded: quote.insuranceIncluded || false,
      codSupported: quote.codSupported !== false
    }));
  }

  /**
   * Transform MNG shipment request
   */
  private transformToMngShipmentRequest(request: ShipmentCreateRequest): any {
    return {
      quoteId: request.selectedQuoteId,
      origin: {
        name: request.fromAddress.fullName,
        phone: request.fromAddress.phone,
        email: request.fromAddress.email,
        city: request.fromAddress.city,
        district: request.fromAddress.district,
        address: request.fromAddress.address,
        postalCode: request.fromAddress.postalCode,
        country: request.fromAddress.country || 'TR'
      },
      destination: {
        name: request.toAddress.fullName,
        phone: request.toAddress.phone,
        email: request.toAddress.email,
        city: request.toAddress.city,
        district: request.toAddress.district,
        address: request.toAddress.address,
        postalCode: request.toAddress.postalCode,
        country: request.toAddress.country || 'TR'
      },
      shipmentDetails: {
        packageCount: request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0),
        totalWeight: request.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
        totalVolume: this.calculateTotalVolume(request.packages),
        declaredValue: request.packages.reduce((sum, pkg) => sum + pkg.value, 0),
        contentDescription: request.packages.map(pkg => pkg.description).join(', '),
        packages: request.packages.map((pkg, index) => ({
          id: index + 1,
          weight: pkg.weight,
          dimensions: {
            length: pkg.length,
            width: pkg.width,
            height: pkg.height
          },
          value: pkg.value,
          description: pkg.description,
          quantity: pkg.quantity
        }))
      },
      serviceOptions: {
        serviceType: this.mapOurServiceTypeToMng(request.serviceType),
        pickupDate: request.pickupDate,
        specialInstructions: request.specialInstructions
      },
      notifications: {
        smsNotification: request.notifications?.sms || request.fromAddress.phone,
        emailNotification: request.notifications?.email || request.fromAddress.email,
        notifyOnPickup: request.notifications?.notifyOnPickup !== false,
        notifyOnDelivery: request.notifications?.notifyOnDelivery !== false,
        notifyOnException: request.notifications?.notifyOnException !== false
      },
      customerReferences: request.references?.reduce((acc, ref) => {
        acc[`${ref.type}Reference`] = ref.value;
        return acc;
      }, {} as any) || {}
    };
  }

  /**
   * Transform MNG tracking events to our format
   */
  private transformMngEvents(mngEvents: any[]): CargoTrackingEvent[] {
    return mngEvents.map(event => ({
      timestamp: event.eventDate || event.timestamp,
      status: this.mapMngStatusToOur(event.statusCode || event.status),
      location: event.locationName || event.location || 'Unknown',
      description: event.statusDescription || event.description || 'Status updated',
      notes: event.remarks || event.notes
    }));
  }

  /**
   * Calculate total volume of packages
   */
  private calculateTotalVolume(packages: any[]): number {
    return packages.reduce((total, pkg) => {
      return total + (pkg.width * pkg.height * pkg.length * pkg.quantity);
    }, 0);
  }

  /**
   * Map special services to MNG format
   */
  private mapSpecialServices(services: any[]): string[] {
    const serviceMapping: Record<string, string> = {
      'insurance': 'INSURANCE',
      'cod': 'COD',
      'signature': 'SIGNATURE_REQUIRED',
      'weekend_delivery': 'WEEKEND_DELIVERY',
      'priority': 'PRIORITY_HANDLING'
    };

    return services
      .map(service => serviceMapping[service.type])
      .filter((service): service is string => Boolean(service));
  }

  /**
   * Map our service type to MNG service type
   */
  private mapOurServiceTypeToMng(serviceType?: CargoServiceType): string {
    const mapping: Record<CargoServiceType, string> = {
      [CargoServiceType.STANDARD]: 'STANDART',
      [CargoServiceType.EXPRESS]: 'EXPRESS',
      [CargoServiceType.OVERNIGHT]: 'OVERNIGHT',
      [CargoServiceType.ECONOMY]: 'EKONOMI',
      [CargoServiceType.PREMIUM]: 'PREMIUM'
    };
    
    return mapping[serviceType || CargoServiceType.STANDARD] || 'STANDART';
  }

  /**
   * Map MNG service type to our service type
   */
  private mapMngServiceTypeToOur(mngType: string): CargoServiceType {
    const mapping: Record<string, CargoServiceType> = {
      'STANDART': CargoServiceType.STANDARD,
      'EXPRESS': CargoServiceType.EXPRESS,
      'OVERNIGHT': CargoServiceType.OVERNIGHT,
      'EKONOMI': CargoServiceType.ECONOMY,
      'PREMIUM': CargoServiceType.PREMIUM
    };
    
    return mapping[mngType?.toUpperCase()] || CargoServiceType.STANDARD;
  }

  /**
   * Map MNG status to our tracking status
   */
  private mapMngStatusToOur(mngStatus: string | number): TrackingStatus {
    // MNG uses numeric status codes
    const numericStatusMap: Record<number, TrackingStatus> = {
      1: TrackingStatus.CREATED,
      2: TrackingStatus.PICKED_UP,
      3: TrackingStatus.IN_TRANSIT,
      4: TrackingStatus.IN_TRANSIT,
      5: TrackingStatus.OUT_FOR_DELIVERY,
      6: TrackingStatus.DELIVERED,
      7: TrackingStatus.EXCEPTION,
      8: TrackingStatus.RETURNED,
      9: TrackingStatus.EXCEPTION
    };

    const stringStatusMap: Record<string, TrackingStatus> = {
      'CREATED': TrackingStatus.CREATED,
      'PICKED_UP': TrackingStatus.PICKED_UP,
      'IN_TRANSIT': TrackingStatus.IN_TRANSIT,
      'OUT_FOR_DELIVERY': TrackingStatus.OUT_FOR_DELIVERY,
      'DELIVERED': TrackingStatus.DELIVERED,
      'EXCEPTION': TrackingStatus.EXCEPTION,
      'RETURNED': TrackingStatus.RETURNED,
      'KARGO_ALINDI': TrackingStatus.PICKED_UP,
      'YOLDA': TrackingStatus.IN_TRANSIT,
      'DAGITIMDA': TrackingStatus.OUT_FOR_DELIVERY,
      'TESLIM_EDILDI': TrackingStatus.DELIVERED
    };

    if (typeof mngStatus === 'number') {
      return numericStatusMap[mngStatus] || TrackingStatus.CREATED;
    }

    return stringStatusMap[mngStatus?.toUpperCase()] || TrackingStatus.CREATED;
  }
}