"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressFormatters = exports.DateFormatters = exports.NumberFormatters = exports.StringFormatters = void 0;
exports.StringFormatters = {
    toTitleCase: (str) => {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    },
    toSnakeCase: (str) => {
        return str
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('_');
    },
    toKebabCase: (str) => {
        return str
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('-');
    },
    toCamelCase: (str) => {
        return str
            .replace(/\W+(.)/g, (match, chr) => chr.toUpperCase())
            .replace(/^\w/, c => c.toLowerCase());
    },
    truncate: (str, length) => {
        return str.length > length ? `${str.substring(0, length)}...` : str;
    },
    maskEmail: (email) => {
        const [username, domain] = email.split('@');
        if (!username || !domain) {
            return email;
        }
        if (username.length < 3) {
            return email;
        }
        const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
        return `${maskedUsername}@${domain}`;
    },
    maskPhone: (phone) => {
        return phone.replace(/(\+90)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1$2***$4$5');
    },
    maskCardNumber: (cardNumber) => {
        return cardNumber.replace(/\d{4}(?=\d{4})/g, '****');
    },
    getInitials: (fullName) => {
        return fullName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },
    removeTurkishChars: (str) => {
        const turkishChars = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
        };
        return str.replace(/[çğıöşüÇĞİÖŞÜ]/g, (char) => turkishChars[char] || char);
    }
};
exports.NumberFormatters = {
    currency: (amount, currency = 'TRY') => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    },
    percentage: (value, decimals = 1) => {
        return `${(value * 100).toFixed(decimals)}%`;
    },
    fileSize: (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0)
            return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
    },
    weight: (kg) => {
        if (kg < 1) {
            return `${Math.round(kg * 1000)} g`;
        }
        return `${kg} kg`;
    },
    distance: (meters) => {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${Math.round(meters / 1000 * 100) / 100} km`;
    },
    compact: (num) => {
        if (num >= 1e9)
            return `${Math.round(num / 1e9 * 10) / 10}B`;
        if (num >= 1e6)
            return `${Math.round(num / 1e6 * 10) / 10}M`;
        if (num >= 1e3)
            return `${Math.round(num / 1e3 * 10) / 10}K`;
        return num.toString();
    }
};
exports.DateFormatters = {
    turkish: (date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    },
    dateTime: (date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    },
    time: (date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    },
    relative: (date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (diffInSeconds < 60)
            return 'Az önce';
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)} dakika önce`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)} saat önce`;
        if (diffInSeconds < 604800)
            return `${Math.floor(diffInSeconds / 86400)} gün önce`;
        return exports.DateFormatters.turkish(d);
    },
    duration: (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0)
            return `${days} gün`;
        if (hours > 0)
            return `${hours} saat`;
        if (minutes > 0)
            return `${minutes} dakika`;
        return `${seconds} saniye`;
    },
    isToday: (date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const today = new Date();
        return d.toDateString() === today.toDateString();
    },
    isBusinessHours: (date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const day = d.getDay();
        const hour = d.getHours();
        return day >= 1 && day <= 5 && hour >= 9 && hour <= 18;
    }
};
exports.AddressFormatters = {
    full: (address) => {
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
    short: (address) => {
        return `${address.district}, ${address.city}`;
    },
    postal: (address) => {
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
exports.default = {
    string: exports.StringFormatters,
    number: exports.NumberFormatters,
    date: exports.DateFormatters,
    address: exports.AddressFormatters,
};
//# sourceMappingURL=formatters.js.map