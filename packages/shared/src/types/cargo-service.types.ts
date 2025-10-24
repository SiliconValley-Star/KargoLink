/**
 * Cargo Service Integration Types
 * Base interfaces and types for cargo company API integrations
 */

// =============================================================================
// ENUMS
// =============================================================================

export enum CargoServiceProvider {
  // Turkish Cargo Companies
  PTT = 'ptt',                    // PTT Kargo – Devlet destekli, geniş dağıtım ağı
  YURTICI = 'yurtici',           // Yurtiçi Kargo – Türkiye'nin en yaygın özel kargo şirketlerinden
  ARAS = 'aras',                 // Aras Kargo – Hızlı ve yaygın hizmet ağı
  MNG = 'mng',                   // MNG Kargo – Yurtiçi ve yurtdışı taşımacılık hizmeti
  SURAT = 'surat',               // Sürat Kargo – Hızlı teslimat odaklı
  
  // International Cargo Companies in Turkey
  UPS = 'ups',                   // UPS Türkiye – Uluslararası bağlantıları güçlü
  DHL = 'dhl',                   // DHL Türkiye – Uluslararası kargo ve ekspres gönderi
  FEDEX = 'fedex',               // FedEx Türkiye – Hızlı ve güvenilir uluslararası kargo
  TNT = 'tnt',                   // TNT Express Türkiye – Özellikle iş kargoları için tercih edilir
  CEVA = 'ceva',                 // CEVA Lojistik Türkiye – Büyük lojistik ve taşımacılık çözümleri
  
  // Global Cargo Companies
  TNT_EXPRESS = 'tnt_express',   // TNT Express – Hollanda merkezli, Avrupa ve global taşımacılık
  SF_EXPRESS = 'sf_express',     // SF Express – Çin merkezli, Asya pazarında güçlü
  DB_SCHENKER = 'db_schenker',   // DB Schenker – Almanya merkezli, lojistik ve taşımacılık
  MAERSK = 'maersk',             // Maersk Logistics – Danimarka merkezli, deniz taşımacılığı
  JAPAN_POST = 'japan_post',     // Japan Post / Yamato Transport – Japonya merkezli
  ROYAL_MAIL = 'royal_mail',     // Royal Mail / Parcelforce – İngiltere merkezli
  HERMES = 'hermes',             // Hermes – Almanya merkezli, Avrupa odaklı kargo
  DPKG = 'dpkg',                 // DPD Germany – Avrupa çapında kargo hizmetleri
  CHRONOPOST = 'chronopost',     // Chronopost – Fransa merkezli ekspres kargo
  CORREOS = 'correos'            // Correos – İspanya posta hizmeti
}

export enum CargoServiceType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  ECONOMY = 'economy',
  PREMIUM = 'premium'
}

export enum CargoPackageType {
  DOCUMENT = 'document',
  PACKAGE = 'package',
  ENVELOPE = 'envelope',
  BOX = 'box',
  TUBE = 'tube',
  PAK = 'pak'
}

// =============================================================================
// BASE INTERFACES
// =============================================================================

export interface CargoAddress {
  country: string;
  city: string;
  district: string;
  neighborhood?: string;
  postalCode: string;
  address: string;
  fullName: string;
  phone: string;
  email?: string;
}

export interface CargoPackage {
  width: number; // cm
  height: number; // cm
  length: number; // cm
  weight: number; // kg
  value: number; // TL
  description: string;
  type: CargoPackageType;
  quantity: number;
}

export interface QuoteRequest {
  fromAddress: CargoAddress;
  toAddress: CargoAddress;
  packages: CargoPackage[];
  serviceType?: CargoServiceType;
  pickupDate?: string; // ISO date string
  deliveryDate?: string; // ISO date string
  specialServices?: SpecialService[];
  insuranceValue?: number; // TL
  codAmount?: number; // Cash on Delivery amount
}

export interface SpecialService {
  type: 'insurance' | 'cod' | 'signature' | 'weekend_delivery' | 'priority';
  value?: number;
  description?: string;
}

// =============================================================================
// QUOTE RESPONSE INTERFACES
// =============================================================================

export interface CargoQuoteResponse {
  success: boolean;
  provider: CargoServiceProvider;
  quotes: CargoQuote[];
  error?: string;
  requestId?: string;
  timestamp: string;
}

export interface CargoQuote {
  id: string;
  provider: CargoServiceProvider;
  serviceName: string;
  serviceType: CargoServiceType;
  price: Price;
  estimatedDeliveryDays: number;
  estimatedPickupDate?: string;
  estimatedDeliveryDate?: string;
  features: CargoQuoteFeature[];
  restrictions?: string[];
  validUntil: string; // ISO date string
  trackingCapable: boolean;
  insuranceIncluded: boolean;
  codSupported: boolean;
}

export interface Price {
  basePrice: number; // TL
  taxAmount: number; // KDV
  fuelSurcharge?: number;
  additionalFees: AdditionalFee[];
  totalPrice: number; // Final price in TL
  currency: 'TRY';
}

export interface AdditionalFee {
  name: string;
  amount: number;
  description?: string;
}

export interface CargoQuoteFeature {
  name: string;
  description: string;
  included: boolean;
  additionalCost?: number;
}

// =============================================================================
// TRACKING INTERFACES
// =============================================================================

export interface TrackingRequest {
  trackingNumber: string;
  provider: CargoServiceProvider;
}

export interface CargoTrackingResponse {
  success: boolean;
  provider: CargoServiceProvider;
  trackingNumber: string;
  status: TrackingStatus;
  events: CargoTrackingEvent[];
  currentLocation?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  error?: string;
  timestamp: string;
}

export enum TrackingStatus {
  CREATED = 'created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  RETURNED = 'returned'
}

export interface CargoTrackingEvent {
  timestamp: string;
  status: TrackingStatus;
  location: string;
  description: string;
  notes?: string;
}

// =============================================================================
// SHIPMENT CREATION INTERFACES
// =============================================================================

export interface ShipmentCreateRequest {
  fromAddress: CargoAddress;
  toAddress: CargoAddress;
  packages: CargoPackage[];
  serviceType: CargoServiceType;
  selectedQuoteId: string;
  pickupDate?: string;
  specialInstructions?: string;
  references?: ShipmentReference[];
  notifications?: NotificationPreferences;
}

export interface ShipmentReference {
  type: 'invoice' | 'po' | 'customer' | 'internal';
  value: string;
}

export interface NotificationPreferences {
  email?: string;
  sms?: string;
  notifyOnPickup: boolean;
  notifyOnDelivery: boolean;
  notifyOnException: boolean;
}

export interface ShipmentCreateResponse {
  success: boolean;
  provider: CargoServiceProvider;
  shipment?: CreatedShipment;
  error?: string;
  timestamp: string;
}

export interface CreatedShipment {
  trackingNumber: string;
  provider: CargoServiceProvider;
  serviceType: CargoServiceType;
  status: TrackingStatus;
  createdAt: string;
  estimatedPickupDate?: string;
  estimatedDeliveryDate?: string;
  totalCost: number;
  currency: 'TRY';
  labels?: ShipmentLabel[];
}

export interface ShipmentLabel {
  format: 'PDF' | 'PNG' | 'ZPL';
  size: 'A4' | '4x6' | '6x8';
  url?: string;
  content?: string; // Base64 encoded
}

// =============================================================================
// SERVICE CONFIGURATION
// =============================================================================

export interface CargoServiceConfig {
  provider: CargoServiceProvider;
  name: string;
  apiEndpoint: string;
  apiKey: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  sandbox: boolean;
  enabled: boolean;
  supportedServices: CargoServiceType[];
  supportedCountries: string[];
  maxWeight: number; // kg
  maxDimensions: {
    width: number;
    height: number;
    length: number;
  };
  features: {
    tracking: boolean;
    insurance: boolean;
    cod: boolean; // Cash on Delivery
    signature: boolean;
    weekendDelivery: boolean;
  };
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

// =============================================================================
// ERROR INTERFACES
// =============================================================================

export interface CargoServiceError {
  code: string;
  message: string;
  provider: CargoServiceProvider;
  originalError?: any;
  retryable: boolean;
  timestamp: string;
}

export enum CargoErrorCode {
  // Connection errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  
  // Validation errors
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  UNSUPPORTED_SERVICE = 'UNSUPPORTED_SERVICE',
  PACKAGE_TOO_HEAVY = 'PACKAGE_TOO_HEAVY',
  PACKAGE_TOO_LARGE = 'PACKAGE_TOO_LARGE',
  
  // Business logic errors
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NO_QUOTES_AVAILABLE = 'NO_QUOTES_AVAILABLE',
  QUOTE_EXPIRED = 'QUOTE_EXPIRED',
  
  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PARSING_ERROR = 'PARSING_ERROR'
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type CargoServiceResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: CargoServiceError;
};

// Provider-specific configuration types
export interface YurticiConfig extends CargoServiceConfig {
  provider: CargoServiceProvider.YURTICI;
  customerId?: string;
}

export interface ArasConfig extends CargoServiceConfig {
  provider: CargoServiceProvider.ARAS;
  merchantId?: string;
}

export interface MngConfig extends CargoServiceConfig {
  provider: CargoServiceProvider.MNG;
  customerId?: string;
}