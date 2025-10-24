/**
 * String formatting utilities
 */
export const StringFormatters = {
  /**
   * Capitalize first letter of each word
   */
  toTitleCase: (str: string): string => {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  /**
   * Convert to snake_case
   */
  toSnakeCase: (str: string): string => {
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
  },

  /**
   * Convert to kebab-case
   */
  toKebabCase: (str: string): string => {
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-');
  },

  /**
   * Convert to camelCase
   */
  toCamelCase: (str: string): string => {
    return str
      .replace(/\W+(.)/g, (match, chr) => chr.toUpperCase())
      .replace(/^\w/, c => c.toLowerCase());
  },

  /**
   * Truncate string with ellipsis
   */
  truncate: (str: string, length: number): string => {
    return str.length > length ? `${str.substring(0, length)}...` : str;
  },

  /**
   * Mask sensitive information
   */
  maskEmail: (email: string): string => {
    const [username, domain] = email.split('@');
    if (!username || !domain) {
      return email; // Return original if invalid format
    }
    if (username.length < 3) {
      return email; // Don't mask if username too short
    }
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  },

  /**
   * Mask phone number
   */
  maskPhone: (phone: string): string => {
    return phone.replace(/(\+90)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1$2***$4$5');
  },

  /**
   * Mask credit card number
   */
  maskCardNumber: (cardNumber: string): string => {
    return cardNumber.replace(/\d{4}(?=\d{4})/g, '****');
  },

  /**
   * Generate initials from name
   */
  getInitials: (fullName: string): string => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  /**
   * Remove Turkish characters
   */
  removeTurkishChars: (str: string): string => {
    const turkishChars = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };
    
    return str.replace(/[çğıöşüÇĞİÖŞÜ]/g, (char) => turkishChars[char as keyof typeof turkishChars] || char);
  }
};

/**
 * Number formatting utilities
 */
export const NumberFormatters = {
  /**
   * Format currency
   */
  currency: (amount: number, currency: 'TRY' | 'USD' | 'EUR' = 'TRY'): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Format percentage
   */
  percentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * Format file size
   */
  fileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  },

  /**
   * Format weight (kg to user-friendly format)
   */
  weight: (kg: number): string => {
    if (kg < 1) {
      return `${Math.round(kg * 1000)} g`;
    }
    return `${kg} kg`;
  },

  /**
   * Format distance
   */
  distance: (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${Math.round(meters / 1000 * 100) / 100} km`;
  },

  /**
   * Format large numbers with K, M, B suffixes
   */
  compact: (num: number): string => {
    if (num >= 1e9) return `${Math.round(num / 1e9 * 10) / 10}B`;
    if (num >= 1e6) return `${Math.round(num / 1e6 * 10) / 10}M`;
    if (num >= 1e3) return `${Math.round(num / 1e3 * 10) / 10}K`;
    return num.toString();
  }
};

/**
 * Date formatting utilities
 */
export const DateFormatters = {
  /**
   * Format date for Turkish locale
   */
  turkish: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Format date with time
   */
  dateTime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format time only
   */
  time: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  relative: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    
    return DateFormatters.turkish(d);
  },

  /**
   * Format duration in milliseconds to human readable
   */
  duration: (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün`;
    if (hours > 0) return `${hours} saat`;
    if (minutes > 0) return `${minutes} dakika`;
    return `${seconds} saniye`;
  },

  /**
   * Check if date is today
   */
  isToday: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.toDateString() === today.toDateString();
  },

  /**
   * Check if date is in business hours
   */
  isBusinessHours: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = d.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = d.getHours();
    
    // Monday to Friday, 9 AM to 6 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 18;
  }
};

/**
 * Address formatting utilities
 */
export const AddressFormatters = {
  /**
   * Format full address
   */
  full: (address: {
    addressLine1: string;
    addressLine2?: string;
    neighborhood?: string;
    district: string;
    city: string;
    postalCode: string;
  }): string => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.neighborhood,
      address.district,
      address.city,
      address.postalCode,
    ].filter(Boolean);
    
    return parts.join(', ');
  },

  /**
   * Format short address (city, district)
   */
  short: (address: { district: string; city: string }): string => {
    return `${address.district}, ${address.city}`;
  },

  /**
   * Format postal address
   */
  postal: (address: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    district: string;
    city: string;
    postalCode: string;
  }): string => {
    const lines = [
      `${address.firstName} ${address.lastName}`,
      address.company,
      address.addressLine1,
      address.addressLine2,
      `${address.district} ${address.city}`,
      address.postalCode,
    ].filter(Boolean);
    
    return lines.join('\n');
  }
};

export default {
  string: StringFormatters,
  number: NumberFormatters,
  date: DateFormatters,
  address: AddressFormatters,
};