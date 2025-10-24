"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_DISPLAY = exports.RoleHelpers = exports.ROLE_LIMITS = exports.DEFAULT_PREFERENCES_BY_ROLE = exports.ROLE_HIERARCHY = exports.USER_ROLE_CONFIG = void 0;
exports.USER_ROLE_CONFIG = {
    customer: {
        label: 'Müşteri',
        description: 'Gönderi yapan bireysel veya kurumsal müşteri',
        permissions: [
            'shipments.create',
            'shipments.view_own',
            'shipments.update_own',
            'shipments.cancel_own',
            'quotes.view',
            'quotes.accept',
            'addresses.manage',
            'profile.update',
            'payments.manage',
            'reviews.create'
        ],
        accountTypes: ['individual', 'business'],
        defaultAccountType: 'individual',
        requiresVerification: false,
        maxShipmentsPerDay: 50,
        canRate: true,
        canReceivePayments: false
    },
    carrier: {
        label: 'Taşıyıcı',
        description: 'Bağımsız taşıyıcı veya şoför',
        permissions: [
            'quotes.create',
            'quotes.view_own',
            'quotes.update_own',
            'shipments.view_assigned',
            'shipments.update_status',
            'shipments.pickup',
            'shipments.deliver',
            'tracking.update',
            'profile.update',
            'vehicles.manage',
            'earnings.view',
            'reviews.respond'
        ],
        accountTypes: ['individual', 'business'],
        defaultAccountType: 'individual',
        requiresVerification: true,
        maxQuotesPerDay: 100,
        canRate: true,
        canReceivePayments: true
    },
    admin: {
        label: 'Yönetici',
        description: 'Platform yöneticisi - tam yetki',
        permissions: [
            'all.read',
            'all.write',
            'all.delete',
            'users.manage',
            'carriers.verify',
            'shipments.manage',
            'payments.manage',
            'disputes.resolve',
            'reports.view',
            'system.configure'
        ],
        accountTypes: ['business'],
        defaultAccountType: 'business',
        requiresVerification: true,
        maxShipmentsPerDay: -1,
        canRate: false,
        canReceivePayments: false
    },
    moderator: {
        label: 'Moderatör',
        description: 'İçerik moderatörü - sınırlı yönetici yetkisi',
        permissions: [
            'users.view',
            'users.moderate',
            'shipments.view',
            'reviews.moderate',
            'disputes.view',
            'reports.create',
            'content.moderate'
        ],
        accountTypes: ['business'],
        defaultAccountType: 'business',
        requiresVerification: true,
        maxShipmentsPerDay: 0,
        canRate: false,
        canReceivePayments: false
    },
    support: {
        label: 'Destek',
        description: 'Müşteri destek temsilcisi',
        permissions: [
            'users.view',
            'shipments.view',
            'shipments.update_status',
            'quotes.view',
            'disputes.view',
            'disputes.comment',
            'reviews.view',
            'tickets.manage',
            'refunds.initiate'
        ],
        accountTypes: ['business'],
        defaultAccountType: 'business',
        requiresVerification: true,
        maxShipmentsPerDay: 0,
        canRate: false,
        canReceivePayments: false
    },
    partner: {
        label: 'Partner',
        description: 'Partner şirket temsilcisi',
        permissions: [
            'shipments.view_partner',
            'quotes.create_partner',
            'carriers.view_partner',
            'reports.view_partner',
            'integration.manage',
            'api.access'
        ],
        accountTypes: ['business'],
        defaultAccountType: 'business',
        requiresVerification: true,
        maxShipmentsPerDay: 1000,
        canRate: false,
        canReceivePayments: true
    }
};
exports.ROLE_HIERARCHY = {
    admin: 5,
    moderator: 4,
    support: 3,
    partner: 2,
    carrier: 1,
    customer: 0
};
exports.DEFAULT_PREFERENCES_BY_ROLE = {
    customer: {
        language: 'tr',
        currency: 'TRY',
        notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false
        },
        privacy: {
            showProfile: false,
            showHistory: false
        },
        theme: 'auto'
    },
    carrier: {
        language: 'tr',
        currency: 'TRY',
        notifications: {
            email: true,
            push: true,
            sms: true,
            marketing: false
        },
        privacy: {
            showProfile: true,
            showHistory: true
        },
        theme: 'auto'
    },
    admin: {
        language: 'tr',
        currency: 'TRY',
        notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false
        },
        privacy: {
            showProfile: false,
            showHistory: false
        },
        theme: 'light'
    },
    moderator: {
        language: 'tr',
        currency: 'TRY',
        notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false
        },
        privacy: {
            showProfile: false,
            showHistory: false
        },
        theme: 'light'
    },
    support: {
        language: 'tr',
        currency: 'TRY',
        notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false
        },
        privacy: {
            showProfile: false,
            showHistory: false
        },
        theme: 'light'
    },
    partner: {
        language: 'tr',
        currency: 'TRY',
        notifications: {
            email: true,
            push: false,
            sms: false,
            marketing: false
        },
        privacy: {
            showProfile: false,
            showHistory: false
        },
        theme: 'light'
    }
};
exports.ROLE_LIMITS = {
    customer: {
        maxAddresses: 10,
        maxActiveShipments: 20,
        maxFileSizeMB: 10,
        maxFilesPerShipment: 5,
        dailyApiCalls: 100
    },
    carrier: {
        maxVehicles: 5,
        maxActiveQuotes: 50,
        maxFileSizeMB: 25,
        maxFilesPerShipment: 10,
        dailyApiCalls: 500
    },
    admin: {
        maxAddresses: -1,
        maxActiveShipments: -1,
        maxFileSizeMB: 100,
        maxFilesPerShipment: 50,
        dailyApiCalls: -1
    },
    moderator: {
        maxAddresses: 5,
        maxActiveShipments: 0,
        maxFileSizeMB: 50,
        maxFilesPerShipment: 20,
        dailyApiCalls: 1000
    },
    support: {
        maxAddresses: 5,
        maxActiveShipments: 0,
        maxFileSizeMB: 50,
        maxFilesPerShipment: 20,
        dailyApiCalls: 1000
    },
    partner: {
        maxAddresses: 50,
        maxActiveShipments: 100,
        maxFileSizeMB: 50,
        maxFilesPerShipment: 20,
        dailyApiCalls: 10000
    }
};
exports.RoleHelpers = {
    hasPermission(userRole, permission) {
        return exports.USER_ROLE_CONFIG[userRole].permissions.includes(permission) ||
            exports.USER_ROLE_CONFIG[userRole].permissions.includes('all.read') ||
            exports.USER_ROLE_CONFIG[userRole].permissions.includes('all.write');
    },
    isHigherRole(roleA, roleB) {
        return exports.ROLE_HIERARCHY[roleA] > exports.ROLE_HIERARCHY[roleB];
    },
    getPermissions(role) {
        return exports.USER_ROLE_CONFIG[role].permissions;
    },
    getRoleConfig(role) {
        return exports.USER_ROLE_CONFIG[role];
    },
    requiresVerification(role) {
        return exports.USER_ROLE_CONFIG[role].requiresVerification;
    },
    getDefaultPreferences(role) {
        return exports.DEFAULT_PREFERENCES_BY_ROLE[role];
    },
    getRoleLimits(role) {
        return exports.ROLE_LIMITS[role];
    },
    isAccountTypeAllowed(role, accountType) {
        return exports.USER_ROLE_CONFIG[role].accountTypes.includes(accountType);
    }
};
exports.ROLE_DISPLAY = {
    customer: {
        color: 'blue',
        icon: 'user',
        badge: false
    },
    carrier: {
        color: 'green',
        icon: 'truck',
        badge: true
    },
    admin: {
        color: 'red',
        icon: 'shield',
        badge: true
    },
    moderator: {
        color: 'orange',
        icon: 'eye',
        badge: true
    },
    support: {
        color: 'purple',
        icon: 'headphones',
        badge: true
    },
    partner: {
        color: 'indigo',
        icon: 'building',
        badge: true
    }
};
//# sourceMappingURL=user-roles.js.map