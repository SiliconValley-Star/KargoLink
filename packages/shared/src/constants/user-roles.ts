import { UserRole, AccountType } from '../types/user.types';

/**
 * User role definitions with permissions and capabilities
 */
export const USER_ROLE_CONFIG = {
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
    ] as string[],
    accountTypes: ['individual', 'business'] as AccountType[],
    defaultAccountType: 'individual' as AccountType,
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
    ] as string[],
    accountTypes: ['individual', 'business'] as AccountType[],
    defaultAccountType: 'individual' as AccountType,
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
    ] as string[],
    accountTypes: ['business'] as AccountType[],
    defaultAccountType: 'business' as AccountType,
    requiresVerification: true,
    maxShipmentsPerDay: -1, // unlimited
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
    ] as string[],
    accountTypes: ['business'] as AccountType[],
    defaultAccountType: 'business' as AccountType,
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
    ] as string[],
    accountTypes: ['business'] as AccountType[],
    defaultAccountType: 'business' as AccountType,
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
    ] as string[],
    accountTypes: ['business'] as AccountType[],
    defaultAccountType: 'business' as AccountType,
    requiresVerification: true,
    maxShipmentsPerDay: 1000,
    canRate: false,
    canReceivePayments: true
  }
} as const;

/**
 * Role hierarchy for permission inheritance
 */
export const ROLE_HIERARCHY = {
  admin: 5,
  moderator: 4,
  support: 3,
  partner: 2,
  carrier: 1,
  customer: 0
} as const;

/**
 * Default user preferences by role
 */
export const DEFAULT_PREFERENCES_BY_ROLE = {
  customer: {
    language: 'tr' as const,
    currency: 'TRY' as const,
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
    theme: 'auto' as const
  },
  
  carrier: {
    language: 'tr' as const,
    currency: 'TRY' as const,
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
    theme: 'auto' as const
  },
  
  admin: {
    language: 'tr' as const,
    currency: 'TRY' as const,
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
    theme: 'light' as const
  },
  
  moderator: {
    language: 'tr' as const,
    currency: 'TRY' as const,
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
    theme: 'light' as const
  },
  
  support: {
    language: 'tr' as const,
    currency: 'TRY' as const,
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
    theme: 'light' as const
  },
  
  partner: {
    language: 'tr' as const,
    currency: 'TRY' as const,
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
    theme: 'light' as const
  }
} as const;

/**
 * Role-based limits and quotas
 */
export const ROLE_LIMITS = {
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
    maxAddresses: -1, // unlimited
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
} as const;

/**
 * Helper functions for role management
 */
export const RoleHelpers = {
  /**
   * Check if user has specific permission
   */
  hasPermission(userRole: UserRole, permission: string): boolean {
    return USER_ROLE_CONFIG[userRole].permissions.includes(permission) ||
           USER_ROLE_CONFIG[userRole].permissions.includes('all.read') ||
           USER_ROLE_CONFIG[userRole].permissions.includes('all.write');
  },
  
  /**
   * Check if role A has higher hierarchy than role B
   */
  isHigherRole(roleA: UserRole, roleB: UserRole): boolean {
    return ROLE_HIERARCHY[roleA] > ROLE_HIERARCHY[roleB];
  },
  
  /**
   * Get all permissions for a role
   */
  getPermissions(role: UserRole): string[] {
    return USER_ROLE_CONFIG[role].permissions;
  },
  
  /**
   * Get role configuration
   */
  getRoleConfig(role: UserRole) {
    return USER_ROLE_CONFIG[role];
  },
  
  /**
   * Check if role requires verification
   */
  requiresVerification(role: UserRole): boolean {
    return USER_ROLE_CONFIG[role].requiresVerification;
  },
  
  /**
   * Get default preferences for role
   */
  getDefaultPreferences(role: UserRole) {
    return DEFAULT_PREFERENCES_BY_ROLE[role];
  },
  
  /**
   * Get role limits
   */
  getRoleLimits(role: UserRole) {
    return ROLE_LIMITS[role];
  },
  
  /**
   * Check if account type is allowed for role
   */
  isAccountTypeAllowed(role: UserRole, accountType: AccountType): boolean {
    return USER_ROLE_CONFIG[role].accountTypes.includes(accountType);
  }
} as const;

/**
 * Role display information for UI
 */
export const ROLE_DISPLAY = {
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
} as const;