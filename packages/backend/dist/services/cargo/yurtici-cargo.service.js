"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YurticiCargoService = void 0;
const shared_1 = require("@cargolink/shared");
const base_cargo_service_1 = require("./base-cargo.service");
class YurticiCargoService extends base_cargo_service_1.BaseCargoService {
    customerId;
    constructor(config) {
        super(config);
        this.customerId = config.customerId || '';
    }
    addAuthentication(config) {
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${this.config.apiKey}`,
            'X-Customer-Id': this.customerId
        };
    }
    async getQuotes(request) {
        try {
            this.validateQuoteRequest(request);
            const yurticiRequest = this.transformToYurticiQuoteRequest(request);
            const response = await this.makeRequest('POST', '/api/v1/quotes', yurticiRequest);
            const quotes = this.transformFromYurticiQuotes(response.data || []);
            const result = {
                success: true,
                provider: shared_1.CargoServiceProvider.YURTICI,
                quotes,
                requestId: response.requestId,
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
            const response = await this.makeRequest('GET', `/api/v1/tracking/${request.trackingNumber}`);
            const trackingResponse = {
                success: true,
                provider: shared_1.CargoServiceProvider.YURTICI,
                trackingNumber: request.trackingNumber,
                status: this.mapYurticiStatusToOur(response.status),
                events: this.transformYurticiEvents(response.events || []),
                currentLocation: response.currentLocation,
                estimatedDeliveryDate: response.estimatedDeliveryDate,
                actualDeliveryDate: response.actualDeliveryDate,
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
            const yurticiRequest = this.transformToYurticiShipmentRequest(request);
            const response = await this.makeRequest('POST', '/api/v1/shipments', yurticiRequest);
            const shipmentResponse = {
                success: true,
                provider: shared_1.CargoServiceProvider.YURTICI,
                shipment: {
                    trackingNumber: response.trackingNumber,
                    provider: shared_1.CargoServiceProvider.YURTICI,
                    serviceType: request.serviceType,
                    status: shared_1.TrackingStatus.CREATED,
                    createdAt: new Date().toISOString(),
                    estimatedPickupDate: response.estimatedPickupDate,
                    estimatedDeliveryDate: response.estimatedDeliveryDate,
                    totalCost: response.totalCost || 0,
                    currency: 'TRY',
                    labels: response.labels ? [{
                            format: 'PDF',
                            size: 'A4',
                            url: response.labelUrl,
                            content: response.labelBase64
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
            await this.makeRequest('DELETE', `/api/v1/shipments/${trackingNumber}`);
            return { success: true, data: true };
        }
        catch (error) {
            return {
                success: false,
                error: error
            };
        }
    }
    transformToYurticiQuoteRequest(request) {
        return {
            sender: {
                name: request.fromAddress.fullName,
                phone: request.fromAddress.phone,
                email: request.fromAddress.email,
                address: {
                    country: request.fromAddress.country,
                    city: request.fromAddress.city,
                    district: request.fromAddress.district,
                    neighborhood: request.fromAddress.neighborhood,
                    postalCode: request.fromAddress.postalCode,
                    addressLine: request.fromAddress.address
                }
            },
            receiver: {
                name: request.toAddress.fullName,
                phone: request.toAddress.phone,
                email: request.toAddress.email,
                address: {
                    country: request.toAddress.country,
                    city: request.toAddress.city,
                    district: request.toAddress.district,
                    neighborhood: request.toAddress.neighborhood,
                    postalCode: request.toAddress.postalCode,
                    addressLine: request.toAddress.address
                }
            },
            packages: request.packages.map(pkg => ({
                weight: pkg.weight,
                dimensions: {
                    width: pkg.width,
                    height: pkg.height,
                    length: pkg.length
                },
                value: pkg.value,
                description: pkg.description,
                quantity: pkg.quantity
            })),
            serviceType: this.mapOurServiceTypeToYurtici(request.serviceType),
            pickupDate: request.pickupDate,
            deliveryDate: request.deliveryDate,
            insuranceValue: request.insuranceValue,
            codAmount: request.codAmount,
            specialServices: request.specialServices?.map(service => ({
                type: service.type,
                value: service.value
            }))
        };
    }
    transformFromYurticiQuotes(yurticiQuotes) {
        return yurticiQuotes.map(quote => ({
            id: quote.id || `yurtici_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            provider: shared_1.CargoServiceProvider.YURTICI,
            serviceName: quote.serviceName || 'Yurtiçi Kargo',
            serviceType: this.mapYurticiServiceTypeToOur(quote.serviceType),
            price: {
                basePrice: quote.price?.baseAmount || 0,
                taxAmount: quote.price?.taxAmount || 0,
                fuelSurcharge: quote.price?.fuelSurcharge,
                additionalFees: quote.price?.additionalFees || [],
                totalPrice: quote.price?.totalAmount || 0,
                currency: 'TRY'
            },
            estimatedDeliveryDays: quote.estimatedDeliveryDays || 1,
            estimatedPickupDate: quote.estimatedPickupDate,
            estimatedDeliveryDate: quote.estimatedDeliveryDate,
            features: [
                {
                    name: 'Door-to-Door Delivery',
                    description: 'Kapıdan kapıya teslimat',
                    included: true
                },
                {
                    name: 'SMS Notification',
                    description: 'SMS bildirimleri',
                    included: true
                },
                {
                    name: 'Online Tracking',
                    description: 'Online takip',
                    included: true
                }
            ],
            restrictions: quote.restrictions || [],
            validUntil: quote.validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            trackingCapable: true,
            insuranceIncluded: quote.insuranceIncluded || false,
            codSupported: quote.codSupported || true
        }));
    }
    transformToYurticiShipmentRequest(request) {
        return {
            quoteId: request.selectedQuoteId,
            sender: {
                name: request.fromAddress.fullName,
                phone: request.fromAddress.phone,
                email: request.fromAddress.email,
                address: {
                    country: request.fromAddress.country,
                    city: request.fromAddress.city,
                    district: request.fromAddress.district,
                    neighborhood: request.fromAddress.neighborhood,
                    postalCode: request.fromAddress.postalCode,
                    addressLine: request.fromAddress.address
                }
            },
            receiver: {
                name: request.toAddress.fullName,
                phone: request.toAddress.phone,
                email: request.toAddress.email,
                address: {
                    country: request.toAddress.country,
                    city: request.toAddress.city,
                    district: request.toAddress.district,
                    neighborhood: request.toAddress.neighborhood,
                    postalCode: request.toAddress.postalCode,
                    addressLine: request.toAddress.address
                }
            },
            packages: request.packages.map(pkg => ({
                weight: pkg.weight,
                dimensions: {
                    width: pkg.width,
                    height: pkg.height,
                    length: pkg.length
                },
                value: pkg.value,
                description: pkg.description,
                quantity: pkg.quantity
            })),
            serviceType: this.mapOurServiceTypeToYurtici(request.serviceType),
            pickupDate: request.pickupDate,
            specialInstructions: request.specialInstructions,
            references: request.references,
            notifications: request.notifications
        };
    }
    transformYurticiEvents(yurticiEvents) {
        return yurticiEvents.map(event => ({
            timestamp: event.timestamp,
            status: this.mapYurticiStatusToOur(event.status),
            location: event.location || 'Unknown',
            description: event.description || 'Status updated',
            notes: event.notes
        }));
    }
    mapOurServiceTypeToYurtici(serviceType) {
        const mapping = {
            [shared_1.CargoServiceType.STANDARD]: 'standard',
            [shared_1.CargoServiceType.EXPRESS]: 'express',
            [shared_1.CargoServiceType.OVERNIGHT]: 'overnight',
            [shared_1.CargoServiceType.ECONOMY]: 'economy',
            [shared_1.CargoServiceType.PREMIUM]: 'premium'
        };
        return mapping[serviceType || shared_1.CargoServiceType.STANDARD] || 'standard';
    }
    mapYurticiServiceTypeToOur(yurticiType) {
        const mapping = {
            'standard': shared_1.CargoServiceType.STANDARD,
            'express': shared_1.CargoServiceType.EXPRESS,
            'overnight': shared_1.CargoServiceType.OVERNIGHT,
            'economy': shared_1.CargoServiceType.ECONOMY,
            'premium': shared_1.CargoServiceType.PREMIUM
        };
        return mapping[yurticiType?.toLowerCase()] || shared_1.CargoServiceType.STANDARD;
    }
    mapYurticiStatusToOur(yurticiStatus) {
        const mapping = {
            'created': shared_1.TrackingStatus.CREATED,
            'picked_up': shared_1.TrackingStatus.PICKED_UP,
            'in_transit': shared_1.TrackingStatus.IN_TRANSIT,
            'out_for_delivery': shared_1.TrackingStatus.OUT_FOR_DELIVERY,
            'delivered': shared_1.TrackingStatus.DELIVERED,
            'exception': shared_1.TrackingStatus.EXCEPTION,
            'returned': shared_1.TrackingStatus.RETURNED
        };
        return mapping[yurticiStatus?.toLowerCase()] || shared_1.TrackingStatus.CREATED;
    }
}
exports.YurticiCargoService = YurticiCargoService;
//# sourceMappingURL=yurtici-cargo.service.js.map