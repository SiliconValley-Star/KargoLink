export declare const PriceHelpers: {
    calculateWithTax: (basePrice: number, taxRate?: number) => number;
    calculateTaxAmount: (basePrice: number, taxRate?: number) => number;
    calculateDiscountAmount: (originalPrice: number, discountPercent: number) => number;
    applyDiscount: (originalPrice: number, discountPercent: number) => number;
    calculateCommission: (totalAmount: number, commissionRate: number) => number;
    calculateNetAmount: (totalAmount: number, commissionRate: number) => number;
    calculateShippingCost: (weight: number, distance: number, pricePerKg?: number, pricePerKm?: number, minimumCost?: number) => number;
    calculateInsuranceCost: (declaredValue: number, insuranceRate?: number, minimumCost?: number) => number;
    calculateFuelSurcharge: (baseCost: number, fuelSurchargeRate?: number) => number;
    calculateExpressSurcharge: (baseCost: number, serviceType: "same_day" | "next_day" | "express" | "standard") => number;
    calculateWeekendSurcharge: (baseCost: number, isWeekendDelivery: boolean, surchargeRate?: number) => number;
    calculateSpecialServiceCosts: (baseCost: number, services: {
        coldChain?: boolean;
        fragileHandling?: boolean;
        signatureRequired?: boolean;
        appointmentDelivery?: boolean;
    }) => number;
    calculateTotalQuote: (params: {
        weight: number;
        distance: number;
        declaredValue?: number;
        serviceType: "same_day" | "next_day" | "express" | "standard";
        isWeekendDelivery?: boolean;
        requiresInsurance?: boolean;
        specialServices?: {
            coldChain?: boolean;
            fragileHandling?: boolean;
            signatureRequired?: boolean;
            appointmentDelivery?: boolean;
        };
        carrierRates?: {
            pricePerKg?: number;
            pricePerKm?: number;
            minimumCost?: number;
            fuelSurchargeRate?: number;
        };
    }) => {
        baseCost: number;
        expressSurcharge: number;
        weekendSurcharge: number;
        fuelSurcharge: number;
        insuranceCost: number;
        specialServiceCosts: number;
        subtotal: number;
        tax: number;
        total: number;
    };
    compareCarrierPrices: (quotes: Array<{
        carrierId: string;
        carrierName: string;
        totalCost: number;
        estimatedDeliveryDays: number;
        rating: number;
    }>) => Array<{
        carrierId: string;
        carrierName: string;
        totalCost: number;
        estimatedDeliveryDays: number;
        rating: number;
        isLowestPrice: boolean;
        isFastestDelivery: boolean;
        isHighestRated: boolean;
        valueScore: number;
    }>;
    calculateInstallments: (totalAmount: number, interestRates: Record<number, number>) => Array<{
        installmentCount: number;
        monthlyAmount: number;
        totalAmount: number;
        interestAmount: number;
        interestRate: number;
    }>;
    formatPrice: (amount: number, currency?: "TRY" | "USD" | "EUR", includeSymbol?: boolean) => string;
};
export default PriceHelpers;
//# sourceMappingURL=price-helpers.d.ts.map