import { UserRole, AccountType } from '../types/user.types';
export declare const USER_ROLE_CONFIG: {
    readonly customer: {
        readonly label: "Müşteri";
        readonly description: "Gönderi yapan bireysel veya kurumsal müşteri";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: false;
        readonly maxShipmentsPerDay: 50;
        readonly canRate: true;
        readonly canReceivePayments: false;
    };
    readonly carrier: {
        readonly label: "Taşıyıcı";
        readonly description: "Bağımsız taşıyıcı veya şoför";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: true;
        readonly maxQuotesPerDay: 100;
        readonly canRate: true;
        readonly canReceivePayments: true;
    };
    readonly admin: {
        readonly label: "Yönetici";
        readonly description: "Platform yöneticisi - tam yetki";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: true;
        readonly maxShipmentsPerDay: -1;
        readonly canRate: false;
        readonly canReceivePayments: false;
    };
    readonly moderator: {
        readonly label: "Moderatör";
        readonly description: "İçerik moderatörü - sınırlı yönetici yetkisi";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: true;
        readonly maxShipmentsPerDay: 0;
        readonly canRate: false;
        readonly canReceivePayments: false;
    };
    readonly support: {
        readonly label: "Destek";
        readonly description: "Müşteri destek temsilcisi";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: true;
        readonly maxShipmentsPerDay: 0;
        readonly canRate: false;
        readonly canReceivePayments: false;
    };
    readonly partner: {
        readonly label: "Partner";
        readonly description: "Partner şirket temsilcisi";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: true;
        readonly maxShipmentsPerDay: 1000;
        readonly canRate: false;
        readonly canReceivePayments: true;
    };
};
export declare const ROLE_HIERARCHY: {
    readonly admin: 5;
    readonly moderator: 4;
    readonly support: 3;
    readonly partner: 2;
    readonly carrier: 1;
    readonly customer: 0;
};
export declare const DEFAULT_PREFERENCES_BY_ROLE: {
    readonly customer: {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: true;
            readonly sms: false;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: false;
            readonly showHistory: false;
        };
        readonly theme: "auto";
    };
    readonly carrier: {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: true;
            readonly sms: true;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: true;
            readonly showHistory: true;
        };
        readonly theme: "auto";
    };
    readonly admin: {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: true;
            readonly sms: false;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: false;
            readonly showHistory: false;
        };
        readonly theme: "light";
    };
    readonly moderator: {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: true;
            readonly sms: false;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: false;
            readonly showHistory: false;
        };
        readonly theme: "light";
    };
    readonly support: {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: true;
            readonly sms: false;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: false;
            readonly showHistory: false;
        };
        readonly theme: "light";
    };
    readonly partner: {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: false;
            readonly sms: false;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: false;
            readonly showHistory: false;
        };
        readonly theme: "light";
    };
};
export declare const ROLE_LIMITS: {
    readonly customer: {
        readonly maxAddresses: 10;
        readonly maxActiveShipments: 20;
        readonly maxFileSizeMB: 10;
        readonly maxFilesPerShipment: 5;
        readonly dailyApiCalls: 100;
    };
    readonly carrier: {
        readonly maxVehicles: 5;
        readonly maxActiveQuotes: 50;
        readonly maxFileSizeMB: 25;
        readonly maxFilesPerShipment: 10;
        readonly dailyApiCalls: 500;
    };
    readonly admin: {
        readonly maxAddresses: -1;
        readonly maxActiveShipments: -1;
        readonly maxFileSizeMB: 100;
        readonly maxFilesPerShipment: 50;
        readonly dailyApiCalls: -1;
    };
    readonly moderator: {
        readonly maxAddresses: 5;
        readonly maxActiveShipments: 0;
        readonly maxFileSizeMB: 50;
        readonly maxFilesPerShipment: 20;
        readonly dailyApiCalls: 1000;
    };
    readonly support: {
        readonly maxAddresses: 5;
        readonly maxActiveShipments: 0;
        readonly maxFileSizeMB: 50;
        readonly maxFilesPerShipment: 20;
        readonly dailyApiCalls: 1000;
    };
    readonly partner: {
        readonly maxAddresses: 50;
        readonly maxActiveShipments: 100;
        readonly maxFileSizeMB: 50;
        readonly maxFilesPerShipment: 20;
        readonly dailyApiCalls: 10000;
    };
};
export declare const RoleHelpers: {
    readonly hasPermission: (userRole: UserRole, permission: string) => boolean;
    readonly isHigherRole: (roleA: UserRole, roleB: UserRole) => boolean;
    readonly getPermissions: (role: UserRole) => string[];
    readonly getRoleConfig: (role: UserRole) => {
        readonly label: "Müşteri";
        readonly description: "Gönderi yapan bireysel veya kurumsal müşteri";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: false;
        readonly maxShipmentsPerDay: 50;
        readonly canRate: true;
        readonly canReceivePayments: false;
    } | {
        readonly label: "Taşıyıcı";
        readonly description: "Bağımsız taşıyıcı veya şoför";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: true;
        readonly maxQuotesPerDay: 100;
        readonly canRate: true;
        readonly canReceivePayments: true;
    } | {
        readonly label: "Yönetici";
        readonly description: "Platform yöneticisi - tam yetki";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: true;
        readonly maxShipmentsPerDay: -1;
        readonly canRate: false;
        readonly canReceivePayments: false;
    } | {
        readonly label: "Moderatör";
        readonly description: "İçerik moderatörü - sınırlı yönetici yetkisi";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: true;
        readonly maxShipmentsPerDay: 0;
        readonly canRate: false;
        readonly canReceivePayments: false;
    } | {
        readonly label: "Destek";
        readonly description: "Müşteri destek temsilcisi";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: true;
        readonly maxShipmentsPerDay: 0;
        readonly canRate: false;
        readonly canReceivePayments: false;
    } | {
        readonly label: "Partner";
        readonly description: "Partner şirket temsilcisi";
        readonly permissions: string[];
        readonly accountTypes: AccountType[];
        readonly defaultAccountType: AccountType;
        readonly requiresVerification: true;
        readonly maxShipmentsPerDay: 1000;
        readonly canRate: false;
        readonly canReceivePayments: true;
    };
    readonly requiresVerification: (role: UserRole) => boolean;
    readonly getDefaultPreferences: (role: UserRole) => {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: true;
            readonly sms: false;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: false;
            readonly showHistory: false;
        };
        readonly theme: "auto";
    } | {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: true;
            readonly sms: true;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: true;
            readonly showHistory: true;
        };
        readonly theme: "auto";
    } | {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: true;
            readonly sms: false;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: false;
            readonly showHistory: false;
        };
        readonly theme: "light";
    } | {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: true;
            readonly sms: false;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: false;
            readonly showHistory: false;
        };
        readonly theme: "light";
    } | {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: true;
            readonly sms: false;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: false;
            readonly showHistory: false;
        };
        readonly theme: "light";
    } | {
        readonly language: "tr";
        readonly currency: "TRY";
        readonly notifications: {
            readonly email: true;
            readonly push: false;
            readonly sms: false;
            readonly marketing: false;
        };
        readonly privacy: {
            readonly showProfile: false;
            readonly showHistory: false;
        };
        readonly theme: "light";
    };
    readonly getRoleLimits: (role: UserRole) => {
        readonly maxAddresses: 10;
        readonly maxActiveShipments: 20;
        readonly maxFileSizeMB: 10;
        readonly maxFilesPerShipment: 5;
        readonly dailyApiCalls: 100;
    } | {
        readonly maxVehicles: 5;
        readonly maxActiveQuotes: 50;
        readonly maxFileSizeMB: 25;
        readonly maxFilesPerShipment: 10;
        readonly dailyApiCalls: 500;
    } | {
        readonly maxAddresses: -1;
        readonly maxActiveShipments: -1;
        readonly maxFileSizeMB: 100;
        readonly maxFilesPerShipment: 50;
        readonly dailyApiCalls: -1;
    } | {
        readonly maxAddresses: 5;
        readonly maxActiveShipments: 0;
        readonly maxFileSizeMB: 50;
        readonly maxFilesPerShipment: 20;
        readonly dailyApiCalls: 1000;
    } | {
        readonly maxAddresses: 5;
        readonly maxActiveShipments: 0;
        readonly maxFileSizeMB: 50;
        readonly maxFilesPerShipment: 20;
        readonly dailyApiCalls: 1000;
    } | {
        readonly maxAddresses: 50;
        readonly maxActiveShipments: 100;
        readonly maxFileSizeMB: 50;
        readonly maxFilesPerShipment: 20;
        readonly dailyApiCalls: 10000;
    };
    readonly isAccountTypeAllowed: (role: UserRole, accountType: AccountType) => boolean;
};
export declare const ROLE_DISPLAY: {
    readonly customer: {
        readonly color: "blue";
        readonly icon: "user";
        readonly badge: false;
    };
    readonly carrier: {
        readonly color: "green";
        readonly icon: "truck";
        readonly badge: true;
    };
    readonly admin: {
        readonly color: "red";
        readonly icon: "shield";
        readonly badge: true;
    };
    readonly moderator: {
        readonly color: "orange";
        readonly icon: "eye";
        readonly badge: true;
    };
    readonly support: {
        readonly color: "purple";
        readonly icon: "headphones";
        readonly badge: true;
    };
    readonly partner: {
        readonly color: "indigo";
        readonly icon: "building";
        readonly badge: true;
    };
};
//# sourceMappingURL=user-roles.d.ts.map