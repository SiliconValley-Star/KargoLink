"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArasCargoService = void 0;
const shared_1 = require("@cargolink/shared");
const base_cargo_service_1 = require("./base-cargo.service");
class ArasCargoService extends base_cargo_service_1.BaseCargoService {
    merchantId;
    constructor(config) {
        super(config);
        this.merchantId = config.merchantId || '';
    }
    addAuthentication(config) {
        config.headers = {
            ...config.headers,
            'X-API-Key': this.config.apiKey,
            'X-Merchant-ID': this.merchantId,
            'Content-Type': 'application/json'
        };
    }
    async getQuotes(request) {
        try {
            this.validateQuoteRequest(request);
            const arasRequest = this.transformToArasQuoteRequest(request);
            const response = await this.makeRequest('POST', '/shipment/pricing', arasRequest);
            const quotes = this.transformFromArasQuotes(response.prices || []);
            const result = {
                success: true,
                provider: shared_1.CargoServiceProvider.ARAS,
                quotes,
                requestId: response.transactionId,
                timestamp: new Date().toISOString()
            };
            return { success: true, data: result };
        }
        catch (error) {
            return {
                success: false,
                error: error
            };
        }
    }
    async trackShipment(request) {
        try {
            const response = await this.makeRequest('GET', `/shipment/track?trackingNumber=${request.trackingNumber}`);
            const trackingData = response.trackingData || {};
            const trackingResponse = {
                success: true,
                provider: shared_1.CargoServiceProvider.ARAS,
                trackingNumber: request.trackingNumber,
                status: this.mapArasStatusToOur(trackingData.currentStatus),
                events: this.transformArasEvents(trackingData.movements || []),
                currentLocation: trackingData.currentLocation,
                estimatedDeliveryDate: trackingData.estimatedDelivery,
                actualDeliveryDate: trackingData.deliveredAt,
                timestamp: new Date().toISOString()
            };
            return { success: true, data: trackingResponse };
        }
        catch (error) {
            return {
                success: false,
                error: error
            };
        }
    }
    async createShipment(request) {
        try {
            const arasRequest = this.transformToArasShipmentRequest(request);
            const response = await this.makeRequest('POST', '/shipment/create', arasRequest);
            const shipmentResponse = {
                success: true,
                provider: shared_1.CargoServiceProvider.ARAS,
                shipment: {
                    trackingNumber: response.trackingNumber || response.cargoTrackingNumber,
                    provider: shared_1.CargoServiceProvider.ARAS,
                    serviceType: request.serviceType,
                    status: shared_1.TrackingStatus.CREATED,
                    createdAt: new Date().toISOString(),
                    estimatedPickupDate: response.pickupDate,
                    estimatedDeliveryDate: response.deliveryDate,
                    totalCost: response.totalPrice || 0,
                    currency: 'TRY',
                    labels: response.waybillUrl ? [{
                            format: 'PDF',
                            size: 'A4',
                            url: response.waybillUrl,
                            content: response.waybillBase64
                        }] : undefined
                },
                timestamp: new Date().toISOString()
            };
            return { success: true, data: shipmentResponse };
        }
        catch (error) {
            return {
                success: false,
                error: error
            };
        }
    }
    async cancelShipment(trackingNumber) {
        try {
            await this.makeRequest('POST', '/shipment/cancel', { trackingNumber });
            return { success: true, data: true };
        }
        catch (error) {
            return {
                success: false,
                error: error
            };
        }
    }
    transformToArasQuoteRequest(request) {
        return {
            senderInfo: {
                name: request.fromAddress.fullName,
                phone: request.fromAddress.phone,
                email: request.fromAddress.email,
                cityName: request.fromAddress.city,
                districtName: request.fromAddress.district,
                address: request.fromAddress.address,
                postalCode: request.fromAddress.postalCode
            },
            receiverInfo: {
                name: request.toAddress.fullName,
                phone: request.toAddress.phone,
                email: request.toAddress.email,
                cityName: request.toAddress.city,
                districtName: request.toAddress.district,
                address: request.toAddress.address,
                postalCode: request.toAddress.postalCode
            },
            cargoDetails: {
                pieceCount: request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0),
                totalWeight: request.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
                totalValue: request.packages.reduce((sum, pkg) => sum + pkg.value, 0),
                description: request.packages.map(pkg => pkg.description).join(', '),
                packageDetails: request.packages.map(pkg => ({
                    weight: pkg.weight,
                    width: pkg.width,
                    height: pkg.height,
                    length: pkg.length,
                    value: pkg.value,
                    description: pkg.description,
                    quantity: pkg.quantity
                }))
            },
            serviceOptions: {
                serviceType: this.mapOurServiceTypeToAras(request.serviceType),
                insuranceAmount: request.insuranceValue || 0,
                codAmount: request.codAmount || 0,
                pickupDate: request.pickupDate,
                deliveryDate: request.deliveryDate
            },
            specialServices: request.specialServices?.map(service => service.type) || []
        };
    }
    transformFromArasQuotes(arasQuotes) {
        return arasQuotes.map(quote => ({
            id: quote.priceId || `aras_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            provider: shared_1.CargoServiceProvider.ARAS,
            serviceName: quote.serviceName || 'Aras Kargo',
            serviceType: this.mapArasServiceTypeToOur(quote.serviceType),
            price: {
                basePrice: quote.basePrice || 0,
                taxAmount: quote.kdv || 0,
                fuelSurcharge: quote.fuelSurcharge || 0,
                additionalFees: [
                    ...(quote.insuranceFee ? [{ name: 'Insurance Fee', amount: quote.insuranceFee }] : []),
                    ...(quote.codFee ? [{ name: 'COD Fee', amount: quote.codFee }] : [])
                ],
                totalPrice: quote.totalPrice || 0,
                currency: 'TRY'
            },
            estimatedDeliveryDays: quote.deliveryDays || 1,
            estimatedPickupDate: quote.pickupDate,
            estimatedDeliveryDate: quote.deliveryDate,
            features: [
                {
                    name: 'Fast Delivery',
                    description: 'Hızlı teslimat',
                    included: true
                },
                {
                    name: 'SMS & Email Notifications',
                    description: 'SMS ve E-posta bildirimleri',
                    included: true
                },
                {
                    name: 'Online Tracking',
                    description: 'Online takip sistemi',
                    included: true
                },
                {
                    name: 'Insurance Available',
                    description: 'Sigorta seçeneği mevcut',
                    included: false,
                    additionalCost: quote.insuranceFee || 0
                }
            ],
            restrictions: quote.restrictions || [],
            validUntil: quote.validUntil || new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
            trackingCapable: true,
            insuranceIncluded: quote.insuranceIncluded || false,
            codSupported: quote.codSupported !== false
        }));
    }
    transformToArasShipmentRequest(request) {
        return {
            priceId: request.selectedQuoteId,
            senderInfo: {
                name: request.fromAddress.fullName,
                phone: request.fromAddress.phone,
                email: request.fromAddress.email,
                cityName: request.fromAddress.city,
                districtName: request.fromAddress.district,
                address: request.fromAddress.address,
                postalCode: request.fromAddress.postalCode
            },
            receiverInfo: {
                name: request.toAddress.fullName,
                phone: request.toAddress.phone,
                email: request.toAddress.email,
                cityName: request.toAddress.city,
                districtName: request.toAddress.district,
                address: request.toAddress.address,
                postalCode: request.toAddress.postalCode
            },
            cargoDetails: {
                pieceCount: request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0),
                totalWeight: request.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
                totalValue: request.packages.reduce((sum, pkg) => sum + pkg.value, 0),
                description: request.packages.map(pkg => pkg.description).join(', '),
                packageDetails: request.packages.map(pkg => ({
                    weight: pkg.weight,
                    width: pkg.width,
                    height: pkg.height,
                    length: pkg.length,
                    value: pkg.value,
                    description: pkg.description,
                    quantity: pkg.quantity
                }))
            },
            serviceOptions: {
                serviceType: this.mapOurServiceTypeToAras(request.serviceType),
                pickupDate: request.pickupDate,
                specialInstructions: request.specialInstructions
            },
            notifications: {
                smsNotification: request.notifications?.sms || request.fromAddress.phone,
                emailNotification: request.notifications?.email || request.fromAddress.email,
                notifyOnPickup: request.notifications?.notifyOnPickup !== false,
                notifyOnDelivery: request.notifications?.notifyOnDelivery !== false
            },
            references: request.references?.reduce((acc, ref) => {
                acc[ref.type] = ref.value;
                return acc;
            }, {}) || {}
        };
    }
    transformArasEvents(arasEvents) {
        return arasEvents.map(event => ({
            timestamp: event.processTime || event.timestamp,
            status: this.mapArasStatusToOur(event.processType || event.status),
            location: event.processUnitName || event.location || 'Unknown',
            description: event.processDescription || event.description || 'Status updated',
            notes: event.explanation || event.notes
        }));
    }
    mapOurServiceTypeToAras(serviceType) {
        const mapping = {
            [shared_1.CargoServiceType.STANDARD]: 'STANDART',
            [shared_1.CargoServiceType.EXPRESS]: 'EKSPRES',
            [shared_1.CargoServiceType.OVERNIGHT]: 'HIZLI',
            [shared_1.CargoServiceType.ECONOMY]: 'EKONOMIK',
            [shared_1.CargoServiceType.PREMIUM]: 'PREMIUM'
        };
        return mapping[serviceType || shared_1.CargoServiceType.STANDARD] || 'STANDART';
    }
    mapArasServiceTypeToOur(arasType) {
        const mapping = {
            'STANDART': shared_1.CargoServiceType.STANDARD,
            'EKSPRES': shared_1.CargoServiceType.EXPRESS,
            'HIZLI': shared_1.CargoServiceType.OVERNIGHT,
            'EKONOMIK': shared_1.CargoServiceType.ECONOMY,
            'PREMIUM': shared_1.CargoServiceType.PREMIUM
        };
        return mapping[arasType?.toUpperCase()] || shared_1.CargoServiceType.STANDARD;
    }
    mapArasStatusToOur(arasStatus) {
        const statusMap = {
            'KARGO_ALINDI': shared_1.TrackingStatus.PICKED_UP,
            'TRANSFER_MERKEZI': shared_1.TrackingStatus.IN_TRANSIT,
            'DAGITIMDA': shared_1.TrackingStatus.OUT_FOR_DELIVERY,
            'TESLIM_EDILDI': shared_1.TrackingStatus.DELIVERED,
            'IADE': shared_1.TrackingStatus.RETURNED,
            'PROBLEM': shared_1.TrackingStatus.EXCEPTION,
            'created': shared_1.TrackingStatus.CREATED,
            'picked_up': shared_1.TrackingStatus.PICKED_UP,
            'in_transit': shared_1.TrackingStatus.IN_TRANSIT,
            'out_for_delivery': shared_1.TrackingStatus.OUT_FOR_DELIVERY,
            'delivered': shared_1.TrackingStatus.DELIVERED,
            'exception': shared_1.TrackingStatus.EXCEPTION,
            'returned': shared_1.TrackingStatus.RETURNED
        };
        return statusMap[arasStatus?.toUpperCase()] || shared_1.TrackingStatus.CREATED;
    }
}
exports.ArasCargoService = ArasCargoService;
//# sourceMappingURL=aras-cargo.service.js.map