"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelShipmentSchema = exports.scheduleDeliverySchema = exports.rateShipmentSchema = exports.shipmentSearchSchema = exports.updateShipmentStatusSchema = exports.acceptQuoteSchema = exports.createQuoteSchema = exports.updateShipmentSchema = exports.createShipmentSchema = exports.specialServicesSchema = exports.timePreferenceSchema = exports.packageSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../utils/validation");
exports.packageSchema = zod_1.z.object({
    description: zod_1.z.string().min(2, 'Paket açıklaması en az 2 karakter olmalı').max(500),
    packageType: zod_1.z.enum(['document', 'package', 'pallet', 'bulk', 'liquid', 'vehicle', 'furniture', 'appliance', 'other']),
    category: zod_1.z.enum([
        'general', 'food', 'pharmaceutical', 'electronics', 'textile', 'automotive',
        'construction', 'chemical', 'hazardous', 'fragile', 'frozen', 'fresh',
        'livestock', 'artwork', 'jewelry', 'documents'
    ]),
    dimensions: validation_1.dimensionsSchema,
    value: validation_1.moneySchema,
    quantity: zod_1.z.number().int().positive().max(1000),
    barcode: zod_1.z.string().optional(),
    serialNumber: zod_1.z.string().optional(),
    specialInstructions: zod_1.z.string().max(1000).optional(),
    requiresSpecialHandling: zod_1.z.boolean().default(false),
});
exports.timePreferenceSchema = zod_1.z.object({
    date: zod_1.z.string().datetime(),
    timeSlot: zod_1.z.object({
        startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı'),
        endTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı'),
    }).optional(),
    isFlexible: zod_1.z.boolean().default(false),
    alternatives: zod_1.z.array(zod_1.z.string().datetime()).optional(),
});
exports.specialServicesSchema = zod_1.z.object({
    coldChain: zod_1.z.boolean().default(false),
    fragileHandling: zod_1.z.boolean().default(false),
    insurance: zod_1.z.boolean().default(false),
    signatureRequired: zod_1.z.boolean().default(false),
    ageVerification: zod_1.z.boolean().default(false),
    weekendDelivery: zod_1.z.boolean().default(false),
    appointmentDelivery: zod_1.z.boolean().default(false),
    assembly: zod_1.z.boolean().default(false),
    unpacking: zod_1.z.boolean().default(false),
    oldItemRemoval: zod_1.z.boolean().default(false),
});
exports.createShipmentSchema = zod_1.z.object({
    reference: zod_1.z.string().max(100).optional(),
    recipientId: zod_1.z.string().optional(),
    pickupAddress: zod_1.z.object({
        id: zod_1.z.string().optional(),
        title: zod_1.z.string().min(2, 'Adres başlığı en az 2 karakter olmalı'),
        firstName: zod_1.z.string().min(2, 'Ad en az 2 karakter olmalı'),
        lastName: zod_1.z.string().min(2, 'Soyad en az 2 karakter olmalı'),
        company: zod_1.z.string().optional(),
        addressLine1: zod_1.z.string().min(5, 'Adres en az 5 karakter olmalı'),
        addressLine2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(2, 'Şehir en az 2 karakter olmalı'),
        district: zod_1.z.string().min(2, 'İlçe en az 2 karakter olmalı'),
        neighborhood: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalı'),
        country: zod_1.z.string().default('TR'),
        phone: zod_1.z.string().regex(/^\+90[0-9]{10}$/, 'Geçerli telefon numarası girin'),
        email: zod_1.z.string().email().optional(),
        coordinates: validation_1.coordinatesSchema.optional(),
    }),
    deliveryAddress: zod_1.z.object({
        id: zod_1.z.string().optional(),
        title: zod_1.z.string().min(2, 'Adres başlığı en az 2 karakter olmalı'),
        firstName: zod_1.z.string().min(2, 'Ad en az 2 karakter olmalı'),
        lastName: zod_1.z.string().min(2, 'Soyad en az 2 karakter olmalı'),
        company: zod_1.z.string().optional(),
        addressLine1: zod_1.z.string().min(5, 'Adres en az 5 karakter olmalı'),
        addressLine2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(2, 'Şehir en az 2 karakter olmalı'),
        district: zod_1.z.string().min(2, 'İlçe en az 2 karakter olmalı'),
        neighborhood: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalı'),
        country: zod_1.z.string().default('TR'),
        phone: zod_1.z.string().regex(/^\+90[0-9]{10}$/, 'Geçerli telefon numarası girin'),
        email: zod_1.z.string().email().optional(),
        coordinates: validation_1.coordinatesSchema.optional(),
    }),
    packages: zod_1.z.array(exports.packageSchema).min(1, 'En az bir paket eklemelisiniz').max(10),
    category: zod_1.z.enum([
        'general', 'food', 'pharmaceutical', 'electronics', 'textile', 'automotive',
        'construction', 'chemical', 'hazardous', 'fragile', 'frozen', 'fresh',
        'livestock', 'artwork', 'jewelry', 'documents'
    ]),
    serviceType: zod_1.z.enum(['standard', 'express', 'same_day', 'next_day', 'scheduled', 'white_glove']),
    specialServices: exports.specialServicesSchema.optional(),
    pickupPreference: exports.timePreferenceSchema,
    deliveryPreference: exports.timePreferenceSchema,
    instructions: zod_1.z.string().max(1000).optional(),
    requiresCustoms: zod_1.z.boolean().default(false),
    customsValue: validation_1.moneySchema.optional(),
    commodityCode: zod_1.z.string().optional(),
});
exports.updateShipmentSchema = zod_1.z.object({
    reference: zod_1.z.string().max(100).optional(),
    packages: zod_1.z.array(exports.packageSchema).min(1).max(10).optional(),
    serviceType: zod_1.z.enum(['standard', 'express', 'same_day', 'next_day', 'scheduled', 'white_glove']).optional(),
    specialServices: exports.specialServicesSchema.optional(),
    pickupPreference: exports.timePreferenceSchema.optional(),
    deliveryPreference: exports.timePreferenceSchema.optional(),
    instructions: zod_1.z.string().max(1000).optional(),
    customerNotes: zod_1.z.string().max(1000).optional(),
});
exports.createQuoteSchema = zod_1.z.object({
    shipmentId: zod_1.z.string().min(1, 'Gönderi ID gerekli'),
    baseCost: validation_1.moneySchema,
    additionalCosts: zod_1.z.object({
        insurance: validation_1.moneySchema.optional(),
        fuelSurcharge: validation_1.moneySchema.optional(),
        specialServices: validation_1.moneySchema.optional(),
        taxes: validation_1.moneySchema.optional(),
    }).optional(),
    serviceType: zod_1.z.enum(['standard', 'express', 'same_day', 'next_day', 'scheduled', 'white_glove']),
    estimatedPickupDate: zod_1.z.string().datetime(),
    estimatedDeliveryDate: zod_1.z.string().datetime(),
    transitDays: zod_1.z.number().int().positive().max(30),
    termsAndConditions: zod_1.z.string().max(2000).optional(),
    validUntil: zod_1.z.string().datetime(),
    notes: zod_1.z.string().max(1000).optional(),
    trackingIncluded: zod_1.z.boolean().default(true),
    insuranceIncluded: zod_1.z.boolean().default(false),
    signatureRequired: zod_1.z.boolean().default(false),
});
exports.acceptQuoteSchema = zod_1.z.object({
    quoteId: zod_1.z.string().min(1, 'Teklif ID gerekli'),
    paymentMethodId: zod_1.z.string().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.updateShipmentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery',
        'delivered', 'delivery_failed', 'returned', 'cancelled'
    ]),
    location: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Konum adı en az 2 karakter olmalı'),
        coordinates: validation_1.coordinatesSchema.optional(),
    }).optional(),
    description: zod_1.z.string().max(1000).optional(),
    timestamp: zod_1.z.string().datetime().optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
    signature: zod_1.z.string().url().optional(),
    contactPerson: zod_1.z.object({
        name: zod_1.z.string().min(2, 'İletişim kişisi adı en az 2 karakter olmalı'),
        phone: zod_1.z.string().regex(/^\+90[0-9]{10}$/, 'Geçerli telefon numarası girin'),
        email: zod_1.z.string().email().optional(),
    }).optional(),
});
exports.shipmentSearchSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    status: zod_1.z.array(zod_1.z.enum([
        'draft', 'pending_quotes', 'quotes_received', 'carrier_selected',
        'payment_pending', 'payment_completed', 'pickup_scheduled', 'picked_up',
        'in_transit', 'out_for_delivery', 'delivered', 'delivery_failed',
        'returned', 'cancelled', 'dispute', 'refunded'
    ])).optional(),
    serviceType: zod_1.z.array(zod_1.z.enum(['standard', 'express', 'same_day', 'next_day', 'scheduled', 'white_glove'])).optional(),
    category: zod_1.z.array(zod_1.z.enum([
        'general', 'food', 'pharmaceutical', 'electronics', 'textile', 'automotive',
        'construction', 'chemical', 'hazardous', 'fragile', 'frozen', 'fresh',
        'livestock', 'artwork', 'jewelry', 'documents'
    ])).optional(),
    carrierId: zod_1.z.string().optional(),
    senderId: zod_1.z.string().optional(),
    recipientId: zod_1.z.string().optional(),
    pickupCity: zod_1.z.array(zod_1.z.string()).optional(),
    deliveryCity: zod_1.z.array(zod_1.z.string()).optional(),
    dateRange: zod_1.z.object({
        startDate: zod_1.z.string().datetime(),
        endDate: zod_1.z.string().datetime(),
    }).optional(),
    valueRange: zod_1.z.object({
        min: zod_1.z.number().nonnegative(),
        max: zod_1.z.number().positive(),
        currency: zod_1.z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
    }).optional(),
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'pickupDate', 'deliveryDate', 'totalValue']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.rateShipmentSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5),
    review: zod_1.z.string().max(1000).optional(),
    categories: zod_1.z.object({
        communication: zod_1.z.number().int().min(1).max(5).optional(),
        punctuality: zod_1.z.number().int().min(1).max(5).optional(),
        handling: zod_1.z.number().int().min(1).max(5).optional(),
        value: zod_1.z.number().int().min(1).max(5).optional(),
    }).optional(),
});
exports.scheduleDeliverySchema = zod_1.z.object({
    preferredDate: zod_1.z.string().datetime(),
    timeSlot: zod_1.z.object({
        startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı'),
        endTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı'),
    }),
    specialInstructions: zod_1.z.string().max(500).optional(),
    contactPerson: zod_1.z.object({
        name: zod_1.z.string().min(2, 'İletişim kişisi adı en az 2 karakter olmalı'),
        phone: zod_1.z.string().regex(/^\+90[0-9]{10}$/, 'Geçerli telefon numarası girin'),
    }).optional(),
});
exports.cancelShipmentSchema = zod_1.z.object({
    reason: zod_1.z.enum([
        'customer_request', 'address_change', 'wrong_information',
        'payment_issue', 'carrier_unavailable', 'weather_conditions',
        'force_majeure', 'other'
    ]),
    description: zod_1.z.string().max(1000).optional(),
    refundRequested: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=shipment.schemas.js.map