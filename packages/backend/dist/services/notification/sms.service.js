"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSService = void 0;
const logger_1 = __importDefault(require("../../utils/logger"));
const environment_1 = require("../../config/environment");
class NetGSMProvider {
    name = 'NetGSM';
    apiUrl = 'https://api.netgsm.com.tr/sms/send/get';
    username;
    password;
    header;
    constructor() {
        this.username = process.env.NETGSM_USERNAME || '';
        this.password = process.env.NETGSM_PASSWORD || '';
        this.header = process.env.NETGSM_HEADER || 'CARGOLINK';
    }
    isAvailable() {
        return !!(this.username && this.password);
    }
    async sendSMS(request) {
        if (!this.isAvailable()) {
            throw new Error('NetGSM credentials not configured');
        }
        try {
            const params = new URLSearchParams({
                usercode: this.username,
                password: this.password,
                gsmno: this.formatPhoneNumber(request.phoneNumber),
                message: request.message,
                msgheader: this.header,
                filter: '0'
            });
            const response = await fetch(`${this.apiUrl}?${params.toString()}`);
            const result = await response.text();
            if (result.startsWith('00') || result.startsWith('01')) {
                const messageId = result.split(' ')[1];
                return {
                    success: true,
                    messageId,
                    provider: this.name
                };
            }
            return {
                success: false,
                error: this.getErrorMessage(result),
                provider: this.name
            };
        }
        catch (error) {
            logger_1.default.error('NetGSM SMS error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                provider: this.name
            };
        }
    }
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('90')) {
            return cleaned;
        }
        if (cleaned.startsWith('0')) {
            return '90' + cleaned.substring(1);
        }
        return '90' + cleaned;
    }
    getErrorMessage(code) {
        const errorCodes = {
            '20': 'Message text not found',
            '30': 'Invalid username or password',
            '40': 'SMS header not found',
            '50': 'Phone number not found',
            '51': 'Invalid phone number format',
            '70': 'Insufficient balance',
            '85': 'Invalid character in message'
        };
        return errorCodes[code] || `Unknown error: ${code}`;
    }
}
class TwilioProvider {
    name = 'Twilio';
    accountSid;
    authToken;
    fromNumber;
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
        this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
        this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';
    }
    isAvailable() {
        return !!(this.accountSid && this.authToken && this.fromNumber);
    }
    async sendSMS(request) {
        if (!this.isAvailable()) {
            throw new Error('Twilio credentials not configured');
        }
        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
            const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
            const params = new URLSearchParams({
                To: request.phoneNumber,
                From: this.fromNumber,
                Body: request.message
            });
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });
            const result = await response.json();
            if (response.ok) {
                return {
                    success: true,
                    messageId: result.sid,
                    provider: this.name,
                    cost: parseFloat(result.price || '0')
                };
            }
            return {
                success: false,
                error: result.message || 'Twilio API error',
                provider: this.name
            };
        }
        catch (error) {
            logger_1.default.error('Twilio SMS error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                provider: this.name
            };
        }
    }
}
class MockProvider {
    name = 'Mock';
    isAvailable() {
        return environment_1.config.nodeEnv === 'test' || environment_1.config.nodeEnv === 'development';
    }
    async sendSMS(request) {
        logger_1.default.info(`Mock SMS to ${request.phoneNumber}: ${request.message}`);
        return {
            success: true,
            messageId: `mock_${Date.now()}`,
            provider: this.name
        };
    }
}
class SMSService {
    providers = [];
    primaryProvider = null;
    constructor() {
        this.initializeProviders();
    }
    initializeProviders() {
        this.providers = [
            new NetGSMProvider(),
            new TwilioProvider(),
            new MockProvider()
        ];
        this.primaryProvider = this.providers.find(p => p.isAvailable()) || null;
        if (this.primaryProvider) {
            logger_1.default.info(`SMS Service initialized with primary provider: ${this.primaryProvider.name}`);
        }
        else {
            logger_1.default.warn('No SMS providers available');
        }
    }
    async sendSMS(request) {
        if (!this.primaryProvider) {
            throw new Error('No SMS provider available');
        }
        const startTime = Date.now();
        try {
            if (!this.isValidPhoneNumber(request.phoneNumber)) {
                throw new Error('Invalid phone number format');
            }
            if (!request.message || request.message.trim().length === 0) {
                throw new Error('SMS message cannot be empty');
            }
            if (request.message.length > 1600) {
                throw new Error('SMS message too long (max 1600 characters)');
            }
            const response = await this.primaryProvider.sendSMS(request);
            const duration = Date.now() - startTime;
            if (response.success) {
                logger_1.default.info(`SMS sent successfully via ${response.provider}`, {
                    phoneNumber: this.maskPhoneNumber(request.phoneNumber),
                    messageId: response.messageId,
                    duration,
                    provider: response.provider,
                    userId: request.userId
                });
            }
            else {
                logger_1.default.error(`SMS sending failed via ${response.provider}`, {
                    phoneNumber: this.maskPhoneNumber(request.phoneNumber),
                    error: response.error,
                    duration,
                    provider: response.provider,
                    userId: request.userId
                });
            }
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.default.error('SMS service error:', {
                phoneNumber: this.maskPhoneNumber(request.phoneNumber),
                error: error instanceof Error ? error.message : 'Unknown error',
                duration,
                userId: request.userId
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'SMS sending failed'
            };
        }
    }
    async sendBulkSMS(requests) {
        const results = [];
        const batchSize = 10;
        logger_1.default.info(`Sending bulk SMS: ${requests.length} messages`);
        for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            const batchPromises = batch.map(request => this.sendSMS(request));
            const batchResults = await Promise.allSettled(batchPromises);
            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                }
                else {
                    logger_1.default.error(`Bulk SMS batch error for ${batch[index]?.phoneNumber}:`, result.reason);
                    results.push({
                        success: false,
                        error: result.reason instanceof Error ? result.reason.message : 'Batch processing error'
                    });
                }
            });
            if (i + batchSize < requests.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        const successCount = results.filter(r => r.success).length;
        logger_1.default.info(`Bulk SMS completed: ${successCount}/${requests.length} sent successfully`);
        return results;
    }
    getStatus() {
        return {
            available: !!this.primaryProvider,
            primaryProvider: this.primaryProvider?.name || null,
            availableProviders: this.providers.filter(p => p.isAvailable()).map(p => p.name)
        };
    }
    switchProvider(providerName) {
        const provider = this.providers.find(p => p.name === providerName && p.isAvailable());
        if (provider) {
            this.primaryProvider = provider;
            logger_1.default.info(`Switched SMS provider to: ${providerName}`);
            return true;
        }
        return false;
    }
    isValidPhoneNumber(phone) {
        const turkishMobileRegex = /^(\+90|90|0)?(5\d{9})$/;
        const internationalRegex = /^\+?[1-9]\d{1,14}$/;
        return turkishMobileRegex.test(phone) || internationalRegex.test(phone);
    }
    maskPhoneNumber(phone) {
        if (phone.length <= 4)
            return phone;
        const visiblePart = phone.slice(-4);
        const hiddenPart = '*'.repeat(phone.length - 4);
        return hiddenPart + visiblePart;
    }
    static formatMessage(template, variables) {
        let message = template;
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            message = message.replace(new RegExp(placeholder, 'g'), value);
        });
        return message;
    }
    static getCharacterCount(message) {
        const gsmRegex = /^[@£$¥èéùìòÇØøÅåÆæ\nßÉ !"#¤%&'()*+,\-.\/:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà\^\{\}\\\[~\]\|€]*$/;
        const isGSM = gsmRegex.test(message);
        const encoding = isGSM ? 'GSM' : 'UCS2';
        const maxPerSMS = isGSM ? 160 : 70;
        const maxPerConcatSMS = isGSM ? 153 : 67;
        const length = message.length;
        let smsCount;
        if (length <= maxPerSMS) {
            smsCount = 1;
        }
        else {
            smsCount = Math.ceil(length / maxPerConcatSMS);
        }
        return { length, smsCount, encoding };
    }
}
exports.SMSService = SMSService;
exports.default = SMSService;
//# sourceMappingURL=sms.service.js.map