export declare const StringFormatters: {
    toTitleCase: (str: string) => string;
    toSnakeCase: (str: string) => string;
    toKebabCase: (str: string) => string;
    toCamelCase: (str: string) => string;
    truncate: (str: string, length: number) => string;
    maskEmail: (email: string) => string;
    maskPhone: (phone: string) => string;
    maskCardNumber: (cardNumber: string) => string;
    getInitials: (fullName: string) => string;
    removeTurkishChars: (str: string) => string;
};
export declare const NumberFormatters: {
    currency: (amount: number, currency?: "TRY" | "USD" | "EUR") => string;
    percentage: (value: number, decimals?: number) => string;
    fileSize: (bytes: number) => string;
    weight: (kg: number) => string;
    distance: (meters: number) => string;
    compact: (num: number) => string;
};
export declare const DateFormatters: {
    turkish: (date: Date | string) => string;
    dateTime: (date: Date | string) => string;
    time: (date: Date | string) => string;
    relative: (date: Date | string) => string;
    duration: (ms: number) => string;
    isToday: (date: Date | string) => boolean;
    isBusinessHours: (date: Date | string) => boolean;
};
export declare const AddressFormatters: {
    full: (address: {
        addressLine1: string;
        addressLine2?: string;
        neighborhood?: string;
        district: string;
        city: string;
        postalCode: string;
    }) => string;
    short: (address: {
        district: string;
        city: string;
    }) => string;
    postal: (address: {
        firstName: string;
        lastName: string;
        company?: string;
        addressLine1: string;
        addressLine2?: string;
        district: string;
        city: string;
        postalCode: string;
    }) => string;
};
declare const _default: {
    string: {
        toTitleCase: (str: string) => string;
        toSnakeCase: (str: string) => string;
        toKebabCase: (str: string) => string;
        toCamelCase: (str: string) => string;
        truncate: (str: string, length: number) => string;
        maskEmail: (email: string) => string;
        maskPhone: (phone: string) => string;
        maskCardNumber: (cardNumber: string) => string;
        getInitials: (fullName: string) => string;
        removeTurkishChars: (str: string) => string;
    };
    number: {
        currency: (amount: number, currency?: "TRY" | "USD" | "EUR") => string;
        percentage: (value: number, decimals?: number) => string;
        fileSize: (bytes: number) => string;
        weight: (kg: number) => string;
        distance: (meters: number) => string;
        compact: (num: number) => string;
    };
    date: {
        turkish: (date: Date | string) => string;
        dateTime: (date: Date | string) => string;
        time: (date: Date | string) => string;
        relative: (date: Date | string) => string;
        duration: (ms: number) => string;
        isToday: (date: Date | string) => boolean;
        isBusinessHours: (date: Date | string) => boolean;
    };
    address: {
        full: (address: {
            addressLine1: string;
            addressLine2?: string;
            neighborhood?: string;
            district: string;
            city: string;
            postalCode: string;
        }) => string;
        short: (address: {
            district: string;
            city: string;
        }) => string;
        postal: (address: {
            firstName: string;
            lastName: string;
            company?: string;
            addressLine1: string;
            addressLine2?: string;
            district: string;
            city: string;
            postalCode: string;
        }) => string;
    };
};
export default _default;
//# sourceMappingURL=formatters.d.ts.map