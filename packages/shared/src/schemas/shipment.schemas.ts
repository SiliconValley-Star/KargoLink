import { z } from 'zod';
import { coordinatesSchema, dimensionsSchema, moneySchema } from '../utils/validation';

/**
 * Package schema
 */
export const packageSchema = z.object({
  description: z.string().min(2, 'Paket açıklaması en az 2 karakter olmalı').max(500),
  packageType: z.enum(['document', 'package', 'pallet', 'bulk', 'liquid', 'vehicle', 'furniture', 'appliance', 'other']),
  category: z.enum([
    'general', 'food', 'pharmaceutical', 'electronics', 'textile', 'automotive',
    'construction', 'chemical', 'hazardous', 'fragile', 'frozen', 'fresh',
    'livestock', 'artwork', 'jewelry', 'documents'
  ]),
  dimensions: dimensionsSchema,
  value: moneySchema,
  quantity: z.number().int().positive().max(1000),
  barcode: z.string().optional(),
  serialNumber: z.string().optional(),
  specialInstructions: z.string().max(1000).optional(),
  requiresSpecialHandling: z.boolean().default(false),
});

export type PackageInput = z.infer<typeof packageSchema>;

/**
 * Time preference schema
 */
export const timePreferenceSchema = z.object({
  date: z.string().datetime(),
  timeSlot: z.object({
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı'),
  }).optional(),
  isFlexible: z.boolean().default(false),
  alternatives: z.array(z.string().datetime()).optional(),
});

export type TimePreferenceInput = z.infer<typeof timePreferenceSchema>;

/**
 * Special services schema
 */
export const specialServicesSchema = z.object({
  coldChain: z.boolean().default(false),
  fragileHandling: z.boolean().default(false),
  insurance: z.boolean().default(false),
  signatureRequired: z.boolean().default(false),
  ageVerification: z.boolean().default(false),
  weekendDelivery: z.boolean().default(false),
  appointmentDelivery: z.boolean().default(false),
  assembly: z.boolean().default(false),
  unpacking: z.boolean().default(false),
  oldItemRemoval: z.boolean().default(false),
});

export type SpecialServicesInput = z.infer<typeof specialServicesSchema>;

/**
 * Create shipment schema
 */
export const createShipmentSchema = z.object({
  reference: z.string().max(100).optional(),
  recipientId: z.string().optional(),
  pickupAddress: z.object({
    id: z.string().optional(),
    title: z.string().min(2, 'Adres başlığı en az 2 karakter olmalı'),
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
    company: z.string().optional(),
    addressLine1: z.string().min(5, 'Adres en az 5 karakter olmalı'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'Şehir en az 2 karakter olmalı'),
    district: z.string().min(2, 'İlçe en az 2 karakter olmalı'),
    neighborhood: z.string().optional(),
    postalCode: z.string().regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalı'),
    country: z.string().default('TR'),
    phone: z.string().regex(/^\+90[0-9]{10}$/, 'Geçerli telefon numarası girin'),
    email: z.string().email().optional(),
    coordinates: coordinatesSchema.optional(),
  }),
  deliveryAddress: z.object({
    id: z.string().optional(),
    title: z.string().min(2, 'Adres başlığı en az 2 karakter olmalı'),
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
    company: z.string().optional(),
    addressLine1: z.string().min(5, 'Adres en az 5 karakter olmalı'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'Şehir en az 2 karakter olmalı'),
    district: z.string().min(2, 'İlçe en az 2 karakter olmalı'),
    neighborhood: z.string().optional(),
    postalCode: z.string().regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalı'),
    country: z.string().default('TR'),
    phone: z.string().regex(/^\+90[0-9]{10}$/, 'Geçerli telefon numarası girin'),
    email: z.string().email().optional(),
    coordinates: coordinatesSchema.optional(),
  }),
  packages: z.array(packageSchema).min(1, 'En az bir paket eklemelisiniz').max(10),
  category: z.enum([
    'general', 'food', 'pharmaceutical', 'electronics', 'textile', 'automotive',
    'construction', 'chemical', 'hazardous', 'fragile', 'frozen', 'fresh',
    'livestock', 'artwork', 'jewelry', 'documents'
  ]),
  serviceType: z.enum(['standard', 'express', 'same_day', 'next_day', 'scheduled', 'white_glove']),
  specialServices: specialServicesSchema.optional(),
  pickupPreference: timePreferenceSchema,
  deliveryPreference: timePreferenceSchema,
  instructions: z.string().max(1000).optional(),
  requiresCustoms: z.boolean().default(false),
  customsValue: moneySchema.optional(),
  commodityCode: z.string().optional(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;

/**
 * Update shipment schema
 */
export const updateShipmentSchema = z.object({
  reference: z.string().max(100).optional(),
  packages: z.array(packageSchema).min(1).max(10).optional(),
  serviceType: z.enum(['standard', 'express', 'same_day', 'next_day', 'scheduled', 'white_glove']).optional(),
  specialServices: specialServicesSchema.optional(),
  pickupPreference: timePreferenceSchema.optional(),
  deliveryPreference: timePreferenceSchema.optional(),
  instructions: z.string().max(1000).optional(),
  customerNotes: z.string().max(1000).optional(),
});

export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;

/**
 * Create quote schema (for carriers)
 */
export const createQuoteSchema = z.object({
  shipmentId: z.string().min(1, 'Gönderi ID gerekli'),
  baseCost: moneySchema,
  additionalCosts: z.object({
    insurance: moneySchema.optional(),
    fuelSurcharge: moneySchema.optional(),
    specialServices: moneySchema.optional(),
    taxes: moneySchema.optional(),
  }).optional(),
  serviceType: z.enum(['standard', 'express', 'same_day', 'next_day', 'scheduled', 'white_glove']),
  estimatedPickupDate: z.string().datetime(),
  estimatedDeliveryDate: z.string().datetime(),
  transitDays: z.number().int().positive().max(30),
  termsAndConditions: z.string().max(2000).optional(),
  validUntil: z.string().datetime(),
  notes: z.string().max(1000).optional(),
  trackingIncluded: z.boolean().default(true),
  insuranceIncluded: z.boolean().default(false),
  signatureRequired: z.boolean().default(false),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

/**
 * Accept quote schema
 */
export const acceptQuoteSchema = z.object({
  quoteId: z.string().min(1, 'Teklif ID gerekli'),
  paymentMethodId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type AcceptQuoteInput = z.infer<typeof acceptQuoteSchema>;

/**
 * Update shipment status schema
 */
export const updateShipmentStatusSchema = z.object({
  status: z.enum([
    'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery',
    'delivered', 'delivery_failed', 'returned', 'cancelled'
  ]),
  location: z.object({
    name: z.string().min(2, 'Konum adı en az 2 karakter olmalı'),
    coordinates: coordinatesSchema.optional(),
  }).optional(),
  description: z.string().max(1000).optional(),
  timestamp: z.string().datetime().optional(),
  images: z.array(z.string().url()).optional(),
  signature: z.string().url().optional(),
  contactPerson: z.object({
    name: z.string().min(2, 'İletişim kişisi adı en az 2 karakter olmalı'),
    phone: z.string().regex(/^\+90[0-9]{10}$/, 'Geçerli telefon numarası girin'),
    email: z.string().email().optional(),
  }).optional(),
});

export type UpdateShipmentStatusInput = z.infer<typeof updateShipmentStatusSchema>;

/**
 * Shipment search schema
 */
export const shipmentSearchSchema = z.object({
  query: z.string().optional(), // trackingNumber, reference, etc.
  status: z.array(z.enum([
    'draft', 'pending_quotes', 'quotes_received', 'carrier_selected',
    'payment_pending', 'payment_completed', 'pickup_scheduled', 'picked_up',
    'in_transit', 'out_for_delivery', 'delivered', 'delivery_failed',
    'returned', 'cancelled', 'dispute', 'refunded'
  ])).optional(),
  serviceType: z.array(z.enum(['standard', 'express', 'same_day', 'next_day', 'scheduled', 'white_glove'])).optional(),
  category: z.array(z.enum([
    'general', 'food', 'pharmaceutical', 'electronics', 'textile', 'automotive',
    'construction', 'chemical', 'hazardous', 'fragile', 'frozen', 'fresh',
    'livestock', 'artwork', 'jewelry', 'documents'
  ])).optional(),
  carrierId: z.string().optional(),
  senderId: z.string().optional(),
  recipientId: z.string().optional(),
  pickupCity: z.array(z.string()).optional(),
  deliveryCity: z.array(z.string()).optional(),
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }).optional(),
  valueRange: z.object({
    min: z.number().nonnegative(),
    max: z.number().positive(),
    currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  }).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'pickupDate', 'deliveryDate', 'totalValue']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ShipmentSearchInput = z.infer<typeof shipmentSearchSchema>;

/**
 * Rate shipment schema
 */
export const rateShipmentSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional(),
  categories: z.object({
    communication: z.number().int().min(1).max(5).optional(),
    punctuality: z.number().int().min(1).max(5).optional(),
    handling: z.number().int().min(1).max(5).optional(),
    value: z.number().int().min(1).max(5).optional(),
  }).optional(),
});

export type RateShipmentInput = z.infer<typeof rateShipmentSchema>;

/**
 * Schedule delivery schema
 */
export const scheduleDeliverySchema = z.object({
  preferredDate: z.string().datetime(),
  timeSlot: z.object({
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Saat formatı HH:MM olmalı'),
  }),
  specialInstructions: z.string().max(500).optional(),
  contactPerson: z.object({
    name: z.string().min(2, 'İletişim kişisi adı en az 2 karakter olmalı'),
    phone: z.string().regex(/^\+90[0-9]{10}$/, 'Geçerli telefon numarası girin'),
  }).optional(),
});

export type ScheduleDeliveryInput = z.infer<typeof scheduleDeliverySchema>;

/**
 * Cancel shipment schema
 */
export const cancelShipmentSchema = z.object({
  reason: z.enum([
    'customer_request', 'address_change', 'wrong_information',
    'payment_issue', 'carrier_unavailable', 'weather_conditions',
    'force_majeure', 'other'
  ]),
  description: z.string().max(1000).optional(),
  refundRequested: z.boolean().default(false),
});

export type CancelShipmentInput = z.infer<typeof cancelShipmentSchema>;