"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceHelpers = void 0;
exports.PriceHelpers = {
    calculateWithTax: (basePrice, taxRate = 0.18) => {
        return basePrice * (1 + taxRate);
    },
    calculateTaxAmount: (basePrice, taxRate = 0.18) => {
        return basePrice * taxRate;
    },
    calculateDiscountAmount: (originalPrice, discountPercent) => {
        return originalPrice * (discountPercent / 100);
    },
    applyDiscount: (originalPrice, discountPercent) => {
        return originalPrice * (1 - discountPercent / 100);
    },
    calculateCommission: (totalAmount, commissionRate) => {
        return totalAmount * commissionRate;
    },
    calculateNetAmount: (totalAmount, commissionRate) => {
        return totalAmount * (1 - commissionRate);
    },
    calculateShippingCost: (weight, distance, pricePerKg = 5, pricePerKm = 0.5, minimumCost = 15) => {
        const weightCost = weight * pricePerKg;
        const distanceCost = distance * pricePerKm;
        const totalCost = weightCost + distanceCost;
        return Math.max(totalCost, minimumCost);
    },
    calculateInsuranceCost: (declaredValue, insuranceRate = 0.002, minimumCost = 5) => {
        const calculatedCost = declaredValue * insuranceRate;
        return Math.max(calculatedCost, minimumCost);
    },
    calculateFuelSurcharge: (baseCost, fuelSurchargeRate = 0.15) => {
        return baseCost * fuelSurchargeRate;
    },
    calculateExpressSurcharge: (baseCost, serviceType) => {
        const surchargeRates = {
            same_day: 2.0,
            next_day: 0.5,
            express: 0.25,
            standard: 0
        };
        return baseCost * surchargeRates[serviceType];
    },
    calculateWeekendSurcharge: (baseCost, isWeekendDelivery, surchargeRate = 0.2) => {
        return isWeekendDelivery ? baseCost * surchargeRate : 0;
    },
    calculateSpecialServiceCosts: (baseCost, services) => {
        let additionalCost = 0;
        if (services.coldChain) {
            additionalCost += baseCost * 0.3;
        }
        if (services.fragileHandling) {
            additionalCost += baseCost * 0.15;
        }
        if (services.signatureRequired) {
            additionalCost += 5;
        }
        if (services.appointmentDelivery) {
            additionalCost += baseCost * 0.1;
        }
        return additionalCost;
    },
    calculateTotalQuote: (params) => {
        const rates = params.carrierRates || {};
        const baseCost = exports.PriceHelpers.calculateShippingCost(params.weight, params.distance, rates.pricePerKg, rates.pricePerKm, rates.minimumCost);
        const expressSurcharge = exports.PriceHelpers.calculateExpressSurcharge(baseCost, params.serviceType);
        const weekendSurcharge = exports.PriceHelpers.calculateWeekendSurcharge(baseCost, params.isWeekendDelivery || false);
        const fuelSurcharge = exports.PriceHelpers.calculateFuelSurcharge(baseCost, rates.fuelSurchargeRate);
        const insuranceCost = params.requiresInsurance && params.declaredValue
            ? exports.PriceHelpers.calculateInsuranceCost(params.declaredValue)
            : 0;
        const specialServiceCosts = params.specialServices
            ? exports.PriceHelpers.calculateSpecialServiceCosts(baseCost, params.specialServices)
            : 0;
        const subtotal = baseCost + expressSurcharge + weekendSurcharge +
            fuelSurcharge + insuranceCost + specialServiceCosts;
        const tax = exports.PriceHelpers.calculateTaxAmount(subtotal);
        const total = subtotal + tax;
        return {
            baseCost: Math.round(baseCost * 100) / 100,
            expressSurcharge: Math.round(expressSurcharge * 100) / 100,
            weekendSurcharge: Math.round(weekendSurcharge * 100) / 100,
            fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
            insuranceCost: Math.round(insuranceCost * 100) / 100,
            specialServiceCosts: Math.round(specialServiceCosts * 100) / 100,
            subtotal: Math.round(subtotal * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            total: Math.round(total * 100) / 100,
        };
    },
    compareCarrierPrices: (quotes) => {
        if (quotes.length === 0)
            return [];
        const lowestPrice = Math.min(...quotes.map(q => q.totalCost));
        const fastestDelivery = Math.min(...quotes.map(q => q.estimatedDeliveryDays));
        const highestRating = Math.max(...quotes.map(q => q.rating));
        return quotes.map(quote => {
            const priceScore = ((lowestPrice / quote.totalCost) * 40);
            const speedScore = ((fastestDelivery / quote.estimatedDeliveryDays) * 30);
            const ratingScore = ((quote.rating / 5) * 30);
            const valueScore = priceScore + speedScore + ratingScore;
            return {
                ...quote,
                isLowestPrice: quote.totalCost === lowestPrice,
                isFastestDelivery: quote.estimatedDeliveryDays === fastestDelivery,
                isHighestRated: quote.rating === highestRating,
                valueScore: Math.round(valueScore * 100) / 100,
            };
        }).sort((a, b) => b.valueScore - a.valueScore);
    },
    calculateInstallments: (totalAmount, interestRates) => {
        return Object.entries(interestRates).map(([count, rate]) => {
            const installmentCount = parseInt(count);
            const monthlyInterestRate = rate / 12 / 100;
            let monthlyAmount;
            let finalTotalAmount;
            if (rate === 0) {
                monthlyAmount = totalAmount / installmentCount;
                finalTotalAmount = totalAmount;
            }
            else {
                const factor = Math.pow(1 + monthlyInterestRate, installmentCount);
                monthlyAmount = (totalAmount * monthlyInterestRate * factor) / (factor - 1);
                finalTotalAmount = monthlyAmount * installmentCount;
            }
            const interestAmount = finalTotalAmount - totalAmount;
            return {
                installmentCount,
                monthlyAmount: Math.round(monthlyAmount * 100) / 100,
                totalAmount: Math.round(finalTotalAmount * 100) / 100,
                interestAmount: Math.round(interestAmount * 100) / 100,
                interestRate: rate,
            };
        });
    },
    formatPrice: (amount, currency = 'TRY', includeSymbol = true) => {
        const formatted = new Intl.NumberFormat('tr-TR', {
            style: includeSymbol ? 'currency' : 'decimal',
            currency: includeSymbol ? currency : undefined,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
        return formatted;
    }
};
exports.default = exports.PriceHelpers;
//# sourceMappingURL=price-helpers.js.map