import { Address, BaseEntity, Contact, Dimensions, FileInfo, ID, Money, Status } from './common.types';
import { CarrierSpecialization, User } from './user.types';

/**
 * Shipment status throughout its lifecycle
 */
export type ShipmentStatus = 
  | 'draft'              // Taslak (henüz tamamlanmamış)
  | 'pending_quotes'     // Teklif bekleniyor
  | 'quotes_received'    // Teklifler alındı
  | 'carrier_selected'   // Taşıyıcı seçildi
  | 'payment_pending'    // Ödeme bekleniyor
  | 'payment_completed'  // Ödeme tamamlandı
  | 'pickup_scheduled'   // Alım planlandı
  | 'picked_up'         // Alındı
  | 'in_transit'        // Yolda
  | 'out_for_delivery'  // Dağıtımda
  | 'delivered'         // Teslim edildi
  | 'delivery_failed'   // Teslimat başarısız
  | 'returned'          // İade edildi
  | 'cancelled'         // İptal edildi
  | 'dispute'           // Anlaşmazlık
  | 'refunded';         // İade edildi

/**
 * Package types for different cargo categories
 */
export type PackageType = 
  | 'document'          // Evrak
  | 'package'           // Paket
  | 'pallet'            // Palet
  | 'bulk'              // Dökme yük
  | 'liquid'            // Sıvı
  | 'vehicle'           // Araç taşımacılığı
  | 'furniture'         // Mobilya
  | 'appliance'         // Beyaz eşya
  | 'other';           // Diğer

/**
 * Cargo categories with specific requirements
 */
export type CargoCategory = 
  | 'general'           // Genel kargo
  | 'food'              // Gıda ürünleri
  | 'pharmaceutical'    // İlaç
  | 'electronics'       // Elektronik
  | 'textile'           // Tekstil
  | 'automotive'        // Otomotiv
  | 'construction'      // İnşaat malzemesi
  | 'chemical'          // Kimyasal
  | 'hazardous'         // Tehlikeli madde
  | 'fragile'          // Kırılabilir
  | 'frozen'           // Donmuş ürün
  | 'fresh'            // Taze ürün
  | 'livestock'        // Canlı hayvan
  | 'artwork'          // Sanat eseri
  | 'jewelry'          // Mücevher
  | 'documents';       // Önemli evrak

/**
 * Service types with different priorities
 */
export type ServiceType = 
  | 'standard'         // Standart teslimat (3-5 gün)
  | 'express'          // Hızlı teslimat (1-2 gün)
  | 'same_day'         // Aynı gün teslimat
  | 'next_day'         // Ertesi gün teslimat
  | 'scheduled'        // Randevulu teslimat
  | 'white_glove';     // Beyaz eldiven hizmeti

/**
 * Special service requirements
 */
export interface SpecialServices {
  coldChain: boolean;           // Soğuk zincir
  fragileHandling: boolean;     // Özel elleçleme
  insurance: boolean;           // Sigorta
  signatureRequired: boolean;   // İmzalı teslimat
  ageVerification: boolean;     // Yaş doğrulaması
  weekendDelivery: boolean;     // Hafta sonu teslimat
  appointmentDelivery: boolean; // Randevulu teslimat
  assembly: boolean;            // Kurulum hizmeti
  unpacking: boolean;           // Ambalaj açma
  oldItemRemoval: boolean;      // Eski ürün alma
}

/**
 * Package information
 */
export interface Package {
  id: ID;
  description: string;
  packageType: PackageType;
  category: CargoCategory;
  dimensions: Dimensions;
  value: Money;
  quantity: number;
  barcode?: string;
  serialNumber?: string;
  images?: FileInfo[];
  specialInstructions?: string;
  requiresSpecialHandling: boolean;
}

/**
 * Time preferences for pickup and delivery
 */
export interface TimePreference {
  date: string; // ISO date
  timeSlot?: {
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
  };
  isFlexible: boolean;
  alternatives?: string[]; // Alternative dates
}

/**
 * Quote from carrier
 */
export interface Quote extends BaseEntity {
  id: ID;
  shipmentId: ID;
  carrierId: ID;
  carrier: {
    id: ID;
    name: string;
    rating: number;
    logo?: string;
    isVerified: boolean;
    responseTime: number; // minutes
  };
  
  // Pricing
  baseCost: Money;
  additionalCosts: {
    insurance?: Money;
    fuelSurcharge?: Money;
    specialServices?: Money;
    taxes?: Money;
  };
  totalCost: Money;
  
  // Service details
  serviceType: ServiceType;
  estimatedPickupDate: string;
  estimatedDeliveryDate: string;
  transitDays: number;
  
  // Terms
  termsAndConditions?: string;
  validUntil: string;
  notes?: string;
  
  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  respondedAt?: string;
  
  // Special features
  trackingIncluded: boolean;
  insuranceIncluded: boolean;
  signatureRequired: boolean;
}

/**
 * Shipment tracking event
 */
export interface TrackingEvent extends BaseEntity {
  shipmentId: ID;
  status: ShipmentStatus;
  title: string;
  description: string;
  location?: {
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  timestamp: string;
  images?: FileInfo[];
  signature?: FileInfo;
  contactPerson?: Contact;
  metadata?: Record<string, any>;
}

/**
 * Main shipment entity
 */
export interface Shipment extends BaseEntity {
  // Basic Information
  trackingNumber: string;
  reference?: string; // Customer reference
  
  // Parties
  senderId: ID;
  sender: User;
  recipientId?: ID;
  recipient?: User;
  
  // Addresses
  pickupAddress: Address;
  deliveryAddress: Address;
  
  // Shipment Details
  packages: Package[];
  totalWeight: number;
  totalValue: Money;
  category: CargoCategory;
  serviceType: ServiceType;
  specialServices: SpecialServices;
  
  // Timing
  pickupPreference: TimePreference;
  deliveryPreference: TimePreference;
  estimatedPickupDate?: string;
  estimatedDeliveryDate?: string;
  actualPickupDate?: string;
  actualDeliveryDate?: string;
  
  // Carrier & Quote
  selectedCarrierId?: ID;
  selectedCarrier?: User;
  selectedQuoteId?: ID;
  selectedQuote?: Quote;
  quotes: Quote[];
  
  // Status & Tracking
  status: ShipmentStatus;
  trackingEvents: TrackingEvent[];
  
  // Payment
  totalCost?: Money;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  paidAt?: string;
  
  // Customer Service
  instructions?: string;
  notes?: string;
  customerNotes?: string;
  internalNotes?: string;
  
  // Documents
  invoices: FileInfo[];
  packingList?: FileInfo;
  customsDeclaration?: FileInfo;
  otherDocuments: FileInfo[];
  
  // Insurance & Claims
  insuranceValue?: Money;
  insurancePolicyNumber?: string;
  claimId?: ID;
  
  // Ratings & Reviews
  customerRating?: number;
  carrierRating?: number;
  customerReview?: string;
  carrierReview?: string;
  
  // Cancellation & Returns
  cancellationReason?: string;
  cancelledBy?: ID;
  cancelledAt?: string;
  returnReason?: string;
  returnedAt?: string;
  
  // Compliance
  requiresCustoms: boolean;
  customsValue?: Money;
  commodityCode?: string;
  exportLicense?: string;
}

/**
 * Create shipment request
 */
export interface CreateShipmentRequest {
  reference?: string;
  recipientId?: ID;
  pickupAddress: Partial<Address>;
  deliveryAddress: Partial<Address>;
  packages: Omit<Package, 'id'>[];
  category: CargoCategory;
  serviceType: ServiceType;
  specialServices: Partial<SpecialServices>;
  pickupPreference: TimePreference;
  deliveryPreference: TimePreference;
  instructions?: string;
  requiresCustoms?: boolean;
  customsValue?: Money;
  commodityCode?: string;
}

/**
 * Update shipment request
 */
export interface UpdateShipmentRequest {
  reference?: string;
  packages?: Omit<Package, 'id'>[];
  serviceType?: ServiceType;
  specialServices?: Partial<SpecialServices>;
  pickupPreference?: TimePreference;
  deliveryPreference?: TimePreference;
  instructions?: string;
  customerNotes?: string;
}

/**
 * Shipment search/filter options
 */
export interface ShipmentFilters {
  status?: ShipmentStatus[];
  serviceType?: ServiceType[];
  category?: CargoCategory[];
  carrierId?: ID;
  senderId?: ID;
  recipientId?: ID;
  pickupCity?: string[];
  deliveryCity?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  valueRange?: {
    min: number;
    max: number;
    currency: string;
  };
  trackingNumber?: string;
  reference?: string;
}

/**
 * Shipment statistics
 */
export interface ShipmentStats {
  total: number;
  byStatus: Record<ShipmentStatus, number>;
  byCategory: Record<CargoCategory, number>;
  byServiceType: Record<ServiceType, number>;
  totalValue: Money;
  averageTransitTime: number; // days
  onTimeDeliveryRate: number; // percentage
  customerSatisfaction: number; // average rating
}

/**
 * Delivery attempt
 */
export interface DeliveryAttempt extends BaseEntity {
  shipmentId: ID;
  attemptNumber: number;
  scheduledDate: string;
  actualDate?: string;
  status: 'scheduled' | 'successful' | 'failed' | 'rescheduled';
  failureReason?: string;
  recipientNote?: string;
  carrierNote?: string;
  signature?: FileInfo;
  photos?: FileInfo[];
  location?: {
    latitude: number;
    longitude: number;
  };
  contactAttempts: {
    method: 'phone' | 'email' | 'sms' | 'doorbell';
    timestamp: string;
    successful: boolean;
    note?: string;
  }[];
}

/**
 * Shipment notification
 */
export interface ShipmentNotification extends BaseEntity {
  shipmentId: ID;
  userId: ID;
  type: 'pickup_scheduled' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delivery_failed' | 'delayed';
  title: string;
  message: string;
  channels: ('push' | 'email' | 'sms')[];
  sentAt?: string;
  readAt?: string;
  clickedAt?: string;
}