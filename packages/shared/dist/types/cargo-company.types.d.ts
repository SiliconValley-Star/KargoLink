import { Address, BaseEntity, BusinessHours, Contact, FileInfo, ID, Money, Status } from './common.types';
import { CarrierSpecialization } from './user.types';
import { ServiceType } from './shipment.types';
export type CargoCompanyType = 'enterprise' | 'regional' | 'local' | 'freelance';
export type IntegrationType = 'api' | 'manual' | 'hybrid';
export interface ServiceArea {
    country: string;
    cities: string[];
    regions?: string[];
    postalCodes?: string[];
    isInternational: boolean;
    deliveryDays: number;
    additionalCost?: Money;
}
export interface Vehicle extends BaseEntity {
    carrierId: ID;
    type: 'motorcycle' | 'van' | 'truck' | 'trailer' | 'refrigerated' | 'other';
    brand: string;
    model: string;
    year: number;
    plateNumber: string;
    capacity: {
        weight: number;
        volume: number;
        dimensions: {
            length: number;
            width: number;
            height: number;
        };
    };
    features: VehicleFeature[];
    insuranceNumber: string;
    insuranceExpiry: string;
    inspectionExpiry: string;
    isActive: boolean;
    images: FileInfo[];
}
export type VehicleFeature = 'refrigerated' | 'heated' | 'air_suspension' | 'tail_lift' | 'gps_tracking' | 'security_camera' | 'temperature_monitoring' | 'fragile_handling' | 'hazmat_certified';
export interface PricingRule {
    id: ID;
    companyId: ID;
    name: string;
    serviceType: ServiceType;
    specializations: CarrierSpecialization[];
    fromCities: string[];
    toCities: string[];
    distance?: {
        min: number;
        max: number;
    };
    weightRanges: {
        min: number;
        max: number;
        baseCost: Money;
        additionalCostPerKg?: Money;
    }[];
    volumeRanges?: {
        min: number;
        max: number;
        baseCost: Money;
        additionalCostPerM3?: Money;
    }[];
    fuelSurcharge?: Money;
    insuranceRate?: number;
    specialServiceCosts: {
        coldChain?: Money;
        fragileHandling?: Money;
        signatureRequired?: Money;
        weekendDelivery?: Money;
        expressDelivery?: Money;
    };
    deliveryTimeModifiers?: {
        sameDay: number;
        nextDay: number;
        express: number;
    };
    seasonalModifiers?: {
        month: number;
        modifier: number;
    }[];
    isActive: boolean;
    validFrom: string;
    validUntil?: string;
}
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
export interface CargoCompany extends BaseEntity {
    name: string;
    legalName?: string;
    logo?: FileInfo;
    website?: string;
    description?: string;
    type: CargoCompanyType;
    status: Status;
    isVerified: boolean;
    verifiedAt?: string;
    verifiedBy?: ID;
    contacts: Contact[];
    addresses: Address[];
    headquarters: Address;
    taxNumber: string;
    taxOffice: string;
    tradeRegistryNumber?: string;
    establishmentDate?: string;
    employeeCount?: number;
    specializations: CarrierSpecialization[];
    serviceTypes: ServiceType[];
    serviceAreas: ServiceArea[];
    businessHours: BusinessHours;
    integrationType: IntegrationType;
    apiConfig?: APIConfig;
    vehicles?: Vehicle[];
    driverCount?: number;
    pricingRules: PricingRule[];
    commissionRate: number;
    rating: number;
    reviewCount: number;
    totalShipments: number;
    onTimeDeliveryRate: number;
    avgResponseTime: number;
    avgTransitTime: number;
    creditLimit?: Money;
    currentBalance?: Money;
    paymentTerms: number;
    licenses: FileInfo[];
    certifications: {
        name: string;
        number: string;
        issuedBy: string;
        issuedAt: string;
        expiresAt?: string;
        document?: FileInfo;
    }[];
    insurance: {
        provider: string;
        policyNumber: string;
        coverage: Money;
        expiresAt: string;
        document?: FileInfo;
    };
    isActive: boolean;
    joinedAt: string;
    lastActiveAt?: string;
    agreementVersion: string;
    agreementAcceptedAt: string;
    settlementFrequency: 'daily' | 'weekly' | 'monthly';
    bankAccount?: {
        bankName: string;
        accountNumber: string;
        iban: string;
        accountHolder: string;
    };
}
export interface CargoCompanyOnboardingRequest {
    name: string;
    legalName?: string;
    type: CargoCompanyType;
    website?: string;
    description?: string;
    contacts: Omit<Contact, 'id'>[];
    headquarters: Omit<Address, 'id'>;
    taxNumber: string;
    taxOffice: string;
    tradeRegistryNumber?: string;
    establishmentDate?: string;
    employeeCount?: number;
    specializations: CarrierSpecialization[];
    serviceTypes: ServiceType[];
    serviceAreas: Omit<ServiceArea, 'id'>[];
    businessHours: BusinessHours;
    integrationType: IntegrationType;
    vehicleCount?: number;
    driverCount?: number;
    documents: {
        type: 'license' | 'certification' | 'insurance' | 'tax_certificate' | 'other';
        name: string;
        file: FileInfo;
    }[];
    agreementAccepted: boolean;
    agreementVersion: string;
}
export interface CargoCompanyQuoteRequest {
    companyId: ID;
    shipmentId: ID;
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
    responseDeadline: string;
    requiresInsurance: boolean;
    declaredValue?: Money;
}
export interface CargoCompanyMetrics extends BaseEntity {
    companyId: ID;
    period: {
        startDate: string;
        endDate: string;
    };
    totalShipments: number;
    totalRevenue: Money;
    averageShipmentValue: Money;
    onTimePickupRate: number;
    onTimeDeliveryRate: number;
    averageTransitTime: number;
    averageResponseTime: number;
    damageRate: number;
    lossRate: number;
    customerRating: number;
    complaintRate: number;
    cancellationRate: number;
    acceptanceRate: number;
    citiesCovered: number;
    internationalShipments: number;
}
export interface CargoCompanyReview extends BaseEntity {
    companyId: ID;
    userId: ID;
    shipmentId: ID;
    rating: number;
    title?: string;
    comment?: string;
    ratings: {
        communication: number;
        punctuality: number;
        handling: number;
        value: number;
    };
    response?: {
        message: string;
        respondedAt: string;
        respondedBy: ID;
    };
    isVerified: boolean;
    isPublic: boolean;
    helpfulCount: number;
}
//# sourceMappingURL=cargo-company.types.d.ts.map