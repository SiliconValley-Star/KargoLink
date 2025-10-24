"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCargoService = void 0;
const axios_1 = __importDefault(require("axios"));
const shared_1 = require("@cargolink/shared");
class BaseCargoService {
    config;
    provider;
    httpClient;
    constructor(config) {
        this.config = config;
        this.provider = config.provider;
        this.httpClient = axios_1.default.create({
            baseURL: config.apiEndpoint,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'CargoLink/1.0.0'
            }
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        this.httpClient.interceptors.request.use((config) => {
            this.addAuthentication(config);
            return config;
        });
        this.httpClient.interceptors.response.use((response) => response, (error) => {
            throw this.handleHttpError(error);
        });
    }
    validateConfig() {
        if (!this.config.apiKey) {
            throw new Error(`API key is required for ${this.provider}`);
        }
        if (!this.config.apiEndpoint) {
            throw new Error(`API endpoint is required for ${this.provider}`);
        }
        return true;
    }
    isEnabled() {
        return this.config.enabled;
    }
    supportsServiceType(serviceType) {
        return this.config.supportedServices.includes(serviceType);
    }
    isWithinWeightLimits(totalWeight) {
        return totalWeight <= this.config.maxWeight;
    }
    isWithinDimensionLimits(width, height, length) {
        const { maxDimensions } = this.config;
        return (width <= maxDimensions.width &&
            height <= maxDimensions.height &&
            length <= maxDimensions.length);
    }
    createError(code, message, originalError, retryable = false) {
        return {
            code,
            message,
            provider: this.provider,
            originalError,
            retryable,
            timestamp: new Date().toISOString()
        };
    }
    handleHttpError(error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            switch (status) {
                case 400:
                    return this.createError(shared_1.CargoErrorCode.INVALID_ADDRESS, data?.message || 'Invalid request parameters', error);
                case 401:
                case 403:
                    return this.createError(shared_1.CargoErrorCode.INVALID_CREDENTIALS, 'Invalid API credentials', error);
                case 429:
                    return this.createError(shared_1.CargoErrorCode.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded, please try again later', error, true);
                case 500:
                case 502:
                case 503:
                case 504:
                    return this.createError(shared_1.CargoErrorCode.SERVICE_UNAVAILABLE, 'Cargo service temporarily unavailable', error, true);
                default:
                    return this.createError(shared_1.CargoErrorCode.UNKNOWN_ERROR, data?.message || 'Unknown error occurred', error);
            }
        }
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return this.createError(shared_1.CargoErrorCode.CONNECTION_FAILED, 'Failed to connect to cargo service', error, true);
        }
        if (error.code === 'ETIMEDOUT') {
            return this.createError(shared_1.CargoErrorCode.TIMEOUT, 'Request timeout', error, true);
        }
        return this.createError(shared_1.CargoErrorCode.UNKNOWN_ERROR, error.message || 'Unknown error occurred', error);
    }
    validateQuoteRequest(request) {
        if (!request.fromAddress || !request.toAddress) {
            throw this.createError(shared_1.CargoErrorCode.INVALID_ADDRESS, 'From and to addresses are required');
        }
        if (!request.packages || request.packages.length === 0) {
            throw this.createError(shared_1.CargoErrorCode.PACKAGE_TOO_HEAVY, 'At least one package is required');
        }
        const totalWeight = request.packages.reduce((sum, pkg) => sum + pkg.weight, 0);
        if (!this.isWithinWeightLimits(totalWeight)) {
            throw this.createError(shared_1.CargoErrorCode.PACKAGE_TOO_HEAVY, `Total weight ${totalWeight}kg exceeds limit of ${this.config.maxWeight}kg`);
        }
        for (const pkg of request.packages) {
            if (!this.isWithinDimensionLimits(pkg.width, pkg.height, pkg.length)) {
                throw this.createError(shared_1.CargoErrorCode.PACKAGE_TOO_LARGE, `Package dimensions exceed maximum allowed size`);
            }
        }
    }
    async checkRateLimit() {
    }
    logRequest(method, url, data) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${this.provider}] ${method} ${url}`, data ? JSON.stringify(data, null, 2) : '');
        }
    }
    logResponse(method, url, response) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${this.provider}] Response for ${method} ${url}`, JSON.stringify(response, null, 2));
        }
    }
    async makeRequest(method, url, data, headers) {
        try {
            await this.checkRateLimit();
            this.logRequest(method, url, data);
            const response = await this.httpClient({
                method,
                url,
                data,
                headers
            });
            this.logResponse(method, url, response.data);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.BaseCargoService = BaseCargoService;
//# sourceMappingURL=base-cargo.service.js.map