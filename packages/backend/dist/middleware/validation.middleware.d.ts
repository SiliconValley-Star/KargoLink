import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const ValidationRules: {
    userRegistration: ValidationChain[];
    userLogin: ValidationChain[];
    userProfileUpdate: ValidationChain[];
    addressCreate: ValidationChain[];
    shipmentCreate: ValidationChain[];
    paymentInitialize: ValidationChain[];
    fileUpload: ValidationChain[];
    pagination: ValidationChain[];
    uuidParam: ValidationChain[];
    trackingParam: ValidationChain[];
    dateRange: ValidationChain[];
};
export declare const validateRequest: (rules: ValidationChain[]) => (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
export declare const sanitizeBody: (allowedFields: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const customValidation: (validator: (value: any, req: Request) => boolean | string) => (value: any, { req }: {
    req: Request;
}) => boolean;
export declare const validateEmail: (email: string) => boolean;
export declare const validatePhone: (phone: string) => boolean;
export declare const validatePassword: (password: string) => boolean;
export declare const validateUUID: (uuid: string) => boolean;
export declare const validateBodySize: (maxSize?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const sanitizeInput: (input: string) => string;
export declare const validateFileType: (allowedTypes: string[], allowedSize?: number) => (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    ValidationRules: {
        userRegistration: ValidationChain[];
        userLogin: ValidationChain[];
        userProfileUpdate: ValidationChain[];
        addressCreate: ValidationChain[];
        shipmentCreate: ValidationChain[];
        paymentInitialize: ValidationChain[];
        fileUpload: ValidationChain[];
        pagination: ValidationChain[];
        uuidParam: ValidationChain[];
        trackingParam: ValidationChain[];
        dateRange: ValidationChain[];
    };
    validateRequest: (rules: ValidationChain[]) => (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
    sanitizeBody: (allowedFields: string[]) => (req: Request, res: Response, next: NextFunction) => void;
    customValidation: (validator: (value: any, req: Request) => boolean | string) => (value: any, { req }: {
        req: Request;
    }) => boolean;
    validateFileType: (allowedTypes: string[], allowedSize?: number) => (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=validation.middleware.d.ts.map