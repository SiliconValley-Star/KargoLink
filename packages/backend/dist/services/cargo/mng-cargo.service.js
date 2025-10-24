"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MngCargoService = void 0;
const shared_1 = require("@cargolink/shared");
const base_cargo_service_1 = require("./base-cargo.service");
class MngCargoService extends base_cargo_service_1.BaseCargoService {
    customerId;
    constructor(config) {
        super(config);
        this.customerId = config.customerId || '';
    }
    addAuthentication(config) {
        const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
        config.headers = {
            ...config.headers,
            'Authorization': `Basic ${credentials}`,
            'X-Customer-Code': this.customerId,
            'X-API-Key': this.config.apiKey,
            'Content-Type': 'application/json'
        };
    }
    async getQuotes(request) {
        try {
            this.validateQuoteRequest(request);
            const mngRequest = this.transformToMngQuoteRequest(request);
            const response = await this.makeRequest('POST', '/api/pricing/calculate', mngRequest);
            const quotes = this.transformFromMngQuotes(response.result?.priceList || []);
            const result = {
                success: true,
                provider: shared_1.CargoServiceProvider.MNG,
                quotes,
                requestId: response.requestId || response.transactionId,
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
            const response = await this.makeRequest('POST', '/api/tracking/query', {
                trackingNumber: request.trackingNumber,
                language: 'tr'
            });
            const trackingData = response.result || {};
            const trackingResponse = {
                success: true,
                provider: shared_1.CargoServiceProvider.MNG,
                trackingNumber: request.trackingNumber,
                status: this.mapMngStatusToOur(trackingData.lastStatus?.statusCode),
                events: this.transformMngEvents(trackingData.statusHistory || []),
                currentLocation: trackingData.currentLocation?.name,
                estimatedDeliveryDate: trackingData.estimatedDeliveryDate,
                actualDeliveryDate: trackingData.deliveryDate,
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
            const mngRequest = this.transformToMngShipmentRequest(request);
            const response = await this.makeRequest('POST', '/api/shipment/create', mngRequest);
            const shipmentData = response.result || {};
            const shipmentResponse = {
                success: true,
                provider: shared_1.CargoServiceProvider.MNG,
                shipment: {
                    trackingNumber: shipmentData.trackingNumber || shipmentData.referenceNumber,
                    provider: shared_1.CargoServiceProvider.MNG,
                    serviceType: request.serviceType,
                    status: shared_1.TrackingStatus.CREATED,
                    createdAt: new Date().toISOString(),
                    estimatedPickupDate: shipmentData.estimatedPickupDate,
                    estimatedDeliveryDate: shipmentData.estimatedDeliveryDate,
                    totalCost: shipmentData.totalAmount || 0,
                    currency: 'TRY',
                    labels: shipmentData.labelData ? [{
                            format: 'PDF',
                            size: 'A4',
                            url: shipmentData.labelUrl,
                            content: shipmentData.labelData
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
            await this.makeRequest('POST', '/api/shipment/cancel', {
                trackingNumber,
                reason: 'Customer request'
            });
            return { success: true, data: true };
        }
        catch (error) {
            return {
                success: false,
                error: error
            };
        }
    }
    transformToMngQuoteRequest(request) {
        return {
            origin: {
                name: request.fromAddress.fullName,
                phone: request.fromAddress.phone,
                email: request.fromAddress.email,
                city: request.fromAddress.city,
                district: request.fromAddress.district,
                address: request.fromAddress.address,
                postalCode: request.fromAddress.postalCode,
                country: request.fromAddress.country || 'TR'
            },
            destination: {
                name: request.toAddress.fullName,
                phone: request.toAddress.phone,
                email: request.toAddress.email,
                city: request.toAddress.city,
                district: request.toAddress.district,
                address: request.toAddress.address,
                postalCode: request.toAddress.postalCode,
                country: request.toAddress.country || 'TR'
            },
            shipmentDetails: {
                packageCount: request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0),
                totalWeight: request.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
                totalVolume: this.calculateTotalVolume(request.packages),
                declaredValue: request.packages.reduce((sum, pkg) => sum + pkg.value, 0),
                contentDescription: request.packages.map(pkg => pkg.description).join(', '),
                packages: request.packages.map((pkg, index) => ({
                    id: index + 1,
                    weight: pkg.weight,
                    dimensions: {
                        length: pkg.length,
                        width: pkg.width,
                        height: pkg.height
                    },
                    value: pkg.value,
                    description: pkg.description,
                    quantity: pkg.quantity
                }))
            },
            serviceOptions: {
                serviceType: this.mapOurServiceTypeToMng(request.serviceType),
                insuranceRequired: (request.insuranceValue || 0) > 0,
                insuranceAmount: request.insuranceValue || 0,
                codRequired: (request.codAmount || 0) > 0,
                codAmount: request.codAmount || 0,
                pickupDate: request.pickupDate,
                deliveryDate: request.deliveryDate
            },
            additionalServices: this.mapSpecialServices(request.specialServices || [])
        };
    }
    transformFromMngQuotes(mngQuotes) {
        return mngQuotes.map(quote => ({
            id: quote.quoteId || `mng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            provider: shared_1.CargoServiceProvider.MNG,
            serviceName: quote.serviceName || 'MNG Kargo',
            serviceType: this.mapMngServiceTypeToOur(quote.serviceCode),
            price: {
                basePrice: quote.basePrice || 0,
                taxAmount: quote.taxAmount || (quote.basePrice * 0.18) || 0,
                fuelSurcharge: quote.fuelSurcharge || 0,
                additionalFees: [
                    ...(quote.insuranceFee ? [{ name: 'Insurance Fee', amount: quote.insuranceFee }] : []),
                    ...(quote.codFee ? [{ name: 'COD Fee', amount: quote.codFee }] : []),
                    ...(quote.deliveryFee ? [{ name: 'Delivery Fee', amount: quote.deliveryFee }] : [])
                ],
                totalPrice: quote.totalPrice || 0,
                currency: 'TRY'
            },
            estimatedDeliveryDays: quote.transitDays || 1,
            estimatedPickupDate: quote.pickupDate,
            estimatedDeliveryDate: quote.deliveryDate,
            features: [
                {
                    name: 'Nationwide Coverage',
                    description: 'Türkiye geneli kapsama alanı',
                    included: true
                },
                {
                    name: 'International Service',
                    description: 'Uluslararası gönderim imkanı',
                    included: quote.internationalCapable || false
                },
                {
                    name: 'Real-time Tracking',
                    description: 'Gerçek zamanlı takip',
                    included: true
                },
                {
                    name: 'SMS Notifications',
                    description: 'SMS bildirimleri',
                    included: true
                },
                {
                    name: 'Insurance Protection',
                    description: 'Sigorta koruması',
                    included: false,
                    additionalCost: quote.insuranceFee || 0
                }
            ],
            restrictions: quote.restrictions || [],
            validUntil: quote.validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            trackingCapable: true,
            insuranceIncluded: quote.insuranceIncluded || false,
            codSupported: quote.codSupported !== false
        }));
    }
    transformToMngShipmentRequest(request) {
        return {
            quoteId: request.selectedQuoteId,
            origin: {
                name: request.fromAddress.fullName,
                phone: request.fromAddress.phone,
                email: request.fromAddress.email,
                city: request.fromAddress.city,
                district: request.fromAddress.district,
                address: request.fromAddress.address,
                postalCode: request.fromAddress.postalCode,
                country: request.fromAddress.country || 'TR'
            },
            destination: {
                name: request.toAddress.fullName,
                phone: request.toAddress.phone,
                email: request.toAddress.email,
                city: request.toAddress.city,
                district: request.toAddress.district,
                address: request.toAddress.address,
                postalCode: request.toAddress.postalCode,
                country: request.toAddress.country || 'TR'
            },
            shipmentDetails: {
                packageCount: request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0),
                totalWeight: request.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
                totalVolume: this.calculateTotalVolume(request.packages),
                declaredValue: request.packages.reduce((sum, pkg) => sum + pkg.value, 0),
                contentDescription: request.packages.map(pkg => pkg.description).join(', '),
                packages: request.packages.map((pkg, index) => ({
                    id: index + 1,
                    weight: pkg.weight,
                    dimensions: {
                        length: pkg.length,
                        width: pkg.width,
                        height: pkg.height
                    },
                    value: pkg.value,
                    description: pkg.description,
                    quantity: pkg.quantity
                }))
            },
            serviceOptions: {
                serviceType: this.mapOurServiceTypeToMng(request.serviceType),
                pickupDate: request.pickupDate,
                specialInstructions: request.specialInstructions
            },
            notifications: {
                smsNotification: request.notifications?.sms || request.fromAddress.phone,
                emailNotification: request.notifications?.email || request.fromAddress.email,
                notifyOnPickup: request.notifications?.notifyOnPickup !== false,
                notifyOnDelivery: request.notifications?.notifyOnDelivery !== false,
                notifyOnException: request.notifications?.notifyOnException !== false
            },
            customerReferences: request.references?.reduce((acc, ref) => {
                acc[`${ref.type}Reference`] = ref.value;
                return acc;
            }, {}) || {}
        };
    }
    transformMngEvents(mngEvents) {
        return mngEvents.map(event => ({
            timestamp: event.eventDate || event.timestamp,
            status: this.mapMngStatusToOur(event.statusCode || event.status),
            location: event.locationName || event.location || 'Unknown',
            description: event.statusDescription || event.description || 'Status updated',
            notes: event.remarks || event.notes
        }));
    }
    calculateTotalVolume(packages) {
        return packages.reduce((total, pkg) => {
            return total + (pkg.width * pkg.height * pkg.length * pkg.quantity);
        }, 0);
    }
    mapSpecialServices(services) {
        const serviceMapping = {
            'insurance': 'INSURANCE',
            'cod': 'COD',
            'signature': 'SIGNATURE_REQUIRED',
            'weekend_delivery': 'WEEKEND_DELIVERY',
            'priority': 'PRIORITY_HANDLING'
        };
        return services
            .map(service => serviceMapping[service.type])
            .filter((service) => Boolean(service));
    }
    mapOurServiceTypeToMng(serviceType) {
        const mapping = {
            [shared_1.CargoServiceType.STANDARD]: 'STANDART',
            [shared_1.CargoServiceType.EXPRESS]: 'EXPRESS',
            [shared_1.CargoServiceType.OVERNIGHT]: 'OVERNIGHT',
            [shared_1.CargoServiceType.ECONOMY]: 'EKONOMI',
            [shared_1.CargoServiceType.PREMIUM]: 'PREMIUM'
        };
        return mapping[serviceType || shared_1.CargoServiceType.STANDARD] || 'STANDART';
    }
    mapMngServiceTypeToOur(mngType) {
        const mapping = {
            'STANDART': shared_1.CargoServiceType.STANDARD,
            'EXPRESS': shared_1.CargoServiceType.EXPRESS,
            'OVERNIGHT': shared_1.CargoServiceType.OVERNIGHT,
            'EKONOMI': shared_1.CargoServiceType.ECONOMY,
            'PREMIUM': shared_1.CargoServiceType.PREMIUM
        };
        return mapping[mngType?.toUpperCase()] || shared_1.CargoServiceType.STANDARD;
    }
    mapMngStatusToOur(mngStatus) {
        const numericStatusMap = {
            1: shared_1.TrackingStatus.CREATED,
            2: shared_1.TrackingStatus.PICKED_UP,
            3: shared_1.TrackingStatus.IN_TRANSIT,
            4: shared_1.TrackingStatus.IN_TRANSIT,
            5: shared_1.TrackingStatus.OUT_FOR_DELIVERY,
            6: shared_1.TrackingStatus.DELIVERED,
            7: shared_1.TrackingStatus.EXCEPTION,
            8: shared_1.TrackingStatus.RETURNED,
            9: shared_1.TrackingStatus.EXCEPTION
        };
        const stringStatusMap = {
            'CREATED': shared_1.TrackingStatus.CREATED,
            'PICKED_UP': shared_1.TrackingStatus.PICKED_UP,
            'IN_TRANSIT': shared_1.TrackingStatus.IN_TRANSIT,
            'OUT_FOR_DELIVERY': shared_1.TrackingStatus.OUT_FOR_DELIVERY,
            'DELIVERED': shared_1.TrackingStatus.DELIVERED,
            'EXCEPTION': shared_1.TrackingStatus.EXCEPTION,
            'RETURNED': shared_1.TrackingStatus.RETURNED,
            'KARGO_ALINDI': shared_1.TrackingStatus.PICKED_UP,
            'YOLDA': shared_1.TrackingStatus.IN_TRANSIT,
            'DAGITIMDA': shared_1.TrackingStatus.OUT_FOR_DELIVERY,
            'TESLIM_EDILDI': shared_1.TrackingStatus.DELIVERED
        };
        if (typeof mngStatus === 'number') {
            return numericStatusMap[mngStatus] || shared_1.TrackingStatus.CREATED;
        }
        return stringStatusMap[mngStatus?.toUpperCase()] || shared_1.TrackingStatus.CREATED;
    }
}
exports.MngCargoService = MngCargoService;
//# sourceMappingURL=mng-cargo.service.js.map