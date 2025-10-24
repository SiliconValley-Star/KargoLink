import {apiClient, ApiResponse, API_ENDPOINTS} from './client';

// Types
export interface Address {
  name: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface PackageDetails {
  type: string;
  description: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  specialRequirements: string[];
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  senderAddress: Address;
  receiverAddress: Address;
  packageDetails: PackageDetails;
  carrierId: string;
  carrierName: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
}

export interface ShipmentQuote {
  id: string;
  carrierId: string;
  carrierName: string;
  carrierLogo?: string;
  serviceName: string;
  price: number;
  currency: string;
  estimatedDays: number;
  features: string[];
  rating: number;
  isRecommended?: boolean;
}

export interface CreateShipmentRequest {
  senderAddress: Address;
  receiverAddress: Address;
  packageDetails: PackageDetails;
  selectedQuoteId: string;
  notes?: string;
  deliveryPreferences?: {
    timeSlot?: string;
    instructions?: string;
    contactBeforeDelivery?: boolean;
  };
}

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ShipmentTracking {
  shipmentId: string;
  trackingNumber: string;
  currentStatus: string;
  currentLocation?: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
  lastUpdated: string;
}

// Shipment Service Class
class ShipmentService {
  /**
   * Create new shipment
   */
  async createShipment(shipmentData: CreateShipmentRequest): Promise<ApiResponse<Shipment>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SHIPMENTS.CREATE, shipmentData);
      return response.data;
    } catch (error: any) {
      console.error('Shipment oluşturma hatası:', error);
      throw new Error(error.response?.data?.message || 'Gönderi oluşturulamadı');
    }
  }

  /**
   * Get shipment quotes
   */
  async getQuotes(
    senderAddress: Address,
    receiverAddress: Address,
    packageDetails: PackageDetails
  ): Promise<ApiResponse<ShipmentQuote[]>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SHIPMENTS.QUOTES, {
        senderAddress,
        receiverAddress,
        packageDetails,
      });
      return response.data;
    } catch (error: any) {
      console.error('Quote alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Fiyat teklifleri alınamadı');
    }
  }

  /**
   * Get user's shipments with pagination
   */
  async getShipments(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<ApiResponse<{shipments: Shipment[]; total: number; page: number; totalPages: number}>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (status) {
        params.append('status', status);
      }

      const response = await apiClient.get(`${API_ENDPOINTS.SHIPMENTS.LIST}?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Shipment listesi alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Gönderiler listelenemedi');
    }
  }

  /**
   * Get single shipment details
   */
  async getShipment(shipmentId: string): Promise<ApiResponse<Shipment>> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SHIPMENTS.DETAIL(shipmentId));
      return response.data;
    } catch (error: any) {
      console.error('Shipment detayı alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Gönderi detayları alınamadı');
    }
  }

  /**
   * Track shipment
   */
  async trackShipment(shipmentId: string): Promise<ApiResponse<ShipmentTracking>> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SHIPMENTS.TRACK(shipmentId));
      return response.data;
    } catch (error: any) {
      console.error('Tracking hatası:', error);
      throw new Error(error.response?.data?.message || 'Takip bilgileri alınamadı');
    }
  }

  /**
   * Track by tracking number
   */
  async trackByNumber(trackingNumber: string): Promise<ApiResponse<ShipmentTracking>> {
    try {
      const response = await apiClient.get(`/shipments/track-by-number/${trackingNumber}`);
      return response.data;
    } catch (error: any) {
      console.error('Tracking number ile takip hatası:', error);
      throw new Error(error.response?.data?.message || 'Takip numarası ile takip yapılamadı');
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(shipmentId: string, reason?: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SHIPMENTS.CANCEL(shipmentId), {
        reason,
      });
      return response.data;
    } catch (error: any) {
      console.error('Shipment iptal hatası:', error);
      throw new Error(error.response?.data?.message || 'Gönderi iptal edilemedi');
    }
  }

  /**
   * Update shipment
   */
  async updateShipment(
    shipmentId: string,
    updates: Partial<CreateShipmentRequest>
  ): Promise<ApiResponse<Shipment>> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SHIPMENTS.DETAIL(shipmentId), updates);
      return response.data;
    } catch (error: any) {
      console.error('Shipment güncelleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Gönderi güncellenemedi');
    }
  }

  /**
   * Get shipment statistics
   */
  async getShipmentStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    delivered: number;
    cancelled: number;
    totalAmount: number;
    monthlySavings: number;
  }>> {
    try {
      const response = await apiClient.get('/shipments/stats');
      return response.data;
    } catch (error: any) {
      console.error('Shipment istatistik hatası:', error);
      throw new Error(error.response?.data?.message || 'İstatistikler alınamadı');
    }
  }

  /**
   * Search shipments
   */
  async searchShipments(query: string): Promise<ApiResponse<Shipment[]>> {
    try {
      const response = await apiClient.get(`/shipments/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      console.error('Shipment arama hatası:', error);
      throw new Error(error.response?.data?.message || 'Arama yapılamadı');
    }
  }

  /**
   * Get carriers list
   */
  async getCarriers(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    logo?: string;
    isActive: boolean;
    features: string[];
    rating: number;
  }>>> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CARRIERS.LIST);
      return response.data;
    } catch (error: any) {
      console.error('Carriers alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Kargo firmaları listelenemedi');
    }
  }

  /**
   * Calculate shipping rates
   */
  async calculateRates(
    fromCity: string,
    toCity: string,
    weight: number,
    packageType?: string
  ): Promise<ApiResponse<ShipmentQuote[]>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CARRIERS.RATES, {
        fromCity,
        toCity,
        weight,
        packageType,
      });
      return response.data;
    } catch (error: any) {
      console.error('Rate hesaplama hatası:', error);
      throw new Error(error.response?.data?.message || 'Fiyat hesaplanamadı');
    }
  }
}

// Export singleton instance
export const shipmentService = new ShipmentService();
export default shipmentService;