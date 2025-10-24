"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICE_STANDARDS = exports.DEFAULT_BUSINESS_HOURS = exports.CARGO_API_ENDPOINTS = exports.MAJOR_CITIES = exports.DEFAULT_COMMISSION_RATES = exports.MAJOR_CARGO_COMPANIES = void 0;
exports.MAJOR_CARGO_COMPANIES = {
    YURTICI: {
        id: 'yurtici',
        name: 'Yurtiçi Kargo',
        legalName: 'Yurtiçi Kargo Servisi A.Ş.',
        type: 'enterprise',
        website: 'https://www.yurtici.com.tr',
        logo: 'https://www.yurtici.com.tr/assets/img/logo.png',
        integrationType: 'api',
        specializations: [
            'general',
            'express',
            'documents',
            'international'
        ],
        serviceTypes: [
            'standard',
            'express',
            'next_day',
            'same_day'
        ],
        commissionRate: 0.05,
        isActive: true
    },
    ARAS: {
        id: 'aras',
        name: 'Aras Kargo',
        legalName: 'Aras Kargo A.Ş.',
        type: 'enterprise',
        website: 'https://www.araskargo.com.tr',
        logo: 'https://www.araskargo.com.tr/assets/img/logo.png',
        integrationType: 'api',
        specializations: [
            'general',
            'express',
            'documents',
            'international',
            'cold_chain'
        ],
        serviceTypes: [
            'standard',
            'express',
            'next_day'
        ],
        commissionRate: 0.06,
        isActive: true
    },
    MNG: {
        id: 'mng',
        name: 'MNG Kargo',
        legalName: 'MNG Kargo A.Ş.',
        type: 'enterprise',
        website: 'https://www.mngkargo.com.tr',
        logo: 'https://www.mngkargo.com.tr/assets/img/logo.png',
        integrationType: 'api',
        specializations: [
            'general',
            'express',
            'documents',
            'international'
        ],
        serviceTypes: [
            'standard',
            'express',
            'next_day'
        ],
        commissionRate: 0.055,
        isActive: true
    },
    UPS: {
        id: 'ups',
        name: 'UPS',
        legalName: 'United Parcel Service Taşımacılık A.Ş.',
        type: 'enterprise',
        website: 'https://www.ups.com/tr',
        logo: 'https://www.ups.com/assets/resources/images/ups-logo.png',
        integrationType: 'api',
        specializations: [
            'general',
            'express',
            'documents',
            'international',
            'pharmaceutical'
        ],
        serviceTypes: [
            'standard',
            'express',
            'next_day',
            'same_day'
        ],
        commissionRate: 0.04,
        isActive: true
    },
    DHL: {
        id: 'dhl',
        name: 'DHL',
        legalName: 'DHL Express (Turkey) Taşımacılık A.Ş.',
        type: 'enterprise',
        website: 'https://www.dhl.com.tr',
        logo: 'https://www.dhl.com/content/dam/dhl/global/dhl-logo-print.svg',
        integrationType: 'api',
        specializations: [
            'general',
            'express',
            'documents',
            'international',
            'pharmaceutical',
            'cold_chain'
        ],
        serviceTypes: [
            'standard',
            'express',
            'next_day',
            'same_day'
        ],
        commissionRate: 0.035,
        isActive: true
    },
    PTT: {
        id: 'ptt',
        name: 'PTT Kargo',
        legalName: 'PTT A.Ş.',
        type: 'enterprise',
        website: 'https://www.ptt.gov.tr',
        logo: 'https://www.ptt.gov.tr/assets/img/logo.png',
        integrationType: 'api',
        specializations: [
            'general',
            'documents',
            'express'
        ],
        serviceTypes: [
            'standard',
            'express'
        ],
        commissionRate: 0.07,
        isActive: true
    },
    SURAT: {
        id: 'surat',
        name: 'Sürat Kargo',
        legalName: 'Sürat Kargo A.Ş.',
        type: 'enterprise',
        website: 'https://www.suratkargo.com.tr',
        logo: 'https://www.suratkargo.com.tr/assets/img/logo.png',
        integrationType: 'api',
        specializations: [
            'general',
            'express',
            'documents'
        ],
        serviceTypes: [
            'standard',
            'express'
        ],
        commissionRate: 0.065,
        isActive: true
    }
};
exports.DEFAULT_COMMISSION_RATES = {
    enterprise: 0.05,
    regional: 0.08,
    local: 0.10,
    freelance: 0.12
};
exports.MAJOR_CITIES = [
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
];
exports.CARGO_API_ENDPOINTS = {
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
};
exports.DEFAULT_BUSINESS_HOURS = {
    monday: [{ startTime: '09:00', endTime: '18:00', available: true }],
    tuesday: [{ startTime: '09:00', endTime: '18:00', available: true }],
    wednesday: [{ startTime: '09:00', endTime: '18:00', available: true }],
    thursday: [{ startTime: '09:00', endTime: '18:00', available: true }],
    friday: [{ startTime: '09:00', endTime: '18:00', available: true }],
    saturday: [{ startTime: '09:00', endTime: '13:00', available: true }],
    sunday: [{ startTime: '00:00', endTime: '00:00', available: false }]
};
exports.SERVICE_STANDARDS = {
    MIN_RESPONSE_TIME: 30,
    MAX_RESPONSE_TIME: 4 * 60,
    MIN_RATING: 3.0,
    MIN_ON_TIME_RATE: 80,
    MAX_DAMAGE_RATE: 0.5,
    MAX_LOSS_RATE: 0.1
};
//# sourceMappingURL=cargo-companies.js.map