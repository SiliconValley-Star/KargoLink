import { CargoCompanyType, IntegrationType } from '../types/cargo-company.types';
import { CarrierSpecialization } from '../types/user.types';
import { ServiceType } from '../types/shipment.types';

/**
 * Major Turkish cargo companies with their basic information
 */
export const MAJOR_CARGO_COMPANIES = {
  YURTICI: {
    id: 'yurtici',
    name: 'Yurtiçi Kargo',
    legalName: 'Yurtiçi Kargo Servisi A.Ş.',
    type: 'enterprise' as CargoCompanyType,
    website: 'https://www.yurtici.com.tr',
    logo: 'https://www.yurtici.com.tr/assets/img/logo.png',
    integrationType: 'api' as IntegrationType,
    specializations: [
      'general',
      'express',
      'documents',
      'international'
    ] as CarrierSpecialization[],
    serviceTypes: [
      'standard',
      'express',
      'next_day',
      'same_day'
    ] as ServiceType[],
    commissionRate: 0.05, // 5%
    isActive: true
  },
  
  ARAS: {
    id: 'aras',
    name: 'Aras Kargo',
    legalName: 'Aras Kargo A.Ş.',
    type: 'enterprise' as CargoCompanyType,
    website: 'https://www.araskargo.com.tr',
    logo: 'https://www.araskargo.com.tr/assets/img/logo.png',
    integrationType: 'api' as IntegrationType,
    specializations: [
      'general',
      'express',
      'documents',
      'international',
      'cold_chain'
    ] as CarrierSpecialization[],
    serviceTypes: [
      'standard',
      'express',
      'next_day'
    ] as ServiceType[],
    commissionRate: 0.06, // 6%
    isActive: true
  },
  
  MNG: {
    id: 'mng',
    name: 'MNG Kargo',
    legalName: 'MNG Kargo A.Ş.',
    type: 'enterprise' as CargoCompanyType,
    website: 'https://www.mngkargo.com.tr',
    logo: 'https://www.mngkargo.com.tr/assets/img/logo.png',
    integrationType: 'api' as IntegrationType,
    specializations: [
      'general',
      'express',
      'documents',
      'international'
    ] as CarrierSpecialization[],
    serviceTypes: [
      'standard',
      'express',
      'next_day'
    ] as ServiceType[],
    commissionRate: 0.055, // 5.5%
    isActive: true
  },
  
  UPS: {
    id: 'ups',
    name: 'UPS',
    legalName: 'United Parcel Service Taşımacılık A.Ş.',
    type: 'enterprise' as CargoCompanyType,
    website: 'https://www.ups.com/tr',
    logo: 'https://www.ups.com/assets/resources/images/ups-logo.png',
    integrationType: 'api' as IntegrationType,
    specializations: [
      'general',
      'express',
      'documents',
      'international',
      'pharmaceutical'
    ] as CarrierSpecialization[],
    serviceTypes: [
      'standard',
      'express',
      'next_day',
      'same_day'
    ] as ServiceType[],
    commissionRate: 0.04, // 4%
    isActive: true
  },
  
  DHL: {
    id: 'dhl',
    name: 'DHL',
    legalName: 'DHL Express (Turkey) Taşımacılık A.Ş.',
    type: 'enterprise' as CargoCompanyType,
    website: 'https://www.dhl.com.tr',
    logo: 'https://www.dhl.com/content/dam/dhl/global/dhl-logo-print.svg',
    integrationType: 'api' as IntegrationType,
    specializations: [
      'general',
      'express',
      'documents',
      'international',
      'pharmaceutical',
      'cold_chain'
    ] as CarrierSpecialization[],
    serviceTypes: [
      'standard',
      'express',
      'next_day',
      'same_day'
    ] as ServiceType[],
    commissionRate: 0.035, // 3.5%
    isActive: true
  },
  
  PTT: {
    id: 'ptt',
    name: 'PTT Kargo',
    legalName: 'PTT A.Ş.',
    type: 'enterprise' as CargoCompanyType,
    website: 'https://www.ptt.gov.tr',
    logo: 'https://www.ptt.gov.tr/assets/img/logo.png',
    integrationType: 'api' as IntegrationType,
    specializations: [
      'general',
      'documents',
      'express'
    ] as CarrierSpecialization[],
    serviceTypes: [
      'standard',
      'express'
    ] as ServiceType[],
    commissionRate: 0.07, // 7%
    isActive: true
  },
  
  SURAT: {
    id: 'surat',
    name: 'Sürat Kargo',
    legalName: 'Sürat Kargo A.Ş.',
    type: 'enterprise' as CargoCompanyType,
    website: 'https://www.suratkargo.com.tr',
    logo: 'https://www.suratkargo.com.tr/assets/img/logo.png',
    integrationType: 'api' as IntegrationType,
    specializations: [
      'general',
      'express',
      'documents'
    ] as CarrierSpecialization[],
    serviceTypes: [
      'standard',
      'express'
    ] as ServiceType[],
    commissionRate: 0.065, // 6.5%
    isActive: true
  }
} as const;

/**
 * Default commission rates by company type
 */
export const DEFAULT_COMMISSION_RATES = {
  enterprise: 0.05,    // 5% for major companies
  regional: 0.08,      // 8% for regional companies
  local: 0.10,         // 10% for local carriers
  freelance: 0.12      // 12% for freelance drivers
} as const;

/**
 * Service area coverage for major cities
 */
export const MAJOR_CITIES = [
  { code: '01', name: 'Adana', region: 'Mediterranean' },
  { code: '02', name: 'Adıyaman', region: 'Southeastern Anatolia' },
  { code: '03', name: 'Afyonkarahisar', region: 'Aegean' },
  { code: '04', name: 'Ağrı', region: 'Eastern Anatolia' },
  { code: '06', name: 'Ankara', region: 'Central Anatolia' },
  { code: '07', name: 'Antalya', region: 'Mediterranean' },
  { code: '09', name: 'Aydın', region: 'Aegean' },
  { code: '16', name: 'Bursa', region: 'Marmara' },
  { code: '17', name: 'Çanakkale', region: 'Marmara' },
  { code: '34', name: 'İstanbul', region: 'Marmara' },
  { code: '35', name: 'İzmir', region: 'Aegean' },
  { code: '38', name: 'Kayseri', region: 'Central Anatolia' },
  { code: '41', name: 'Kocaeli', region: 'Marmara' },
  { code: '42', name: 'Konya', region: 'Central Anatolia' },
  { code: '58', name: 'Sivas', region: 'Central Anatolia' },
  { code: '61', name: 'Trabzon', region: 'Black Sea' }
] as const;

/**
 * API endpoint configurations for cargo companies
 */
export const CARGO_API_ENDPOINTS = {
  YURTICI: {
    baseUrl: 'https://api.yurtici.com.tr/v2',
    endpoints: {
      quote: '/shipments/quote',
      create: '/shipments',
      track: '/shipments/{id}/track',
      cancel: '/shipments/{id}/cancel',
      label: '/shipments/{id}/label'
    }
  },
  ARAS: {
    baseUrl: 'https://api.araskargo.com.tr/v1',
    endpoints: {
      quote: '/calculate',
      create: '/shipment',
      track: '/track/{trackingNumber}',
      cancel: '/shipment/{id}/cancel',
      label: '/shipment/{id}/waybill'
    }
  },
  MNG: {
    baseUrl: 'https://api.mngkargo.com.tr/v1',
    endpoints: {
      quote: '/pricing/calculate',
      create: '/shipments/create',
      track: '/tracking/{barcode}',
      cancel: '/shipments/{id}/cancel',
      label: '/shipments/{id}/label'
    }
  }
} as const;

/**
 * Default business hours for cargo companies
 */
export const DEFAULT_BUSINESS_HOURS = {
  monday: [{ startTime: '09:00', endTime: '18:00', available: true }],
  tuesday: [{ startTime: '09:00', endTime: '18:00', available: true }],
  wednesday: [{ startTime: '09:00', endTime: '18:00', available: true }],
  thursday: [{ startTime: '09:00', endTime: '18:00', available: true }],
  friday: [{ startTime: '09:00', endTime: '18:00', available: true }],
  saturday: [{ startTime: '09:00', endTime: '13:00', available: true }],
  sunday: [{ startTime: '00:00', endTime: '00:00', available: false }]
} as const;

/**
 * Minimum and maximum service standards
 */
export const SERVICE_STANDARDS = {
  MIN_RESPONSE_TIME: 30,      // 30 minutes maximum response time
  MAX_RESPONSE_TIME: 4 * 60,  // 4 hours maximum response time
  MIN_RATING: 3.0,            // Minimum 3.0 rating to stay active
  MIN_ON_TIME_RATE: 80,       // Minimum 80% on-time delivery rate
  MAX_DAMAGE_RATE: 0.5,       // Maximum 0.5% damage rate
  MAX_LOSS_RATE: 0.1          // Maximum 0.1% loss rate
} as const;