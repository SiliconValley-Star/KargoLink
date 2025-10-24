/**
 * API Base URLs for different environments
 */
export const API_BASE_URLS = {
  development: 'http://localhost:3000/api',
  staging: 'https://api-staging.cargolink.com.tr',
  production: 'https://api.cargolink.com.tr'
} as const;

/**
 * API Version
 */
export const API_VERSION = 'v1';

/**
 * Authentication endpoints
 */
export const AUTH_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // Password management
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // Email verification
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  
  // Phone verification
  VERIFY_PHONE: '/auth/verify-phone',
  SEND_PHONE_CODE: '/auth/send-phone-code',
  
  // Social authentication
  GOOGLE_AUTH: '/auth/google',
  FACEBOOK_AUTH: '/auth/facebook',
  
  // Two-factor authentication
  ENABLE_2FA: '/auth/2fa/enable',
  DISABLE_2FA: '/auth/2fa/disable',
  VERIFY_2FA: '/auth/2fa/verify'
} as const;

/**
 * User management endpoints
 */
export const USER_ENDPOINTS = {
  // Profile management
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  DELETE_ACCOUNT: '/users/account',
  
  // Address management
  ADDRESSES: '/users/addresses',
  ADDRESS_BY_ID: (id: string) => `/users/addresses/${id}`,
  
  // Preferences
  PREFERENCES: '/users/preferences',
  NOTIFICATIONS_SETTINGS: '/users/notifications',
  
  // Verification
  UPLOAD_DOCUMENTS: '/users/documents',
  VERIFICATION_STATUS: '/users/verification',
  
  // Business information
  BUSINESS_INFO: '/users/business',
  CARRIER_INFO: '/users/carrier',
  
  // Activity & Statistics
  ACTIVITY_LOG: '/users/activity',
  STATISTICS: '/users/statistics',
  
  // Device management
  DEVICES: '/users/devices',
  REGISTER_DEVICE: '/users/devices/register',
  
  // Admin endpoints for user management
  ALL_USERS: '/admin/users',
  USER_BY_ID: (id: string) => `/admin/users/${id}`,
  VERIFY_USER: (id: string) => `/admin/users/${id}/verify`,
  SUSPEND_USER: (id: string) => `/admin/users/${id}/suspend`,
  ACTIVATE_USER: (id: string) => `/admin/users/${id}/activate`
} as const;

/**
 * Shipment management endpoints
 */
export const SHIPMENT_ENDPOINTS = {
  // Basic CRUD operations
  SHIPMENTS: '/shipments',
  SHIPMENT_BY_ID: (id: string) => `/shipments/${id}`,
  MY_SHIPMENTS: '/shipments/my',
  
  // Shipment creation and management
  CREATE_DRAFT: '/shipments/draft',
  REQUEST_QUOTES: (id: string) => `/shipments/${id}/quotes/request`,
  SELECT_CARRIER: (id: string) => `/shipments/${id}/carrier/select`,
  CANCEL_SHIPMENT: (id: string) => `/shipments/${id}/cancel`,
  
  // Tracking and status
  TRACKING: (trackingNumber: string) => `/shipments/track/${trackingNumber}`,
  UPDATE_STATUS: (id: string) => `/shipments/${id}/status`,
  TRACKING_EVENTS: (id: string) => `/shipments/${id}/tracking`,
  
  // Documents and files
  DOCUMENTS: (id: string) => `/shipments/${id}/documents`,
  UPLOAD_DOCUMENT: (id: string) => `/shipments/${id}/documents/upload`,
  DOWNLOAD_LABEL: (id: string) => `/shipments/${id}/label`,
  DOWNLOAD_INVOICE: (id: string) => `/shipments/${id}/invoice`,
  
  // Quotes management
  QUOTES: (shipmentId: string) => `/shipments/${shipmentId}/quotes`,
  QUOTE_BY_ID: (shipmentId: string, quoteId: string) => `/shipments/${shipmentId}/quotes/${quoteId}`,
  ACCEPT_QUOTE: (shipmentId: string, quoteId: string) => `/shipments/${shipmentId}/quotes/${quoteId}/accept`,
  REJECT_QUOTE: (shipmentId: string, quoteId: string) => `/shipments/${shipmentId}/quotes/${quoteId}/reject`,
  
  // Reviews and ratings
  REVIEW_CARRIER: (id: string) => `/shipments/${id}/review/carrier`,
  REVIEW_CUSTOMER: (id: string) => `/shipments/${id}/review/customer`,
  
  // Delivery management
  SCHEDULE_PICKUP: (id: string) => `/shipments/${id}/pickup/schedule`,
  CONFIRM_PICKUP: (id: string) => `/shipments/${id}/pickup/confirm`,
  SCHEDULE_DELIVERY: (id: string) => `/shipments/${id}/delivery/schedule`,
  CONFIRM_DELIVERY: (id: string) => `/shipments/${id}/delivery/confirm`,
  DELIVERY_ATTEMPTS: (id: string) => `/shipments/${id}/delivery/attempts`,
  
  // Search and filtering
  SEARCH: '/shipments/search',
  FILTER: '/shipments/filter',
  STATISTICS: '/shipments/statistics'
} as const;

/**
 * Carrier and cargo company endpoints
 */
export const CARRIER_ENDPOINTS = {
  // Carrier management
  CARRIERS: '/carriers',
  CARRIER_BY_ID: (id: string) => `/carriers/${id}`,
  CARRIER_PROFILE: (id: string) => `/carriers/${id}/profile`,
  
  // Onboarding
  ONBOARDING_REQUEST: '/carriers/onboarding',
  ONBOARDING_STATUS: '/carriers/onboarding/status',
  
  // Vehicle management
  VEHICLES: '/carriers/vehicles',
  VEHICLE_BY_ID: (id: string) => `/carriers/vehicles/${id}`,
  
  // Quote management for carriers
  AVAILABLE_SHIPMENTS: '/carriers/shipments/available',
  MY_QUOTES: '/carriers/quotes',
  CREATE_QUOTE: '/carriers/quotes',
  UPDATE_QUOTE: (id: string) => `/carriers/quotes/${id}`,
  
  // Assigned shipments
  ASSIGNED_SHIPMENTS: '/carriers/shipments/assigned',
  SHIPMENT_ACTIONS: (id: string) => `/carriers/shipments/${id}`,
  
  // Performance and earnings
  PERFORMANCE_METRICS: '/carriers/metrics',
  EARNINGS: '/carriers/earnings',
  PAYOUT_HISTORY: '/carriers/payouts',
  
  // Reviews and ratings
  REVIEWS: '/carriers/reviews',
  RESPOND_TO_REVIEW: (reviewId: string) => `/carriers/reviews/${reviewId}/respond`,
  
  // Search and discovery
  SEARCH_CARRIERS: '/carriers/search',
  NEARBY_CARRIERS: '/carriers/nearby',
  
  // Admin endpoints
  VERIFY_CARRIER: (id: string) => `/admin/carriers/${id}/verify`,
  SUSPEND_CARRIER: (id: string) => `/admin/carriers/${id}/suspend`,
  CARRIER_APPLICATIONS: '/admin/carriers/applications'
} as const;

/**
 * Payment management endpoints
 */
export const PAYMENT_ENDPOINTS = {
  // Payment methods
  PAYMENT_METHODS: '/payments/methods',
  ADD_CARD: '/payments/methods/card',
  ADD_BANK_ACCOUNT: '/payments/methods/bank',
  DELETE_METHOD: (id: string) => `/payments/methods/${id}`,
  SET_DEFAULT: (id: string) => `/payments/methods/${id}/default`,
  
  // Payment processing
  CREATE_PAYMENT: '/payments',
  PAYMENT_BY_ID: (id: string) => `/payments/${id}`,
  CONFIRM_PAYMENT: (id: string) => `/payments/${id}/confirm`,
  CANCEL_PAYMENT: (id: string) => `/payments/${id}/cancel`,
  
  // Refunds
  REQUEST_REFUND: (id: string) => `/payments/${id}/refund`,
  REFUND_STATUS: (id: string) => `/payments/${id}/refund/status`,
  
  // Payment intents
  CREATE_INTENT: '/payments/intent',
  CONFIRM_INTENT: (id: string) => `/payments/intent/${id}/confirm`,
  
  // Wallet management
  WALLET: '/payments/wallet',
  WALLET_TRANSACTIONS: '/payments/wallet/transactions',
  WALLET_TOPUP: '/payments/wallet/topup',
  WALLET_WITHDRAW: '/payments/wallet/withdraw',
  
  // Installment and pricing
  INSTALLMENT_OPTIONS: '/payments/installments',
  CALCULATE_FEES: '/payments/fees/calculate',
  
  // Payment history
  PAYMENT_HISTORY: '/payments/history',
  DOWNLOAD_INVOICE: (id: string) => `/payments/${id}/invoice`,
  
  // Payouts (for carriers)
  PAYOUT_REQUEST: '/payments/payout/request',
  PAYOUT_HISTORY: '/payments/payout/history',
  PAYOUT_SETTINGS: '/payments/payout/settings',
  
  // Admin endpoints
  ALL_PAYMENTS: '/admin/payments',
  PAYMENT_DISPUTES: '/admin/payments/disputes',
  MANUAL_REFUND: (id: string) => `/admin/payments/${id}/refund`
} as const;

/**
 * File upload and management endpoints
 */
export const FILE_ENDPOINTS = {
  // Generic file upload
  UPLOAD: '/files/upload',
  UPLOAD_MULTIPLE: '/files/upload/multiple',
  
  // Specific file types
  UPLOAD_AVATAR: '/files/avatar',
  UPLOAD_DOCUMENT: '/files/document',
  UPLOAD_SHIPMENT_IMAGE: '/files/shipment',
  UPLOAD_VEHICLE_IMAGE: '/files/vehicle',
  
  // File management
  FILE_BY_ID: (id: string) => `/files/${id}`,
  DELETE_FILE: (id: string) => `/files/${id}`,
  
  // File processing
  GENERATE_THUMBNAIL: (id: string) => `/files/${id}/thumbnail`,
  COMPRESS_IMAGE: (id: string) => `/files/${id}/compress`,
  
  // Batch operations
  DELETE_MULTIPLE: '/files/delete/multiple',
  
  // Temporary uploads
  TEMP_UPLOAD: '/files/temp',
  CONFIRM_TEMP: (id: string) => `/files/temp/${id}/confirm`
} as const;

/**
 * Notification endpoints
 */
export const NOTIFICATION_ENDPOINTS = {
  // User notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_BY_ID: (id: string) => `/notifications/${id}`,
  MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  DELETE_NOTIFICATION: (id: string) => `/notifications/${id}`,
  
  // Push notification settings
  REGISTER_DEVICE: '/notifications/devices',
  UNREGISTER_DEVICE: (deviceId: string) => `/notifications/devices/${deviceId}`,
  
  // Notification preferences
  PREFERENCES: '/notifications/preferences',
  TEST_NOTIFICATION: '/notifications/test',
  
  // Admin endpoints
  SEND_BROADCAST: '/admin/notifications/broadcast',
  NOTIFICATION_TEMPLATES: '/admin/notifications/templates',
  NOTIFICATION_STATS: '/admin/notifications/stats'
} as const;

/**
 * Admin and reporting endpoints
 */
export const ADMIN_ENDPOINTS = {
  // Dashboard
  DASHBOARD_STATS: '/admin/dashboard',
  SYSTEM_HEALTH: '/admin/health',
  
  // User management
  USERS: '/admin/users',
  USER_DETAILS: (id: string) => `/admin/users/${id}`,
  USER_ACTIVITY: (id: string) => `/admin/users/${id}/activity`,
  
  // Shipment management
  ALL_SHIPMENTS: '/admin/shipments',
  SHIPMENT_DETAILS: (id: string) => `/admin/shipments/${id}`,
  RESOLVE_DISPUTE: (id: string) => `/admin/shipments/${id}/dispute/resolve`,
  
  // Financial management
  REVENUE_REPORTS: '/admin/reports/revenue',
  COMMISSION_REPORTS: '/admin/reports/commission',
  PAYOUT_QUEUE: '/admin/payouts/queue',
  PROCESS_PAYOUTS: '/admin/payouts/process',
  
  // System configuration
  SETTINGS: '/admin/settings',
  FEATURE_FLAGS: '/admin/features',
  MAINTENANCE_MODE: '/admin/maintenance',
  
  // Reports and analytics
  ANALYTICS: '/admin/analytics',
  EXPORT_DATA: '/admin/export',
  AUDIT_LOGS: '/admin/audit',
  
  // Content management
  CMS_CONTENT: '/admin/cms',
  ANNOUNCEMENTS: '/admin/announcements',
  
  // Integration management
  API_KEYS: '/admin/api-keys',
  WEBHOOKS: '/admin/webhooks',
  INTEGRATION_LOGS: '/admin/integrations/logs'
} as const;

/**
 * External integrations endpoints
 */
export const INTEGRATION_ENDPOINTS = {
  // Cargo company integrations
  CARGO_COMPANIES: '/integrations/cargo',
  SYNC_RATES: '/integrations/cargo/sync-rates',
  TEST_CONNECTION: (companyId: string) => `/integrations/cargo/${companyId}/test`,
  
  // Payment gateway integrations
  PAYMENT_GATEWAYS: '/integrations/payment',
  WEBHOOK_HANDLER: (provider: string) => `/integrations/payment/${provider}/webhook`,
  
  // SMS and email services
  SMS_PROVIDERS: '/integrations/sms',
  EMAIL_PROVIDERS: '/integrations/email',
  
  // Maps and geocoding
  GEOCODING: '/integrations/maps/geocode',
  DISTANCE_MATRIX: '/integrations/maps/distance',
  
  // Third-party APIs
  EXTERNAL_TRACKING: '/integrations/tracking',
  CURRENCY_RATES: '/integrations/currency',
  
  // Webhooks
  WEBHOOK_ENDPOINTS: '/integrations/webhooks',
  WEBHOOK_LOGS: '/integrations/webhooks/logs'
} as const;

/**
 * Helper function to build complete API URL
 */
export const buildApiUrl = (
  endpoint: string,
  environment: keyof typeof API_BASE_URLS = 'development'
): string => {
  const baseUrl = API_BASE_URLS[environment];
  return `${baseUrl}/${API_VERSION}${endpoint}`;
};

/**
 * Helper function to replace path parameters
 */
export const replacePathParams = (
  endpoint: string,
  params: Record<string, string | number>
): string => {
  let result = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, String(value));
  });
  return result;
};