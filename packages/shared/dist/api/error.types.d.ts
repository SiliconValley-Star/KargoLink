export declare const ERROR_CODES: {
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly INVALID_REQUEST: "INVALID_REQUEST";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly CONFLICT: "CONFLICT";
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly EXPIRED_TOKEN: "EXPIRED_TOKEN";
    readonly INVALID_TOKEN: "INVALID_TOKEN";
    readonly ACCOUNT_LOCKED: "ACCOUNT_LOCKED";
    readonly ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED";
    readonly EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED";
    readonly PHONE_NOT_VERIFIED: "PHONE_NOT_VERIFIED";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly REQUIRED_FIELD: "REQUIRED_FIELD";
    readonly INVALID_FORMAT: "INVALID_FORMAT";
    readonly INVALID_LENGTH: "INVALID_LENGTH";
    readonly INVALID_VALUE: "INVALID_VALUE";
    readonly USER_NOT_FOUND: "USER_NOT_FOUND";
    readonly USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS";
    readonly USER_NOT_VERIFIED: "USER_NOT_VERIFIED";
    readonly INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS";
    readonly SHIPMENT_NOT_FOUND: "SHIPMENT_NOT_FOUND";
    readonly INVALID_SHIPMENT_STATUS: "INVALID_SHIPMENT_STATUS";
    readonly CANNOT_MODIFY_SHIPMENT: "CANNOT_MODIFY_SHIPMENT";
    readonly NO_QUOTES_AVAILABLE: "NO_QUOTES_AVAILABLE";
    readonly QUOTE_EXPIRED: "QUOTE_EXPIRED";
    readonly QUOTE_NOT_AVAILABLE: "QUOTE_NOT_AVAILABLE";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    readonly INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS";
    readonly PAYMENT_METHOD_ERROR: "PAYMENT_METHOD_ERROR";
    readonly PAYMENT_REQUIRED: "PAYMENT_REQUIRED";
    readonly REFUND_FAILED: "REFUND_FAILED";
    readonly INVALID_PAYMENT_AMOUNT: "INVALID_PAYMENT_AMOUNT";
    readonly CARRIER_NOT_FOUND: "CARRIER_NOT_FOUND";
    readonly CARRIER_NOT_VERIFIED: "CARRIER_NOT_VERIFIED";
    readonly CARRIER_NOT_AVAILABLE: "CARRIER_NOT_AVAILABLE";
    readonly OUTSIDE_SERVICE_AREA: "OUTSIDE_SERVICE_AREA";
    readonly FILE_TOO_LARGE: "FILE_TOO_LARGE";
    readonly INVALID_FILE_TYPE: "INVALID_FILE_TYPE";
    readonly UPLOAD_FAILED: "UPLOAD_FAILED";
    readonly FILE_NOT_FOUND: "FILE_NOT_FOUND";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR";
    readonly CARGO_API_ERROR: "CARGO_API_ERROR";
    readonly PAYMENT_GATEWAY_ERROR: "PAYMENT_GATEWAY_ERROR";
    readonly SMS_SERVICE_ERROR: "SMS_SERVICE_ERROR";
    readonly EMAIL_SERVICE_ERROR: "EMAIL_SERVICE_ERROR";
    readonly DUPLICATE_ENTRY: "DUPLICATE_ENTRY";
    readonly INVALID_OPERATION: "INVALID_OPERATION";
    readonly PRECONDITION_FAILED: "PRECONDITION_FAILED";
    readonly RESOURCE_LOCKED: "RESOURCE_LOCKED";
    readonly API_KEY_REQUIRED: "API_KEY_REQUIRED";
    readonly INVALID_API_KEY: "INVALID_API_KEY";
    readonly API_QUOTA_EXCEEDED: "API_QUOTA_EXCEEDED";
};
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export interface BaseError {
    code: ErrorCode;
    message: string;
    field?: string;
    value?: any;
    metadata?: Record<string, any>;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: ErrorCode;
        message: string;
        details?: BaseError[];
        stack?: string;
        requestId?: string;
    };
    timestamp: string;
}
export interface ValidationError extends BaseError {
    code: 'VALIDATION_ERROR';
    field: string;
    constraints?: Record<string, string>;
}
export interface FieldError {
    field: string;
    message: string;
    code: ErrorCode;
    value?: any;
}
export declare const ERROR_MESSAGES: Record<ErrorCode, string>;
export declare const ERROR_HTTP_STATUS: Record<ErrorCode, number>;
export declare const createErrorResponse: (code: ErrorCode, message?: string, details?: BaseError[], requestId?: string) => ApiErrorResponse;
export declare const createValidationError: (field: string, message?: string, value?: any) => ValidationError;
export declare const createFieldErrors: (errors: Record<string, string[]>) => FieldError[];
//# sourceMappingURL=error.types.d.ts.map