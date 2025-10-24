import logger from '../../utils/logger';
import { config } from '../../config/environment';

export interface SMSRequest {
  phoneNumber: string;
  message: string;
  userId?: string;
  reference?: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
  cost?: number;
}

export interface SMSProvider {
  name: string;
  sendSMS: (request: SMSRequest) => Promise<SMSResponse>;
  isAvailable: () => boolean;
}

/**
 * NetGSM SMS Provider
 */
class NetGSMProvider implements SMSProvider {
  name = 'NetGSM';
  private apiUrl = 'https://api.netgsm.com.tr/sms/send/get';
  private username: string;
  private password: string;
  private header: string;

  constructor() {
    this.username = process.env.NETGSM_USERNAME || '';
    this.password = process.env.NETGSM_PASSWORD || '';
    this.header = process.env.NETGSM_HEADER || 'CARGOLINK';
  }

  isAvailable(): boolean {
    return !!(this.username && this.password);
  }

  async sendSMS(request: SMSRequest): Promise<SMSResponse> {
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
    } catch (error) {
      logger.error('NetGSM SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name
      };
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove non-digits and ensure Turkish format
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('90')) {
      return cleaned;
    }
    if (cleaned.startsWith('0')) {
      return '90' + cleaned.substring(1);
    }
    return '90' + cleaned;
  }

  private getErrorMessage(code: string): string {
    const errorCodes: { [key: string]: string } = {
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

/**
 * Twilio SMS Provider (for international messaging)
 */
class TwilioProvider implements SMSProvider {
  name = 'Twilio';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';
  }

  isAvailable(): boolean {
    return !!(this.accountSid && this.authToken && this.fromNumber);
  }

  async sendSMS(request: SMSRequest): Promise<SMSResponse> {
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
    } catch (error) {
      logger.error('Twilio SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name
      };
    }
  }
}

/**
 * Mock SMS Provider (for testing)
 */
class MockProvider implements SMSProvider {
  name = 'Mock';

  isAvailable(): boolean {
    return config.nodeEnv === 'test' || config.nodeEnv === 'development';
  }

  async sendSMS(request: SMSRequest): Promise<SMSResponse> {
    logger.info(`Mock SMS to ${request.phoneNumber}: ${request.message}`);
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      provider: this.name
    };
  }
}

/**
 * SMS Service Manager
 */
export class SMSService {
  private providers: SMSProvider[] = [];
  private primaryProvider: SMSProvider | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Add providers in priority order
    this.providers = [
      new NetGSMProvider(),
      new TwilioProvider(),
      new MockProvider()
    ];

    // Set primary provider (first available one)
    this.primaryProvider = this.providers.find(p => p.isAvailable()) || null;

    if (this.primaryProvider) {
      logger.info(`SMS Service initialized with primary provider: ${this.primaryProvider.name}`);
    } else {
      logger.warn('No SMS providers available');
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(request: SMSRequest): Promise<SMSResponse> {
    if (!this.primaryProvider) {
      throw new Error('No SMS provider available');
    }

    const startTime = Date.now();
    
    try {
      // Validate phone number
      if (!this.isValidPhoneNumber(request.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Validate message
      if (!request.message || request.message.trim().length === 0) {
        throw new Error('SMS message cannot be empty');
      }

      if (request.message.length > 1600) {
        throw new Error('SMS message too long (max 1600 characters)');
      }

      const response = await this.primaryProvider.sendSMS(request);
      
      const duration = Date.now() - startTime;
      
      if (response.success) {
        logger.info(`SMS sent successfully via ${response.provider}`, {
          phoneNumber: this.maskPhoneNumber(request.phoneNumber),
          messageId: response.messageId,
          duration,
          provider: response.provider,
          userId: request.userId
        });
      } else {
        logger.error(`SMS sending failed via ${response.provider}`, {
          phoneNumber: this.maskPhoneNumber(request.phoneNumber),
          error: response.error,
          duration,
          provider: response.provider,
          userId: request.userId
        });
      }

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('SMS service error:', {
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

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(requests: SMSRequest[]): Promise<SMSResponse[]> {
    const results: SMSResponse[] = [];
    const batchSize = 10; // Send in batches to avoid rate limiting

    logger.info(`Sending bulk SMS: ${requests.length} messages`);

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(request => this.sendSMS(request));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          logger.error(`Bulk SMS batch error for ${batch[index]?.phoneNumber}:`, result.reason);
          results.push({
            success: false,
            error: result.reason instanceof Error ? result.reason.message : 'Batch processing error'
          });
        }
      });

      // Add delay between batches
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.info(`Bulk SMS completed: ${successCount}/${requests.length} sent successfully`);

    return results;
  }

  /**
   * Get SMS service status
   */
  getStatus(): {
    available: boolean;
    primaryProvider: string | null;
    availableProviders: string[];
  } {
    return {
      available: !!this.primaryProvider,
      primaryProvider: this.primaryProvider?.name || null,
      availableProviders: this.providers.filter(p => p.isAvailable()).map(p => p.name)
    };
  }

  /**
   * Switch to a specific provider
   */
  switchProvider(providerName: string): boolean {
    const provider = this.providers.find(p => p.name === providerName && p.isAvailable());
    
    if (provider) {
      this.primaryProvider = provider;
      logger.info(`Switched SMS provider to: ${providerName}`);
      return true;
    }

    return false;
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Turkish mobile number format: starts with 5, total 10 digits after country code
    const turkishMobileRegex = /^(\+90|90|0)?(5\d{9})$/;
    // International format
    const internationalRegex = /^\+?[1-9]\d{1,14}$/;

    return turkishMobileRegex.test(phone) || internationalRegex.test(phone);
  }

  /**
   * Mask phone number for logging
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) return phone;
    const visiblePart = phone.slice(-4);
    const hiddenPart = '*'.repeat(phone.length - 4);
    return hiddenPart + visiblePart;
  }

  /**
   * Format message with variables
   */
  static formatMessage(template: string, variables: Record<string, string>): string {
    let message = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return message;
  }

  /**
   * Get character count for SMS billing
   */
  static getCharacterCount(message: string): {
    length: number;
    smsCount: number;
    encoding: 'GSM' | 'UCS2';
  } {
    // Check if message contains non-GSM characters
    const gsmRegex = /^[@£$¥èéùìòÇØøÅåÆæ\nßÉ !"#¤%&'()*+,\-.\/:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà\^\{\}\\\[~\]\|€]*$/;
    
    const isGSM = gsmRegex.test(message);
    const encoding: 'GSM' | 'UCS2' = isGSM ? 'GSM' : 'UCS2';
    
    // Calculate SMS count based on encoding
    const maxPerSMS = isGSM ? 160 : 70;
    const maxPerConcatSMS = isGSM ? 153 : 67;
    
    const length = message.length;
    let smsCount: number;
    
    if (length <= maxPerSMS) {
      smsCount = 1;
    } else {
      smsCount = Math.ceil(length / maxPerConcatSMS);
    }
    
    return { length, smsCount, encoding };
  }
}

export default SMSService;