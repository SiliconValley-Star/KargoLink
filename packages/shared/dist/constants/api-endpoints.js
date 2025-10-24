"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replacePathParams = exports.buildApiUrl = exports.INTEGRATION_ENDPOINTS = exports.ADMIN_ENDPOINTS = exports.NOTIFICATION_ENDPOINTS = exports.FILE_ENDPOINTS = exports.PAYMENT_ENDPOINTS = exports.CARRIER_ENDPOINTS = exports.SHIPMENT_ENDPOINTS = exports.USER_ENDPOINTS = exports.AUTH_ENDPOINTS = exports.API_VERSION = exports.API_BASE_URLS = void 0;
exports.API_BASE_URLS = {
    development: 'http://localhost:3000/api',
    staging: 'https://api-staging.cargolink.com.tr',
    production: 'https://api.cargolink.com.tr'
};
exports.API_VERSION = 'v1';
exports.AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    VERIFY_PHONE: '/auth/verify-phone',
    SEND_PHONE_CODE: '/auth/send-phone-code',
    GOOGLE_AUTH: '/auth/google',
    FACEBOOK_AUTH: '/auth/facebook',
    ENABLE_2FA: '/auth/2fa/enable',
    DISABLE_2FA: '/auth/2fa/disable',
    VERIFY_2FA: '/auth/2fa/verify'
};
exports.USER_ENDPOINTS = {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    DELETE_ACCOUNT: '/users/account',
    ADDRESSES: '/users/addresses',
    ADDRESS_BY_ID: (id) => `/users/addresses/${id}`,
    PREFERENCES: '/users/preferences',
    NOTIFICATIONS_SETTINGS: '/users/notifications',
    UPLOAD_DOCUMENTS: '/users/documents',
    VERIFICATION_STATUS: '/users/verification',
    BUSINESS_INFO: '/users/business',
    CARRIER_INFO: '/users/carrier',
    ACTIVITY_LOG: '/users/activity',
    STATISTICS: '/users/statistics',
    DEVICES: '/users/devices',
    REGISTER_DEVICE: '/users/devices/register',
    ALL_USERS: '/admin/users',
    USER_BY_ID: (id) => `/admin/users/${id}`,
    VERIFY_USER: (id) => `/admin/users/${id}/verify`,
    SUSPEND_USER: (id) => `/admin/users/${id}/suspend`,
    ACTIVATE_USER: (id) => `/admin/users/${id}/activate`
};
exports.SHIPMENT_ENDPOINTS = {
    SHIPMENTS: '/shipments',
    SHIPMENT_BY_ID: (id) => `/shipments/${id}`,
    MY_SHIPMENTS: '/shipments/my',
    CREATE_DRAFT: '/shipments/draft',
    REQUEST_QUOTES: (id) => `/shipments/${id}/quotes/request`,
    SELECT_CARRIER: (id) => `/shipments/${id}/carrier/select`,
    CANCEL_SHIPMENT: (id) => `/shipments/${id}/cancel`,
    TRACKING: (trackingNumber) => `/shipments/track/${trackingNumber}`,
    UPDATE_STATUS: (id) => `/shipments/${id}/status`,
    TRACKING_EVENTS: (id) => `/shipments/${id}/tracking`,
    DOCUMENTS: (id) => `/shipments/${id}/documents`,
    UPLOAD_DOCUMENT: (id) => `/shipments/${id}/documents/upload`,
    DOWNLOAD_LABEL: (id) => `/shipments/${id}/label`,
    DOWNLOAD_INVOICE: (id) => `/shipments/${id}/invoice`,
    QUOTES: (shipmentId) => `/shipments/${shipmentId}/quotes`,
    QUOTE_BY_ID: (shipmentId, quoteId) => `/shipments/${shipmentId}/quotes/${quoteId}`,
    ACCEPT_QUOTE: (shipmentId, quoteId) => `/shipments/${shipmentId}/quotes/${quoteId}/accept`,
    REJECT_QUOTE: (shipmentId, quoteId) => `/shipments/${shipmentId}/quotes/${quoteId}/reject`,
    REVIEW_CARRIER: (id) => `/shipments/${id}/review/carrier`,
    REVIEW_CUSTOMER: (id) => `/shipments/${id}/review/customer`,
    SCHEDULE_PICKUP: (id) => `/shipments/${id}/pickup/schedule`,
    CONFIRM_PICKUP: (id) => `/shipments/${id}/pickup/confirm`,
    SCHEDULE_DELIVERY: (id) => `/shipments/${id}/delivery/schedule`,
    CONFIRM_DELIVERY: (id) => `/shipments/${id}/delivery/confirm`,
    DELIVERY_ATTEMPTS: (id) => `/shipments/${id}/delivery/attempts`,
    SEARCH: '/shipments/search',
    FILTER: '/shipments/filter',
    STATISTICS: '/shipments/statistics'
};
exports.CARRIER_ENDPOINTS = {
    CARRIERS: '/carriers',
    CARRIER_BY_ID: (id) => `/carriers/${id}`,
    CARRIER_PROFILE: (id) => `/carriers/${id}/profile`,
    ONBOARDING_REQUEST: '/carriers/onboarding',
    ONBOARDING_STATUS: '/carriers/onboarding/status',
    VEHICLES: '/carriers/vehicles',
    VEHICLE_BY_ID: (id) => `/carriers/vehicles/${id}`,
    AVAILABLE_SHIPMENTS: '/carriers/shipments/available',
    MY_QUOTES: '/carriers/quotes',
    CREATE_QUOTE: '/carriers/quotes',
    UPDATE_QUOTE: (id) => `/carriers/quotes/${id}`,
    ASSIGNED_SHIPMENTS: '/carriers/shipments/assigned',
    SHIPMENT_ACTIONS: (id) => `/carriers/shipments/${id}`,
    PERFORMANCE_METRICS: '/carriers/metrics',
    EARNINGS: '/carriers/earnings',
    PAYOUT_HISTORY: '/carriers/payouts',
    REVIEWS: '/carriers/reviews',
    RESPOND_TO_REVIEW: (reviewId) => `/carriers/reviews/${reviewId}/respond`,
    SEARCH_CARRIERS: '/carriers/search',
    NEARBY_CARRIERS: '/carriers/nearby',
    VERIFY_CARRIER: (id) => `/admin/carriers/${id}/verify`,
    SUSPEND_CARRIER: (id) => `/admin/carriers/${id}/suspend`,
    CARRIER_APPLICATIONS: '/admin/carriers/applications'
};
exports.PAYMENT_ENDPOINTS = {
    PAYMENT_METHODS: '/payments/methods',
    ADD_CARD: '/payments/methods/card',
    ADD_BANK_ACCOUNT: '/payments/methods/bank',
    DELETE_METHOD: (id) => `/payments/methods/${id}`,
    SET_DEFAULT: (id) => `/payments/methods/${id}/default`,
    CREATE_PAYMENT: '/payments',
    PAYMENT_BY_ID: (id) => `/payments/${id}`,
    CONFIRM_PAYMENT: (id) => `/payments/${id}/confirm`,
    CANCEL_PAYMENT: (id) => `/payments/${id}/cancel`,
    REQUEST_REFUND: (id) => `/payments/${id}/refund`,
    REFUND_STATUS: (id) => `/payments/${id}/refund/status`,
    CREATE_INTENT: '/payments/intent',
    CONFIRM_INTENT: (id) => `/payments/intent/${id}/confirm`,
    WALLET: '/payments/wallet',
    WALLET_TRANSACTIONS: '/payments/wallet/transactions',
    WALLET_TOPUP: '/payments/wallet/topup',
    WALLET_WITHDRAW: '/payments/wallet/withdraw',
    INSTALLMENT_OPTIONS: '/payments/installments',
    CALCULATE_FEES: '/payments/fees/calculate',
    PAYMENT_HISTORY: '/payments/history',
    DOWNLOAD_INVOICE: (id) => `/payments/${id}/invoice`,
    PAYOUT_REQUEST: '/payments/payout/request',
    PAYOUT_HISTORY: '/payments/payout/history',
    PAYOUT_SETTINGS: '/payments/payout/settings',
    ALL_PAYMENTS: '/admin/payments',
    PAYMENT_DISPUTES: '/admin/payments/disputes',
    MANUAL_REFUND: (id) => `/admin/payments/${id}/refund`
};
exports.FILE_ENDPOINTS = {
    UPLOAD: '/files/upload',
    UPLOAD_MULTIPLE: '/files/upload/multiple',
    UPLOAD_AVATAR: '/files/avatar',
    UPLOAD_DOCUMENT: '/files/document',
    UPLOAD_SHIPMENT_IMAGE: '/files/shipment',
    UPLOAD_VEHICLE_IMAGE: '/files/vehicle',
    FILE_BY_ID: (id) => `/files/${id}`,
    DELETE_FILE: (id) => `/files/${id}`,
    GENERATE_THUMBNAIL: (id) => `/files/${id}/thumbnail`,
    COMPRESS_IMAGE: (id) => `/files/${id}/compress`,
    DELETE_MULTIPLE: '/files/delete/multiple',
    TEMP_UPLOAD: '/files/temp',
    CONFIRM_TEMP: (id) => `/files/temp/${id}/confirm`
};
exports.NOTIFICATION_ENDPOINTS = {
    NOTIFICATIONS: '/notifications',
    NOTIFICATION_BY_ID: (id) => `/notifications/${id}`,
    MARK_AS_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE_NOTIFICATION: (id) => `/notifications/${id}`,
    REGISTER_DEVICE: '/notifications/devices',
    UNREGISTER_DEVICE: (deviceId) => `/notifications/devices/${deviceId}`,
    PREFERENCES: '/notifications/preferences',
    TEST_NOTIFICATION: '/notifications/test',
    SEND_BROADCAST: '/admin/notifications/broadcast',
    NOTIFICATION_TEMPLATES: '/admin/notifications/templates',
    NOTIFICATION_STATS: '/admin/notifications/stats'
};
exports.ADMIN_ENDPOINTS = {
    DASHBOARD_STATS: '/admin/dashboard',
    SYSTEM_HEALTH: '/admin/health',
    USERS: '/admin/users',
    USER_DETAILS: (id) => `/admin/users/${id}`,
    USER_ACTIVITY: (id) => `/admin/users/${id}/activity`,
    ALL_SHIPMENTS: '/admin/shipments',
    SHIPMENT_DETAILS: (id) => `/admin/shipments/${id}`,
    RESOLVE_DISPUTE: (id) => `/admin/shipments/${id}/dispute/resolve`,
    REVENUE_REPORTS: '/admin/reports/revenue',
    COMMISSION_REPORTS: '/admin/reports/commission',
    PAYOUT_QUEUE: '/admin/payouts/queue',
    PROCESS_PAYOUTS: '/admin/payouts/process',
    SETTINGS: '/admin/settings',
    FEATURE_FLAGS: '/admin/features',
    MAINTENANCE_MODE: '/admin/maintenance',
    ANALYTICS: '/admin/analytics',
    EXPORT_DATA: '/admin/export',
    AUDIT_LOGS: '/admin/audit',
    CMS_CONTENT: '/admin/cms',
    ANNOUNCEMENTS: '/admin/announcements',
    API_KEYS: '/admin/api-keys',
    WEBHOOKS: '/admin/webhooks',
    INTEGRATION_LOGS: '/admin/integrations/logs'
};
exports.INTEGRATION_ENDPOINTS = {
    CARGO_COMPANIES: '/integrations/cargo',
    SYNC_RATES: '/integrations/cargo/sync-rates',
    TEST_CONNECTION: (companyId) => `/integrations/cargo/${companyId}/test`,
    PAYMENT_GATEWAYS: '/integrations/payment',
    WEBHOOK_HANDLER: (provider) => `/integrations/payment/${provider}/webhook`,
    SMS_PROVIDERS: '/integrations/sms',
    EMAIL_PROVIDERS: '/integrations/email',
    GEOCODING: '/integrations/maps/geocode',
    DISTANCE_MATRIX: '/integrations/maps/distance',
    EXTERNAL_TRACKING: '/integrations/tracking',
    CURRENCY_RATES: '/integrations/currency',
    WEBHOOK_ENDPOINTS: '/integrations/webhooks',
    WEBHOOK_LOGS: '/integrations/webhooks/logs'
};
const buildApiUrl = (endpoint, environment = 'development') => {
    const baseUrl = exports.API_BASE_URLS[environment];
    return `${baseUrl}/${exports.API_VERSION}${endpoint}`;
};
exports.buildApiUrl = buildApiUrl;
const replacePathParams = (endpoint, params) => {
    let result = endpoint;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`{${key}}`, String(value));
    });
    return result;
};
exports.replacePathParams = replacePathParams;
//# sourceMappingURL=api-endpoints.js.map