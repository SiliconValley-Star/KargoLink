import { Address, BaseEntity, BusinessHours, Contact, FileInfo, ID, Money, Status } from './common.types';
import { CarrierSpecialization, User } from './user.types';
import { ServiceType } from './shipment.types';

/**
 * Cargo company types
 */
export type CargoCompanyType = 
  | 'enterprise'        // Büyük kargo şirketleri (Yurtiçi, Aras, MNG, UPS, DHL)
  | 'regional'          // Bölgesel kargo şirketleri
  | 'local'            // Yerel taşıyıcılar
  | 'freelance';       // Bağımsız şoförler

/**
 * Integration types with cargo companies
 */
export type IntegrationType = 
  | 'api'              // API entegrasyonu
  | 'manual'           // Manuel süreç
  | 'hybrid';          // Karma (API + Manuel)

/**
 * Service coverage area
 */
export interface ServiceArea {
  country: string;
  cities: string[];
  regions?: string[];
  postalCodes?: string[];
  isInternational: boolean;
  deliveryDays: number;
  additionalCost?: Money;
}

/**
 * Vehicle information for carriers
 */
export interface Vehicle extends BaseEntity {
  carrierId: ID;
  type: 'motorcycle' | 'van' | 'truck' | 'trailer' | 'refrigerated' | 'other';
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  capacity: {
    weight: number; // kg
    volume: number; // m3
    dimensions: {
      length: number; // cm
      width: number;  // cm
      height: number; // cm
    };
  };
  features: VehicleFeature[];
  insuranceNumber: string;
  insuranceExpiry: string;
  inspectionExpiry: string;
  isActive: boolean;
  images: FileInfo[];
}

/**
 * Vehicle features/capabilities
 */
export type VehicleFeature = 
  | 'refrigerated'      // Soğutmalı
  | 'heated'           // Isıtmalı
  | 'air_suspension'   // Havalı süspansiyon
  | 'tail_lift'        // Hidrolik kapı
  | 'gps_tracking'     // GPS takip
  | 'security_camera'  // Güvenlik kamerası
  | 'temperature_monitoring' // Sıcaklık takibi
  | 'fragile_handling' // Hassas ürün elleçleme
  | 'hazmat_certified'; // Tehlikeli madde sertifikalı

/**
 * Cargo company pricing structure
 */
export interface PricingRule {
  id: ID;
  companyId: ID;
  name: string;
  serviceType: ServiceType;
  specializations: CarrierSpecialization[];
  
  // Geographic scope
  fromCities: string[];
  toCities: string[];
  distance?: {
    min: number; // km
    max: number;
  };
  
  // Weight/Size based pricing
  weightRanges: {
    min: number; // kg
    max: number;
    baseCost: Money;
    additionalCostPerKg?: Money;
  }[];
  
  // Volume based pricing
  volumeRanges?: {
    min: number; // m3
    max: number;
    baseCost: Money;
    additionalCostPerM3?: Money;
  }[];
  
  // Additional costs
  fuelSurcharge?: Money;
  insuranceRate?: number; // percentage of declared value
  
  // Special service costs
  specialServiceCosts: {
    coldChain?: Money;
    fragileHandling?: Money;
    signatureRequired?: Money;
    weekendDelivery?: Money;
    expressDelivery?: Money;
  };
  
  // Time-based modifiers
  deliveryTimeModifiers?: {
    sameDay: number;    // multiplier
    nextDay: number;
    express: number;
  };
  
  // Seasonal modifiers
  seasonalModifiers?: {
    month: number; // 1-12
    modifier: number; // multiplier
  }[];
  
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
}

/**
 * API configuration for enterprise cargo companies
 */
export interface APIConfig {
  companyId: ID;
  endpoint: string;
  authentication: {
    type: 'api_key' | 'oauth' | 'basic' | 'custom';
    credentials: Record<string, string>;
  };
  rateLimits: {
    requestsPerMinute: number;
    dailyQuota: number;
  };
  capabilities: {
    quoteGeneration: boolean;
    shipmentCreation: boolean;
    tracking: boolean;
    labelGeneration: boolean;
    cancellation: boolean;
    rateCalculation: boolean;
  };
  webhooks?: {
    trackingUpdates: string;
    statusChanges: string;
  };
  isActive: boolean;
  lastSyncAt?: string;
  errorCount: number;
  lastErrorAt?: string;
  lastErrorMessage?: string;
}

/**
 * Main cargo company entity
 */
export interface CargoCompany extends BaseEntity {
  // Basic Information
  name: string;
  legalName?: string;
  logo?: FileInfo;
  website?: string;
  description?: string;
  
  // Company Type & Status
  type: CargoCompanyType;
  status: Status;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: ID;
  
  // Contact Information
  contacts: Contact[];
  addresses: Address[];
  headquarters: Address;
  
  // Business Information
  taxNumber: string;
  taxOffice: string;
  tradeRegistryNumber?: string;
  establishmentDate?: string;
  employeeCount?: number;
  
  // Service Information
  specializations: CarrierSpecialization[];
  serviceTypes: ServiceType[];
  serviceAreas: ServiceArea[];
  businessHours: BusinessHours;
  
  // Integration
  integrationType: IntegrationType;
  apiConfig?: APIConfig;
  
  // Fleet (for smaller companies)
  vehicles?: Vehicle[];
  driverCount?: number;
  
  // Pricing
  pricingRules: PricingRule[];
  commissionRate: number; // percentage taken by platform
  
  // Performance Metrics
  rating: number;
  reviewCount: number;
  totalShipments: number;
  onTimeDeliveryRate: number; // percentage
  avgResponseTime: number; // minutes for quotes
  avgTransitTime: number; // days
  
  // Financial
  creditLimit?: Money;
  currentBalance?: Money;
  paymentTerms: number; // days
  
  // Compliance & Certifications
  licenses: FileInfo[];
  certifications: {
    name: string;
    number: string;
    issuedBy: string;
    issuedAt: string;
    expiresAt?: string;
    document?: FileInfo;
  }[];
  
  // Insurance
  insurance: {
    provider: string;
    policyNumber: string;
    coverage: Money;
    expiresAt: string;
    document?: FileInfo;
  };
  
  // Platform Integration
  isActive: boolean;
  joinedAt: string;
  lastActiveAt?: string;
  
  // Agreement
  agreementVersion: string;
  agreementAcceptedAt: string;
  
  // Settlement
  settlementFrequency: 'daily' | 'weekly' | 'monthly';
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    iban: string;
    accountHolder: string;
  };
}

/**
 * Cargo company onboarding request
 */
export interface CargoCompanyOnboardingRequest {
  name: string;
  legalName?: string;
  type: CargoCompanyType;
  website?: string;
  description?: string;
  
  // Contact Information
  contacts: Omit<Contact, 'id'>[];
  headquarters: Omit<Address, 'id'>;
  
  // Business Information
  taxNumber: string;
  taxOffice: string;
  tradeRegistryNumber?: string;
  establishmentDate?: string;
  employeeCount?: number;
  
  // Service Information
  specializations: CarrierSpecialization[];
  serviceTypes: ServiceType[];
  serviceAreas: Omit<ServiceArea, 'id'>[];
  businessHours: BusinessHours;
  
  // Integration Preference
  integrationType: IntegrationType;
  
  // Fleet Information
  vehicleCount?: number;
  driverCount?: number;
  
  // Documents
  documents: {
    type: 'license' | 'certification' | 'insurance' | 'tax_certificate' | 'other';
    name: string;
    file: FileInfo;
  }[];
  
  // Agreement
  agreementAccepted: boolean;
  agreementVersion: string;
}

/**
 * Quote request to cargo company
 */
export interface CargoCompanyQuoteRequest {
  companyId: ID;
  shipmentId: ID;
  
  // Shipment details
  pickupAddress: Address;
  deliveryAddress: Address;
  packages: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    value: Money;
    category: string;
  }[];
  
  serviceType: ServiceType;
  specialServices: string[];
  pickupDate: string;
  deliveryDate?: string;
  
  // Response requirements
  responseDeadline: string;
  requiresInsurance: boolean;
  declaredValue?: Money;
}

/**
 * Performance metrics for cargo companies
 */
export interface CargoCompanyMetrics extends BaseEntity {
  companyId: ID;
  period: {
    startDate: string;
    endDate: string;
  };
  
  // Volume metrics
  totalShipments: number;
  totalRevenue: Money;
  averageShipmentValue: Money;
  
  // Performance metrics
  onTimePickupRate: number;
  onTimeDeliveryRate: number;
  averageTransitTime: number; // hours
  averageResponseTime: number; // minutes
  
  // Quality metrics
  damageRate: number;      // percentage
  lossRate: number;        // percentage
  customerRating: number;   // 1-5 scale
  complaintRate: number;    // percentage
  
  // Operational metrics
  cancellationRate: number; // percentage
  acceptanceRate: number;   // percentage of quotes accepted
  
  // Geographic coverage
  citiesCovered: number;
  internationalShipments: number;
}

/**
 * Cargo company review
 */
export interface CargoCompanyReview extends BaseEntity {
  companyId: ID;
  userId: ID;
  shipmentId: ID;
  
  rating: number; // 1-5
  title?: string;
  comment?: string;
  
  // Specific ratings
  ratings: {
    communication: number;
    punctuality: number;
    handling: number;
    value: number;
  };
  
  // Response from company
  response?: {
    message: string;
    respondedAt: string;
    respondedBy: ID;
  };
  
  isVerified: boolean;
  isPublic: boolean;
  helpfulCount: number;
}