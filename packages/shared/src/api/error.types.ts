/**
 * Standard error codes used across the platform
 */
export const ERROR_CODES = {
  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  PHONE_NOT_VERIFIED: 'PHONE_NOT_VERIFIED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_LENGTH: 'INVALID_LENGTH',
  INVALID_VALUE: 'INVALID_VALUE',
  
  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_NOT_VERIFIED: 'USER_NOT_VERIFIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Shipment errors
  SHIPMENT_NOT_FOUND: 'SHIPMENT_NOT_FOUND',
  INVALID_SHIPMENT_STATUS: 'INVALID_SHIPMENT_STATUS',
  CANNOT_MODIFY_SHIPMENT: 'CANNOT_MODIFY_SHIPMENT',
  NO_QUOTES_AVAILABLE: 'NO_QUOTES_AVAILABLE',
  QUOTE_EXPIRED: 'QUOTE_EXPIRED',
  QUOTE_NOT_AVAILABLE: 'QUOTE_NOT_AVAILABLE',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  PAYMENT_METHOD_ERROR: 'PAYMENT_METHOD_ERROR',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  REFUND_FAILED: 'REFUND_FAILED',
  INVALID_PAYMENT_AMOUNT: 'INVALID_PAYMENT_AMOUNT',
  
  // Carrier errors
  CARRIER_NOT_FOUND: 'CARRIER_NOT_FOUND',
  CARRIER_NOT_VERIFIED: 'CARRIER_NOT_VERIFIED',
  CARRIER_NOT_AVAILABLE: 'CARRIER_NOT_AVAILABLE',
  OUTSIDE_SERVICE_AREA: 'OUTSIDE_SERVICE_AREA',
  
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  CARGO_API_ERROR: 'CARGO_API_ERROR',
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  SMS_SERVICE_ERROR: 'SMS_SERVICE_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  
  // Business logic errors
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_OPERATION: 'INVALID_OPERATION',
  PRECONDITION_FAILED: 'PRECONDITION_FAILED',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // Integration errors
  API_KEY_REQUIRED: 'API_KEY_REQUIRED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  API_QUOTA_EXCEEDED: 'API_QUOTA_EXCEEDED',
  
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Base error interface
 */
export interface BaseError {
  code: ErrorCode;
  message: string;
  field?: string;
  value?: any;
  metadata?: Record<string, any>;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: BaseError[];
    stack?: string; // Only in development
    requestId?: string;
  };
  timestamp: string;
}

/**
 * Validation error structure
 */
export interface ValidationError extends BaseError {
  code: 'VALIDATION_ERROR';
  field: string;
  constraints?: Record<string, string>;
}

/**
 * Field error structure for form validation
 */
export interface FieldError {
  field: string;
  message: string;
  code: ErrorCode;
  value?: any;
}

/**
 * Error messages mapped to error codes
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // General errors
  INTERNAL_ERROR: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  INVALID_REQUEST: 'Geçersiz istek.',
  NOT_FOUND: 'Kaynak bulunamadı.',
  UNAUTHORIZED: 'Bu işlem için yetkiniz yok.',
  FORBIDDEN: 'Bu kaynağa erişim yasak.',
  CONFLICT: 'Çakışma tespit edildi.',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'Geçersiz e-posta veya şifre.',
  EXPIRED_TOKEN: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.',
  INVALID_TOKEN: 'Geçersiz oturum bilgisi.',
  ACCOUNT_LOCKED: 'Hesabınız kilitlendi.',
  ACCOUNT_SUSPENDED: 'Hesabınız askıya alındı.',
  EMAIL_NOT_VERIFIED: 'E-posta adresiniz doğrulanmamış.',
  PHONE_NOT_VERIFIED: 'Telefon numaranız doğrulanmamış.',
  
  // Validation errors
  VALIDATION_ERROR: 'Form bilgilerinde hata var.',
  REQUIRED_FIELD: 'Bu alan zorunludur.',
  INVALID_FORMAT: 'Geçersiz format.',
  INVALID_LENGTH: 'Geçersiz uzunluk.',
  INVALID_VALUE: 'Geçersiz değer.',
  
  // User errors
  USER_NOT_FOUND: 'Kullanıcı bulunamadı.',
  USER_ALREADY_EXISTS: 'Bu e-posta adresi zaten kayıtlı.',
  USER_NOT_VERIFIED: 'Hesap doğrulanmamış.',
  INSUFFICIENT_PERMISSIONS: 'Yeterli yetkiniz yok.',
  
  // Shipment errors
  SHIPMENT_NOT_FOUND: 'Gönderi bulunamadı.',
  INVALID_SHIPMENT_STATUS: 'Geçersiz gönderi durumu.',
  CANNOT_MODIFY_SHIPMENT: 'Bu gönderi değiştirilemez.',
  NO_QUOTES_AVAILABLE: 'Uygun teklif bulunamadı.',
  QUOTE_EXPIRED: 'Teklifin süresi dolmuş.',
  QUOTE_NOT_AVAILABLE: 'Teklif artık mevcut değil.',
  
  // Payment errors
  PAYMENT_FAILED: 'Ödeme başarısız oldu.',
  INSUFFICIENT_FUNDS: 'Yetersiz bakiye.',
  PAYMENT_METHOD_ERROR: 'Ödeme yöntemi hatası.',
  PAYMENT_REQUIRED: 'Ödeme gerekli.',
  REFUND_FAILED: 'İade işlemi başarısız oldu.',
  INVALID_PAYMENT_AMOUNT: 'Geçersiz ödeme tutarı.',
  
  // Carrier errors
  CARRIER_NOT_FOUND: 'Taşıyıcı bulunamadı.',
  CARRIER_NOT_VERIFIED: 'Taşıyıcı doğrulanmamış.',
  CARRIER_NOT_AVAILABLE: 'Taşıyıcı müsait değil.',
  OUTSIDE_SERVICE_AREA: 'Hizmet alanı dışında.',
  
  // File errors
  FILE_TOO_LARGE: 'Dosya çok büyük.',
  INVALID_FILE_TYPE: 'Geçersiz dosya türü.',
  UPLOAD_FAILED: 'Dosya yüklenemedi.',
  FILE_NOT_FOUND: 'Dosya bulunamadı.',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Çok fazla istek gönderildi. Lütfen bekleyin.',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 'Harici servis hatası.',
  CARGO_API_ERROR: 'Kargo servis hatası.',
  PAYMENT_GATEWAY_ERROR: 'Ödeme servisi hatası.',
  SMS_SERVICE_ERROR: 'SMS servis hatası.',
  EMAIL_SERVICE_ERROR: 'E-posta servis hatası.',
  
  // Business logic errors
  DUPLICATE_ENTRY: 'Bu kayıt zaten mevcut.',
  INVALID_OPERATION: 'Geçersiz işlem.',
  PRECONDITION_FAILED: 'Ön koşul karşılanamadı.',
  RESOURCE_LOCKED: 'Kaynak kilitli.',
  
  // Integration errors
  API_KEY_REQUIRED: 'API anahtarı gerekli.',
  INVALID_API_KEY: 'Geçersiz API anahtarı.',
  API_QUOTA_EXCEEDED: 'API kotası aşıldı.',
};

/**
 * HTTP status codes mapped to error codes
 */
export const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
  // General errors
  INTERNAL_ERROR: 500,
  INVALID_REQUEST: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  
  // Authentication errors
  INVALID_CREDENTIALS: 401,
  EXPIRED_TOKEN: 401,
  INVALID_TOKEN: 401,
  ACCOUNT_LOCKED: 423,
  ACCOUNT_SUSPENDED: 423,
  EMAIL_NOT_VERIFIED: 403,
  PHONE_NOT_VERIFIED: 403,
  
  // Validation errors
  VALIDATION_ERROR: 422,
  REQUIRED_FIELD: 422,
  INVALID_FORMAT: 422,
  INVALID_LENGTH: 422,
  INVALID_VALUE: 422,
  
  // User errors
  USER_NOT_FOUND: 404,
  USER_ALREADY_EXISTS: 409,
  USER_NOT_VERIFIED: 403,
  INSUFFICIENT_PERMISSIONS: 403,
  
  // Shipment errors
  SHIPMENT_NOT_FOUND: 404,
  INVALID_SHIPMENT_STATUS: 400,
  CANNOT_MODIFY_SHIPMENT: 409,
  NO_QUOTES_AVAILABLE: 404,
  QUOTE_EXPIRED: 410,
  QUOTE_NOT_AVAILABLE: 404,
  
  // Payment errors
  PAYMENT_FAILED: 402,
  INSUFFICIENT_FUNDS: 402,
  PAYMENT_METHOD_ERROR: 400,
  PAYMENT_REQUIRED: 402,
  REFUND_FAILED: 500,
  INVALID_PAYMENT_AMOUNT: 400,
  
  // Carrier errors
  CARRIER_NOT_FOUND: 404,
  CARRIER_NOT_VERIFIED: 403,
  CARRIER_NOT_AVAILABLE: 409,
  OUTSIDE_SERVICE_AREA: 400,
  
  // File errors
  FILE_TOO_LARGE: 413,
  INVALID_FILE_TYPE: 415,
  UPLOAD_FAILED: 500,
  FILE_NOT_FOUND: 404,
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 429,
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 502,
  CARGO_API_ERROR: 502,
  PAYMENT_GATEWAY_ERROR: 502,
  SMS_SERVICE_ERROR: 502,
  EMAIL_SERVICE_ERROR: 502,
  
  // Business logic errors
  DUPLICATE_ENTRY: 409,
  INVALID_OPERATION: 400,
  PRECONDITION_FAILED: 412,
  RESOURCE_LOCKED: 423,
  
  // Integration errors
  API_KEY_REQUIRED: 401,
  INVALID_API_KEY: 401,
  API_QUOTA_EXCEEDED: 429,
};

/**
 * Create an error response
 */
export const createErrorResponse = (
  code: ErrorCode,
  message?: string,
  details?: BaseError[],
  requestId?: string
): ApiErrorResponse => ({
  success: false,
  error: {
    code,
    message: message || ERROR_MESSAGES[code],
    details,
    requestId,
  },
  timestamp: new Date().toISOString(),
});

/**
 * Create a validation error
 */
export const createValidationError = (
  field: string,
  message?: string,
  value?: any
): ValidationError => ({
  code: 'VALIDATION_ERROR',
  field,
  message: message || ERROR_MESSAGES.VALIDATION_ERROR,
  value,
});

/**
 * Create field errors from validation results
 */
export const createFieldErrors = (errors: Record<string, string[]>): FieldError[] => {
  const fieldErrors: FieldError[] = [];
  
  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach(message => {
      fieldErrors.push({
        field,
        message,
        code: 'VALIDATION_ERROR',
      });
    });
  });
  
  return fieldErrors;
};