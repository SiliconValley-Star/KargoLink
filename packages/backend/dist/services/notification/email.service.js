"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = exports.EmailTemplates = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../../utils/logger"));
const environment_1 = require("../../config/environment");
class SMTPProvider {
    name = 'SMTP';
    transporter = null;
    constructor() {
        this.initializeTransporter();
    }
    initializeTransporter() {
        const smtpConfig = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };
        if (smtpConfig.host && smtpConfig.auth.user && smtpConfig.auth.pass) {
            this.transporter = nodemailer_1.default.createTransport(smtpConfig);
        }
    }
    isAvailable() {
        return !!this.transporter;
    }
    async sendEmail(request) {
        if (!this.transporter) {
            throw new Error('SMTP transporter not configured');
        }
        try {
            const mailOptions = {
                from: request.from || process.env.SMTP_FROM || process.env.SMTP_USER,
                to: Array.isArray(request.to) ? request.to.join(', ') : request.to,
                subject: request.subject,
                text: request.text,
                html: request.html,
                replyTo: request.replyTo,
                attachments: request.attachments,
            };
            const result = await this.transporter.sendMail(mailOptions);
            return {
                success: true,
                messageId: result.messageId,
                provider: this.name,
            };
        }
        catch (error) {
            logger_1.default.error('SMTP email error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                provider: this.name,
            };
        }
    }
}
class SendGridProvider {
    name = 'SendGrid';
    apiKey;
    constructor() {
        this.apiKey = process.env.SENDGRID_API_KEY || '';
    }
    isAvailable() {
        return !!this.apiKey;
    }
    async sendEmail(request) {
        if (!this.apiKey) {
            throw new Error('SendGrid API key not configured');
        }
        try {
            const payload = {
                personalizations: [
                    {
                        to: Array.isArray(request.to)
                            ? request.to.map(email => ({ email }))
                            : [{ email: request.to }],
                        subject: request.subject,
                    },
                ],
                from: {
                    email: request.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@cargolink.com',
                    name: process.env.SENDGRID_FROM_NAME || 'CargoLink',
                },
                content: [
                    ...(request.text ? [{ type: 'text/plain', value: request.text }] : []),
                    ...(request.html ? [{ type: 'text/html', value: request.html }] : []),
                ],
                reply_to: request.replyTo ? { email: request.replyTo } : undefined,
                attachments: request.attachments?.map(att => ({
                    content: Buffer.isBuffer(att.content)
                        ? att.content.toString('base64')
                        : Buffer.from(att.content).toString('base64'),
                    filename: att.filename,
                    type: att.contentType || 'application/octet-stream',
                    disposition: 'attachment',
                })),
            };
            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                const messageId = response.headers.get('x-message-id') || undefined;
                return {
                    success: true,
                    messageId,
                    provider: this.name,
                };
            }
            const error = await response.text();
            return {
                success: false,
                error: `SendGrid API error: ${error}`,
                provider: this.name,
            };
        }
        catch (error) {
            logger_1.default.error('SendGrid email error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                provider: this.name,
            };
        }
    }
}
class AWSESProvider {
    name = 'AWS SES';
    region;
    accessKeyId;
    secretAccessKey;
    constructor() {
        this.region = process.env.AWS_SES_REGION || 'eu-west-1';
        this.accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
        this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    }
    isAvailable() {
        return !!(this.accessKeyId && this.secretAccessKey);
    }
    async sendEmail(request) {
        if (!this.isAvailable()) {
            throw new Error('AWS SES credentials not configured');
        }
        logger_1.default.info(`AWS SES email would be sent to: ${request.to}`);
        return {
            success: true,
            messageId: `aws-ses-${Date.now()}`,
            provider: this.name,
        };
    }
}
class MockProvider {
    name = 'Mock';
    isAvailable() {
        return environment_1.config.nodeEnv === 'test' || environment_1.config.nodeEnv === 'development';
    }
    async sendEmail(request) {
        logger_1.default.info(`Mock email to ${request.to}: ${request.subject}`);
        if (request.html) {
            logger_1.default.debug('Email HTML content:', request.html.substring(0, 200));
        }
        if (request.text) {
            logger_1.default.debug('Email text content:', request.text.substring(0, 200));
        }
        return {
            success: true,
            messageId: `mock_${Date.now()}`,
            provider: this.name,
        };
    }
}
class EmailTemplates {
    static welcome(name, activationLink) {
        return {
            subject: 'CargoLink\'e Hoş Geldiniz!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Hoş Geldiniz ${name}!</h1>
          <p>CargoLink\'e katıldığınız için teşekkür ederiz.</p>
          <p>Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:</p>
          <a href="${activationLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Hesabımı Aktifleştir
          </a>
          <p style="margin-top: 20px;">Bu link 24 saat geçerlidir.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Bu e-postayı siz talep etmediniz? Lütfen bu e-postayı görmezden gelin.</p>
        </div>
      `,
            text: `Hoş Geldiniz ${name}!\n\nCargoLink'e katıldığınız için teşekkür ederiz.\n\nHesabınızı aktifleştirmek için şu linki ziyaret edin: ${activationLink}\n\nBu link 24 saat geçerlidir.`
        };
    }
    static passwordReset(name, resetLink) {
        return {
            subject: 'Şifre Sıfırlama Talebi',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Şifre Sıfırlama</h1>
          <p>Merhaba ${name},</p>
          <p>Şifre sıfırlama talebiniz alındı. Yeni şifre oluşturmak için aşağıdaki butona tıklayın:</p>
          <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Şifremi Sıfırla
          </a>
          <p style="margin-top: 20px;">Bu link 1 saat geçerlidir.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Bu talebi siz yapmadınız? Lütfen bu e-postayı görmezden gelin.</p>
        </div>
      `,
            text: `Şifre Sıfırlama\n\nMerhaba ${name},\n\nŞifre sıfırlama talebiniz alındı. Yeni şifre oluşturmak için şu linki ziyaret edin: ${resetLink}\n\nBu link 1 saat geçerlidir.`
        };
    }
    static shipmentUpdate(name, trackingNumber, status, details) {
        return {
            subject: `Kargo Güncelleme - ${trackingNumber}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Kargo Durumu Güncellendi</h1>
          <p>Merhaba ${name},</p>
          <p><strong>Takip No:</strong> ${trackingNumber}</p>
          <p><strong>Yeni Durum:</strong> ${status}</p>
          <p>${details}</p>
          <a href="${process.env.FRONTEND_URL}/tracking/${trackingNumber}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Kargonuzu Takip Edin
          </a>
        </div>
      `,
            text: `Kargo Durumu Güncellendi\n\nMerhaba ${name},\n\nTakip No: ${trackingNumber}\nYeni Durum: ${status}\n\n${details}\n\nKargonuzu takip etmek için: ${process.env.FRONTEND_URL}/tracking/${trackingNumber}`
        };
    }
    static paymentConfirmation(name, amount, transactionId) {
        return {
            subject: 'Ödeme Onayı',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Ödeme Başarılı</h1>
          <p>Merhaba ${name},</p>
          <p>Ödemeniz başarıyla alındı.</p>
          <p><strong>Tutar:</strong> ${amount}</p>
          <p><strong>İşlem No:</strong> ${transactionId}</p>
          <p>Faturanız ekte yer almaktadır.</p>
        </div>
      `,
            text: `Ödeme Başarılı\n\nMerhaba ${name},\n\nÖdemeniz başarıyla alındı.\n\nTutar: ${amount}\nİşlem No: ${transactionId}`
        };
    }
}
exports.EmailTemplates = EmailTemplates;
class EmailService {
    providers = [];
    primaryProvider = null;
    constructor() {
        this.initializeProviders();
    }
    initializeProviders() {
        this.providers = [
            new SendGridProvider(),
            new SMTPProvider(),
            new AWSESProvider(),
            new MockProvider(),
        ];
        this.primaryProvider = this.providers.find(p => p.isAvailable()) || null;
        if (this.primaryProvider) {
            logger_1.default.info(`Email Service initialized with primary provider: ${this.primaryProvider.name}`);
        }
        else {
            logger_1.default.warn('No email providers available');
        }
    }
    async sendEmail(request) {
        if (!this.primaryProvider) {
            throw new Error('No email provider available');
        }
        const startTime = Date.now();
        try {
            const recipients = Array.isArray(request.to) ? request.to : [request.to];
            for (const email of recipients) {
                if (!this.isValidEmail(email)) {
                    throw new Error(`Invalid email address: ${email}`);
                }
            }
            if (!request.html && !request.text) {
                throw new Error('Email must have either HTML or text content');
            }
            if (request.template && request.templateData) {
                const templateResult = this.processTemplate(request.template, request.templateData);
                request.html = templateResult.html;
                request.text = templateResult.text;
                if (!request.subject) {
                    request.subject = templateResult.subject;
                }
            }
            const response = await this.primaryProvider.sendEmail(request);
            const duration = Date.now() - startTime;
            if (response.success) {
                logger_1.default.info(`Email sent successfully via ${response.provider}`, {
                    to: this.maskEmails(recipients),
                    subject: request.subject,
                    messageId: response.messageId,
                    duration,
                    provider: response.provider,
                    userId: request.userId,
                });
            }
            else {
                logger_1.default.error(`Email sending failed via ${response.provider}`, {
                    to: this.maskEmails(recipients),
                    subject: request.subject,
                    error: response.error,
                    duration,
                    provider: response.provider,
                    userId: request.userId,
                });
            }
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.default.error('Email service error:', {
                to: request.to,
                subject: request.subject,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration,
                userId: request.userId,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Email sending failed',
            };
        }
    }
    async sendBulkEmails(requests) {
        const results = [];
        const batchSize = 10;
        logger_1.default.info(`Sending bulk emails: ${requests.length} messages`);
        for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            const batchPromises = batch.map(request => this.sendEmail(request));
            const batchResults = await Promise.allSettled(batchPromises);
            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                }
                else {
                    logger_1.default.error(`Bulk email batch error for ${batch[index]?.to}:`, result.reason);
                    results.push({
                        success: false,
                        error: result.reason instanceof Error ? result.reason.message : 'Batch processing error',
                    });
                }
            });
            if (i + batchSize < requests.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        const successCount = results.filter(r => r.success).length;
        logger_1.default.info(`Bulk email completed: ${successCount}/${requests.length} sent successfully`);
        return results;
    }
    getStatus() {
        return {
            available: !!this.primaryProvider,
            primaryProvider: this.primaryProvider?.name || null,
            availableProviders: this.providers.filter(p => p.isAvailable()).map(p => p.name),
        };
    }
    switchProvider(providerName) {
        const provider = this.providers.find(p => p.name === providerName && p.isAvailable());
        if (provider) {
            this.primaryProvider = provider;
            logger_1.default.info(`Switched email provider to: ${providerName}`);
            return true;
        }
        return false;
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    maskEmails(emails) {
        return emails.map(email => {
            const [local, domain] = email.split('@');
            if (!local || !domain || local.length <= 2)
                return email;
            const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
            return `${maskedLocal}@${domain}`;
        });
    }
    processTemplate(template, data) {
        switch (template) {
            case 'welcome':
                return EmailTemplates.welcome(data.name, data.activationLink);
            case 'password-reset':
                return EmailTemplates.passwordReset(data.name, data.resetLink);
            case 'shipment-update':
                return EmailTemplates.shipmentUpdate(data.name, data.trackingNumber, data.status, data.details);
            case 'payment-confirmation':
                return EmailTemplates.paymentConfirmation(data.name, data.amount, data.transactionId);
            default:
                throw new Error(`Unknown email template: ${template}`);
        }
    }
}
exports.EmailService = EmailService;
exports.default = EmailService;
//# sourceMappingURL=email.service.js.map