import { z } from 'zod';
export declare const packageSchema: z.ZodObject<{
    description: z.ZodString;
    packageType: z.ZodEnum<["document", "package", "pallet", "bulk", "liquid", "vehicle", "furniture", "appliance", "other"]>;
    category: z.ZodEnum<["general", "food", "pharmaceutical", "electronics", "textile", "automotive", "construction", "chemical", "hazardous", "fragile", "frozen", "fresh", "livestock", "artwork", "jewelry", "documents"]>;
    dimensions: z.ZodObject<{
        length: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        weight: number;
        length: number;
        width: number;
        height: number;
    }, {
        weight: number;
        length: number;
        width: number;
        height: number;
    }>;
    value: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodEnum<["TRY", "USD", "EUR"]>;
    }, "strip", z.ZodTypeAny, {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    }, {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    }>;
    quantity: z.ZodNumber;
    barcode: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    specialInstructions: z.ZodOptional<z.ZodString>;
    requiresSpecialHandling: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dimensions: {
        weight: number;
        length: number;
        width: number;
        height: number;
    };
    category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
    description: string;
    packageType: "other" | "document" | "package" | "vehicle" | "pallet" | "bulk" | "liquid" | "furniture" | "appliance";
    value: {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    };
    quantity: number;
    requiresSpecialHandling: boolean;
    barcode?: string | undefined;
    serialNumber?: string | undefined;
    specialInstructions?: string | undefined;
}, {
    dimensions: {
        weight: number;
        length: number;
        width: number;
        height: number;
    };
    category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
    description: string;
    packageType: "other" | "document" | "package" | "vehicle" | "pallet" | "bulk" | "liquid" | "furniture" | "appliance";
    value: {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    };
    quantity: number;
    barcode?: string | undefined;
    serialNumber?: string | undefined;
    specialInstructions?: string | undefined;
    requiresSpecialHandling?: boolean | undefined;
}>;
export type PackageInput = z.infer<typeof packageSchema>;
export declare const timePreferenceSchema: z.ZodObject<{
    date: z.ZodString;
    timeSlot: z.ZodOptional<z.ZodObject<{
        startTime: z.ZodString;
        endTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startTime: string;
        endTime: string;
    }, {
        startTime: string;
        endTime: string;
    }>>;
    isFlexible: z.ZodDefault<z.ZodBoolean>;
    alternatives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    date: string;
    isFlexible: boolean;
    timeSlot?: {
        startTime: string;
        endTime: string;
    } | undefined;
    alternatives?: string[] | undefined;
}, {
    date: string;
    timeSlot?: {
        startTime: string;
        endTime: string;
    } | undefined;
    isFlexible?: boolean | undefined;
    alternatives?: string[] | undefined;
}>;
export type TimePreferenceInput = z.infer<typeof timePreferenceSchema>;
export declare const specialServicesSchema: z.ZodObject<{
    coldChain: z.ZodDefault<z.ZodBoolean>;
    fragileHandling: z.ZodDefault<z.ZodBoolean>;
    insurance: z.ZodDefault<z.ZodBoolean>;
    signatureRequired: z.ZodDefault<z.ZodBoolean>;
    ageVerification: z.ZodDefault<z.ZodBoolean>;
    weekendDelivery: z.ZodDefault<z.ZodBoolean>;
    appointmentDelivery: z.ZodDefault<z.ZodBoolean>;
    assembly: z.ZodDefault<z.ZodBoolean>;
    unpacking: z.ZodDefault<z.ZodBoolean>;
    oldItemRemoval: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    insurance: boolean;
    coldChain: boolean;
    fragileHandling: boolean;
    signatureRequired: boolean;
    ageVerification: boolean;
    weekendDelivery: boolean;
    appointmentDelivery: boolean;
    assembly: boolean;
    unpacking: boolean;
    oldItemRemoval: boolean;
}, {
    insurance?: boolean | undefined;
    coldChain?: boolean | undefined;
    fragileHandling?: boolean | undefined;
    signatureRequired?: boolean | undefined;
    ageVerification?: boolean | undefined;
    weekendDelivery?: boolean | undefined;
    appointmentDelivery?: boolean | undefined;
    assembly?: boolean | undefined;
    unpacking?: boolean | undefined;
    oldItemRemoval?: boolean | undefined;
}>;
export type SpecialServicesInput = z.infer<typeof specialServicesSchema>;
export declare const createShipmentSchema: z.ZodObject<{
    reference: z.ZodOptional<z.ZodString>;
    recipientId: z.ZodOptional<z.ZodString>;
    pickupAddress: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        addressLine1: z.ZodString;
        addressLine2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        district: z.ZodString;
        neighborhood: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        phone: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
        }, {
            latitude: number;
            longitude: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        city: string;
        district: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        addressLine2?: string | undefined;
        neighborhood?: string | undefined;
        id?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }, {
        title: string;
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        city: string;
        district: string;
        postalCode: string;
        email?: string | undefined;
        company?: string | undefined;
        addressLine2?: string | undefined;
        neighborhood?: string | undefined;
        country?: string | undefined;
        id?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }>;
    deliveryAddress: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        addressLine1: z.ZodString;
        addressLine2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        district: z.ZodString;
        neighborhood: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        phone: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
        }, {
            latitude: number;
            longitude: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        city: string;
        district: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        addressLine2?: string | undefined;
        neighborhood?: string | undefined;
        id?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }, {
        title: string;
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        city: string;
        district: string;
        postalCode: string;
        email?: string | undefined;
        company?: string | undefined;
        addressLine2?: string | undefined;
        neighborhood?: string | undefined;
        country?: string | undefined;
        id?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }>;
    packages: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        packageType: z.ZodEnum<["document", "package", "pallet", "bulk", "liquid", "vehicle", "furniture", "appliance", "other"]>;
        category: z.ZodEnum<["general", "food", "pharmaceutical", "electronics", "textile", "automotive", "construction", "chemical", "hazardous", "fragile", "frozen", "fresh", "livestock", "artwork", "jewelry", "documents"]>;
        dimensions: z.ZodObject<{
            length: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
            weight: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            weight: number;
            length: number;
            width: number;
            height: number;
        }, {
            weight: number;
            length: number;
            width: number;
            height: number;
        }>;
        value: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodEnum<["TRY", "USD", "EUR"]>;
        }, "strip", z.ZodTypeAny, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }>;
        quantity: z.ZodNumber;
        barcode: z.ZodOptional<z.ZodString>;
        serialNumber: z.ZodOptional<z.ZodString>;
        specialInstructions: z.ZodOptional<z.ZodString>;
        requiresSpecialHandling: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        dimensions: {
            weight: number;
            length: number;
            width: number;
            height: number;
        };
        category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
        description: string;
        packageType: "other" | "document" | "package" | "vehicle" | "pallet" | "bulk" | "liquid" | "furniture" | "appliance";
        value: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        };
        quantity: number;
        requiresSpecialHandling: boolean;
        barcode?: string | undefined;
        serialNumber?: string | undefined;
        specialInstructions?: string | undefined;
    }, {
        dimensions: {
            weight: number;
            length: number;
            width: number;
            height: number;
        };
        category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
        description: string;
        packageType: "other" | "document" | "package" | "vehicle" | "pallet" | "bulk" | "liquid" | "furniture" | "appliance";
        value: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        };
        quantity: number;
        barcode?: string | undefined;
        serialNumber?: string | undefined;
        specialInstructions?: string | undefined;
        requiresSpecialHandling?: boolean | undefined;
    }>, "many">;
    category: z.ZodEnum<["general", "food", "pharmaceutical", "electronics", "textile", "automotive", "construction", "chemical", "hazardous", "fragile", "frozen", "fresh", "livestock", "artwork", "jewelry", "documents"]>;
    serviceType: z.ZodEnum<["standard", "express", "same_day", "next_day", "scheduled", "white_glove"]>;
    specialServices: z.ZodOptional<z.ZodObject<{
        coldChain: z.ZodDefault<z.ZodBoolean>;
        fragileHandling: z.ZodDefault<z.ZodBoolean>;
        insurance: z.ZodDefault<z.ZodBoolean>;
        signatureRequired: z.ZodDefault<z.ZodBoolean>;
        ageVerification: z.ZodDefault<z.ZodBoolean>;
        weekendDelivery: z.ZodDefault<z.ZodBoolean>;
        appointmentDelivery: z.ZodDefault<z.ZodBoolean>;
        assembly: z.ZodDefault<z.ZodBoolean>;
        unpacking: z.ZodDefault<z.ZodBoolean>;
        oldItemRemoval: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        insurance: boolean;
        coldChain: boolean;
        fragileHandling: boolean;
        signatureRequired: boolean;
        ageVerification: boolean;
        weekendDelivery: boolean;
        appointmentDelivery: boolean;
        assembly: boolean;
        unpacking: boolean;
        oldItemRemoval: boolean;
    }, {
        insurance?: boolean | undefined;
        coldChain?: boolean | undefined;
        fragileHandling?: boolean | undefined;
        signatureRequired?: boolean | undefined;
        ageVerification?: boolean | undefined;
        weekendDelivery?: boolean | undefined;
        appointmentDelivery?: boolean | undefined;
        assembly?: boolean | undefined;
        unpacking?: boolean | undefined;
        oldItemRemoval?: boolean | undefined;
    }>>;
    pickupPreference: z.ZodObject<{
        date: z.ZodString;
        timeSlot: z.ZodOptional<z.ZodObject<{
            startTime: z.ZodString;
            endTime: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            startTime: string;
            endTime: string;
        }, {
            startTime: string;
            endTime: string;
        }>>;
        isFlexible: z.ZodDefault<z.ZodBoolean>;
        alternatives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        isFlexible: boolean;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        alternatives?: string[] | undefined;
    }, {
        date: string;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        isFlexible?: boolean | undefined;
        alternatives?: string[] | undefined;
    }>;
    deliveryPreference: z.ZodObject<{
        date: z.ZodString;
        timeSlot: z.ZodOptional<z.ZodObject<{
            startTime: z.ZodString;
            endTime: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            startTime: string;
            endTime: string;
        }, {
            startTime: string;
            endTime: string;
        }>>;
        isFlexible: z.ZodDefault<z.ZodBoolean>;
        alternatives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        isFlexible: boolean;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        alternatives?: string[] | undefined;
    }, {
        date: string;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        isFlexible?: boolean | undefined;
        alternatives?: string[] | undefined;
    }>;
    instructions: z.ZodOptional<z.ZodString>;
    requiresCustoms: z.ZodDefault<z.ZodBoolean>;
    customsValue: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodEnum<["TRY", "USD", "EUR"]>;
    }, "strip", z.ZodTypeAny, {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    }, {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    }>>;
    commodityCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    serviceType: "express" | "standard" | "same_day" | "next_day" | "scheduled" | "white_glove";
    category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
    pickupAddress: {
        title: string;
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        city: string;
        district: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        addressLine2?: string | undefined;
        neighborhood?: string | undefined;
        id?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    };
    deliveryAddress: {
        title: string;
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        city: string;
        district: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        addressLine2?: string | undefined;
        neighborhood?: string | undefined;
        id?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    };
    packages: {
        dimensions: {
            weight: number;
            length: number;
            width: number;
            height: number;
        };
        category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
        description: string;
        packageType: "other" | "document" | "package" | "vehicle" | "pallet" | "bulk" | "liquid" | "furniture" | "appliance";
        value: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        };
        quantity: number;
        requiresSpecialHandling: boolean;
        barcode?: string | undefined;
        serialNumber?: string | undefined;
        specialInstructions?: string | undefined;
    }[];
    pickupPreference: {
        date: string;
        isFlexible: boolean;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        alternatives?: string[] | undefined;
    };
    deliveryPreference: {
        date: string;
        isFlexible: boolean;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        alternatives?: string[] | undefined;
    };
    requiresCustoms: boolean;
    specialServices?: {
        insurance: boolean;
        coldChain: boolean;
        fragileHandling: boolean;
        signatureRequired: boolean;
        ageVerification: boolean;
        weekendDelivery: boolean;
        appointmentDelivery: boolean;
        assembly: boolean;
        unpacking: boolean;
        oldItemRemoval: boolean;
    } | undefined;
    reference?: string | undefined;
    recipientId?: string | undefined;
    instructions?: string | undefined;
    customsValue?: {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    } | undefined;
    commodityCode?: string | undefined;
}, {
    serviceType: "express" | "standard" | "same_day" | "next_day" | "scheduled" | "white_glove";
    category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
    pickupAddress: {
        title: string;
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        city: string;
        district: string;
        postalCode: string;
        email?: string | undefined;
        company?: string | undefined;
        addressLine2?: string | undefined;
        neighborhood?: string | undefined;
        country?: string | undefined;
        id?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    };
    deliveryAddress: {
        title: string;
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        city: string;
        district: string;
        postalCode: string;
        email?: string | undefined;
        company?: string | undefined;
        addressLine2?: string | undefined;
        neighborhood?: string | undefined;
        country?: string | undefined;
        id?: string | undefined;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    };
    packages: {
        dimensions: {
            weight: number;
            length: number;
            width: number;
            height: number;
        };
        category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
        description: string;
        packageType: "other" | "document" | "package" | "vehicle" | "pallet" | "bulk" | "liquid" | "furniture" | "appliance";
        value: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        };
        quantity: number;
        barcode?: string | undefined;
        serialNumber?: string | undefined;
        specialInstructions?: string | undefined;
        requiresSpecialHandling?: boolean | undefined;
    }[];
    pickupPreference: {
        date: string;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        isFlexible?: boolean | undefined;
        alternatives?: string[] | undefined;
    };
    deliveryPreference: {
        date: string;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        isFlexible?: boolean | undefined;
        alternatives?: string[] | undefined;
    };
    specialServices?: {
        insurance?: boolean | undefined;
        coldChain?: boolean | undefined;
        fragileHandling?: boolean | undefined;
        signatureRequired?: boolean | undefined;
        ageVerification?: boolean | undefined;
        weekendDelivery?: boolean | undefined;
        appointmentDelivery?: boolean | undefined;
        assembly?: boolean | undefined;
        unpacking?: boolean | undefined;
        oldItemRemoval?: boolean | undefined;
    } | undefined;
    reference?: string | undefined;
    recipientId?: string | undefined;
    instructions?: string | undefined;
    requiresCustoms?: boolean | undefined;
    customsValue?: {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    } | undefined;
    commodityCode?: string | undefined;
}>;
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export declare const updateShipmentSchema: z.ZodObject<{
    reference: z.ZodOptional<z.ZodString>;
    packages: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        packageType: z.ZodEnum<["document", "package", "pallet", "bulk", "liquid", "vehicle", "furniture", "appliance", "other"]>;
        category: z.ZodEnum<["general", "food", "pharmaceutical", "electronics", "textile", "automotive", "construction", "chemical", "hazardous", "fragile", "frozen", "fresh", "livestock", "artwork", "jewelry", "documents"]>;
        dimensions: z.ZodObject<{
            length: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
            weight: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            weight: number;
            length: number;
            width: number;
            height: number;
        }, {
            weight: number;
            length: number;
            width: number;
            height: number;
        }>;
        value: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodEnum<["TRY", "USD", "EUR"]>;
        }, "strip", z.ZodTypeAny, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }>;
        quantity: z.ZodNumber;
        barcode: z.ZodOptional<z.ZodString>;
        serialNumber: z.ZodOptional<z.ZodString>;
        specialInstructions: z.ZodOptional<z.ZodString>;
        requiresSpecialHandling: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        dimensions: {
            weight: number;
            length: number;
            width: number;
            height: number;
        };
        category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
        description: string;
        packageType: "other" | "document" | "package" | "vehicle" | "pallet" | "bulk" | "liquid" | "furniture" | "appliance";
        value: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        };
        quantity: number;
        requiresSpecialHandling: boolean;
        barcode?: string | undefined;
        serialNumber?: string | undefined;
        specialInstructions?: string | undefined;
    }, {
        dimensions: {
            weight: number;
            length: number;
            width: number;
            height: number;
        };
        category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
        description: string;
        packageType: "other" | "document" | "package" | "vehicle" | "pallet" | "bulk" | "liquid" | "furniture" | "appliance";
        value: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        };
        quantity: number;
        barcode?: string | undefined;
        serialNumber?: string | undefined;
        specialInstructions?: string | undefined;
        requiresSpecialHandling?: boolean | undefined;
    }>, "many">>;
    serviceType: z.ZodOptional<z.ZodEnum<["standard", "express", "same_day", "next_day", "scheduled", "white_glove"]>>;
    specialServices: z.ZodOptional<z.ZodObject<{
        coldChain: z.ZodDefault<z.ZodBoolean>;
        fragileHandling: z.ZodDefault<z.ZodBoolean>;
        insurance: z.ZodDefault<z.ZodBoolean>;
        signatureRequired: z.ZodDefault<z.ZodBoolean>;
        ageVerification: z.ZodDefault<z.ZodBoolean>;
        weekendDelivery: z.ZodDefault<z.ZodBoolean>;
        appointmentDelivery: z.ZodDefault<z.ZodBoolean>;
        assembly: z.ZodDefault<z.ZodBoolean>;
        unpacking: z.ZodDefault<z.ZodBoolean>;
        oldItemRemoval: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        insurance: boolean;
        coldChain: boolean;
        fragileHandling: boolean;
        signatureRequired: boolean;
        ageVerification: boolean;
        weekendDelivery: boolean;
        appointmentDelivery: boolean;
        assembly: boolean;
        unpacking: boolean;
        oldItemRemoval: boolean;
    }, {
        insurance?: boolean | undefined;
        coldChain?: boolean | undefined;
        fragileHandling?: boolean | undefined;
        signatureRequired?: boolean | undefined;
        ageVerification?: boolean | undefined;
        weekendDelivery?: boolean | undefined;
        appointmentDelivery?: boolean | undefined;
        assembly?: boolean | undefined;
        unpacking?: boolean | undefined;
        oldItemRemoval?: boolean | undefined;
    }>>;
    pickupPreference: z.ZodOptional<z.ZodObject<{
        date: z.ZodString;
        timeSlot: z.ZodOptional<z.ZodObject<{
            startTime: z.ZodString;
            endTime: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            startTime: string;
            endTime: string;
        }, {
            startTime: string;
            endTime: string;
        }>>;
        isFlexible: z.ZodDefault<z.ZodBoolean>;
        alternatives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        isFlexible: boolean;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        alternatives?: string[] | undefined;
    }, {
        date: string;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        isFlexible?: boolean | undefined;
        alternatives?: string[] | undefined;
    }>>;
    deliveryPreference: z.ZodOptional<z.ZodObject<{
        date: z.ZodString;
        timeSlot: z.ZodOptional<z.ZodObject<{
            startTime: z.ZodString;
            endTime: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            startTime: string;
            endTime: string;
        }, {
            startTime: string;
            endTime: string;
        }>>;
        isFlexible: z.ZodDefault<z.ZodBoolean>;
        alternatives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        isFlexible: boolean;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        alternatives?: string[] | undefined;
    }, {
        date: string;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        isFlexible?: boolean | undefined;
        alternatives?: string[] | undefined;
    }>>;
    instructions: z.ZodOptional<z.ZodString>;
    customerNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    serviceType?: "express" | "standard" | "same_day" | "next_day" | "scheduled" | "white_glove" | undefined;
    specialServices?: {
        insurance: boolean;
        coldChain: boolean;
        fragileHandling: boolean;
        signatureRequired: boolean;
        ageVerification: boolean;
        weekendDelivery: boolean;
        appointmentDelivery: boolean;
        assembly: boolean;
        unpacking: boolean;
        oldItemRemoval: boolean;
    } | undefined;
    reference?: string | undefined;
    packages?: {
        dimensions: {
            weight: number;
            length: number;
            width: number;
            height: number;
        };
        category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
        description: string;
        packageType: "other" | "document" | "package" | "vehicle" | "pallet" | "bulk" | "liquid" | "furniture" | "appliance";
        value: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        };
        quantity: number;
        requiresSpecialHandling: boolean;
        barcode?: string | undefined;
        serialNumber?: string | undefined;
        specialInstructions?: string | undefined;
    }[] | undefined;
    pickupPreference?: {
        date: string;
        isFlexible: boolean;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        alternatives?: string[] | undefined;
    } | undefined;
    deliveryPreference?: {
        date: string;
        isFlexible: boolean;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        alternatives?: string[] | undefined;
    } | undefined;
    instructions?: string | undefined;
    customerNotes?: string | undefined;
}, {
    serviceType?: "express" | "standard" | "same_day" | "next_day" | "scheduled" | "white_glove" | undefined;
    specialServices?: {
        insurance?: boolean | undefined;
        coldChain?: boolean | undefined;
        fragileHandling?: boolean | undefined;
        signatureRequired?: boolean | undefined;
        ageVerification?: boolean | undefined;
        weekendDelivery?: boolean | undefined;
        appointmentDelivery?: boolean | undefined;
        assembly?: boolean | undefined;
        unpacking?: boolean | undefined;
        oldItemRemoval?: boolean | undefined;
    } | undefined;
    reference?: string | undefined;
    packages?: {
        dimensions: {
            weight: number;
            length: number;
            width: number;
            height: number;
        };
        category: "general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry";
        description: string;
        packageType: "other" | "document" | "package" | "vehicle" | "pallet" | "bulk" | "liquid" | "furniture" | "appliance";
        value: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        };
        quantity: number;
        barcode?: string | undefined;
        serialNumber?: string | undefined;
        specialInstructions?: string | undefined;
        requiresSpecialHandling?: boolean | undefined;
    }[] | undefined;
    pickupPreference?: {
        date: string;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        isFlexible?: boolean | undefined;
        alternatives?: string[] | undefined;
    } | undefined;
    deliveryPreference?: {
        date: string;
        timeSlot?: {
            startTime: string;
            endTime: string;
        } | undefined;
        isFlexible?: boolean | undefined;
        alternatives?: string[] | undefined;
    } | undefined;
    instructions?: string | undefined;
    customerNotes?: string | undefined;
}>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
export declare const createQuoteSchema: z.ZodObject<{
    shipmentId: z.ZodString;
    baseCost: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodEnum<["TRY", "USD", "EUR"]>;
    }, "strip", z.ZodTypeAny, {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    }, {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    }>;
    additionalCosts: z.ZodOptional<z.ZodObject<{
        insurance: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodEnum<["TRY", "USD", "EUR"]>;
        }, "strip", z.ZodTypeAny, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }>>;
        fuelSurcharge: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodEnum<["TRY", "USD", "EUR"]>;
        }, "strip", z.ZodTypeAny, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }>>;
        specialServices: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodEnum<["TRY", "USD", "EUR"]>;
        }, "strip", z.ZodTypeAny, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }>>;
        taxes: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodEnum<["TRY", "USD", "EUR"]>;
        }, "strip", z.ZodTypeAny, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }, {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        insurance?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        specialServices?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        fuelSurcharge?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        taxes?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
    }, {
        insurance?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        specialServices?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        fuelSurcharge?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        taxes?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
    }>>;
    serviceType: z.ZodEnum<["standard", "express", "same_day", "next_day", "scheduled", "white_glove"]>;
    estimatedPickupDate: z.ZodString;
    estimatedDeliveryDate: z.ZodString;
    transitDays: z.ZodNumber;
    termsAndConditions: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    trackingIncluded: z.ZodDefault<z.ZodBoolean>;
    insuranceIncluded: z.ZodDefault<z.ZodBoolean>;
    signatureRequired: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    serviceType: "express" | "standard" | "same_day" | "next_day" | "scheduled" | "white_glove";
    shipmentId: string;
    baseCost: {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    };
    estimatedPickupDate: string;
    estimatedDeliveryDate: string;
    validUntil: string;
    signatureRequired: boolean;
    transitDays: number;
    trackingIncluded: boolean;
    insuranceIncluded: boolean;
    notes?: string | undefined;
    additionalCosts?: {
        insurance?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        specialServices?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        fuelSurcharge?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        taxes?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
    } | undefined;
    termsAndConditions?: string | undefined;
}, {
    serviceType: "express" | "standard" | "same_day" | "next_day" | "scheduled" | "white_glove";
    shipmentId: string;
    baseCost: {
        currency: "TRY" | "USD" | "EUR";
        amount: number;
    };
    estimatedPickupDate: string;
    estimatedDeliveryDate: string;
    validUntil: string;
    transitDays: number;
    notes?: string | undefined;
    signatureRequired?: boolean | undefined;
    additionalCosts?: {
        insurance?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        specialServices?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        fuelSurcharge?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
        taxes?: {
            currency: "TRY" | "USD" | "EUR";
            amount: number;
        } | undefined;
    } | undefined;
    termsAndConditions?: string | undefined;
    trackingIncluded?: boolean | undefined;
    insuranceIncluded?: boolean | undefined;
}>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export declare const acceptQuoteSchema: z.ZodObject<{
    quoteId: z.ZodString;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quoteId: string;
    notes?: string | undefined;
    paymentMethodId?: string | undefined;
}, {
    quoteId: string;
    notes?: string | undefined;
    paymentMethodId?: string | undefined;
}>;
export type AcceptQuoteInput = z.infer<typeof acceptQuoteSchema>;
export declare const updateShipmentStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["pickup_scheduled", "picked_up", "in_transit", "out_for_delivery", "delivered", "delivery_failed", "returned", "cancelled"]>;
    location: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        coordinates: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
        }, {
            latitude: number;
            longitude: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }, {
        name: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }>>;
    description: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    signature: z.ZodOptional<z.ZodString>;
    contactPerson: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone: string;
        name: string;
        email?: string | undefined;
    }, {
        phone: string;
        name: string;
        email?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "returned" | "pickup_scheduled" | "delivery_failed" | "cancelled";
    signature?: string | undefined;
    timestamp?: string | undefined;
    location?: {
        name: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    } | undefined;
    images?: string[] | undefined;
    description?: string | undefined;
    contactPerson?: {
        phone: string;
        name: string;
        email?: string | undefined;
    } | undefined;
}, {
    status: "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "returned" | "pickup_scheduled" | "delivery_failed" | "cancelled";
    signature?: string | undefined;
    timestamp?: string | undefined;
    location?: {
        name: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        } | undefined;
    } | undefined;
    images?: string[] | undefined;
    description?: string | undefined;
    contactPerson?: {
        phone: string;
        name: string;
        email?: string | undefined;
    } | undefined;
}>;
export type UpdateShipmentStatusInput = z.infer<typeof updateShipmentStatusSchema>;
export declare const shipmentSearchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodArray<z.ZodEnum<["draft", "pending_quotes", "quotes_received", "carrier_selected", "payment_pending", "payment_completed", "pickup_scheduled", "picked_up", "in_transit", "out_for_delivery", "delivered", "delivery_failed", "returned", "cancelled", "dispute", "refunded"]>, "many">>;
    serviceType: z.ZodOptional<z.ZodArray<z.ZodEnum<["standard", "express", "same_day", "next_day", "scheduled", "white_glove"]>, "many">>;
    category: z.ZodOptional<z.ZodArray<z.ZodEnum<["general", "food", "pharmaceutical", "electronics", "textile", "automotive", "construction", "chemical", "hazardous", "fragile", "frozen", "fresh", "livestock", "artwork", "jewelry", "documents"]>, "many">>;
    carrierId: z.ZodOptional<z.ZodString>;
    senderId: z.ZodOptional<z.ZodString>;
    recipientId: z.ZodOptional<z.ZodString>;
    pickupCity: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    deliveryCity: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dateRange: z.ZodOptional<z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        endDate: string;
    }, {
        startDate: string;
        endDate: string;
    }>>;
    valueRange: z.ZodOptional<z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
        currency: z.ZodDefault<z.ZodEnum<["TRY", "USD", "EUR"]>>;
    }, "strip", z.ZodTypeAny, {
        currency: "TRY" | "USD" | "EUR";
        min: number;
        max: number;
    }, {
        min: number;
        max: number;
        currency?: "TRY" | "USD" | "EUR" | undefined;
    }>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "pickupDate", "deliveryDate", "totalValue"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "createdAt" | "pickupDate" | "deliveryDate" | "totalValue";
    sortOrder: "asc" | "desc";
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
    pickupCity?: string[] | undefined;
    deliveryCity?: string[] | undefined;
    serviceType?: ("express" | "standard" | "same_day" | "next_day" | "scheduled" | "white_glove")[] | undefined;
    status?: ("picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "returned" | "draft" | "pending_quotes" | "quotes_received" | "carrier_selected" | "payment_pending" | "payment_completed" | "pickup_scheduled" | "delivery_failed" | "cancelled" | "dispute" | "refunded")[] | undefined;
    category?: ("general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry")[] | undefined;
    recipientId?: string | undefined;
    query?: string | undefined;
    carrierId?: string | undefined;
    senderId?: string | undefined;
    valueRange?: {
        currency: "TRY" | "USD" | "EUR";
        min: number;
        max: number;
    } | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
    pickupCity?: string[] | undefined;
    deliveryCity?: string[] | undefined;
    serviceType?: ("express" | "standard" | "same_day" | "next_day" | "scheduled" | "white_glove")[] | undefined;
    status?: ("picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "returned" | "draft" | "pending_quotes" | "quotes_received" | "carrier_selected" | "payment_pending" | "payment_completed" | "pickup_scheduled" | "delivery_failed" | "cancelled" | "dispute" | "refunded")[] | undefined;
    category?: ("general" | "fragile" | "hazardous" | "documents" | "food" | "pharmaceutical" | "electronics" | "textile" | "automotive" | "construction" | "chemical" | "frozen" | "fresh" | "livestock" | "artwork" | "jewelry")[] | undefined;
    recipientId?: string | undefined;
    query?: string | undefined;
    carrierId?: string | undefined;
    senderId?: string | undefined;
    valueRange?: {
        min: number;
        max: number;
        currency?: "TRY" | "USD" | "EUR" | undefined;
    } | undefined;
    sortBy?: "createdAt" | "pickupDate" | "deliveryDate" | "totalValue" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type ShipmentSearchInput = z.infer<typeof shipmentSearchSchema>;
export declare const rateShipmentSchema: z.ZodObject<{
    rating: z.ZodNumber;
    review: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodObject<{
        communication: z.ZodOptional<z.ZodNumber>;
        punctuality: z.ZodOptional<z.ZodNumber>;
        handling: z.ZodOptional<z.ZodNumber>;
        value: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        value?: number | undefined;
        communication?: number | undefined;
        punctuality?: number | undefined;
        handling?: number | undefined;
    }, {
        value?: number | undefined;
        communication?: number | undefined;
        punctuality?: number | undefined;
        handling?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    review?: string | undefined;
    categories?: {
        value?: number | undefined;
        communication?: number | undefined;
        punctuality?: number | undefined;
        handling?: number | undefined;
    } | undefined;
}, {
    rating: number;
    review?: string | undefined;
    categories?: {
        value?: number | undefined;
        communication?: number | undefined;
        punctuality?: number | undefined;
        handling?: number | undefined;
    } | undefined;
}>;
export type RateShipmentInput = z.infer<typeof rateShipmentSchema>;
export declare const scheduleDeliverySchema: z.ZodObject<{
    preferredDate: z.ZodString;
    timeSlot: z.ZodObject<{
        startTime: z.ZodString;
        endTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startTime: string;
        endTime: string;
    }, {
        startTime: string;
        endTime: string;
    }>;
    specialInstructions: z.ZodOptional<z.ZodString>;
    contactPerson: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        phone: string;
        name: string;
    }, {
        phone: string;
        name: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    timeSlot: {
        startTime: string;
        endTime: string;
    };
    preferredDate: string;
    specialInstructions?: string | undefined;
    contactPerson?: {
        phone: string;
        name: string;
    } | undefined;
}, {
    timeSlot: {
        startTime: string;
        endTime: string;
    };
    preferredDate: string;
    specialInstructions?: string | undefined;
    contactPerson?: {
        phone: string;
        name: string;
    } | undefined;
}>;
export type ScheduleDeliveryInput = z.infer<typeof scheduleDeliverySchema>;
export declare const cancelShipmentSchema: z.ZodObject<{
    reason: z.ZodEnum<["customer_request", "address_change", "wrong_information", "payment_issue", "carrier_unavailable", "weather_conditions", "force_majeure", "other"]>;
    description: z.ZodOptional<z.ZodString>;
    refundRequested: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    reason: "other" | "customer_request" | "address_change" | "wrong_information" | "payment_issue" | "carrier_unavailable" | "weather_conditions" | "force_majeure";
    refundRequested: boolean;
    description?: string | undefined;
}, {
    reason: "other" | "customer_request" | "address_change" | "wrong_information" | "payment_issue" | "carrier_unavailable" | "weather_conditions" | "force_majeure";
    description?: string | undefined;
    refundRequested?: boolean | undefined;
}>;
export type CancelShipmentInput = z.infer<typeof cancelShipmentSchema>;
//# sourceMappingURL=shipment.schemas.d.ts.map