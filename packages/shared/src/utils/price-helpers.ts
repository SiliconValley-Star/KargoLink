/**
 * Price calculation and manipulation utilities
 */
export const PriceHelpers = {
  /**
   * Calculate total price with tax
   */
  calculateWithTax: (basePrice: number, taxRate: number = 0.18): number => {
    return basePrice * (1 + taxRate);
  },

  /**
   * Calculate tax amount from total price
   */
  calculateTaxAmount: (basePrice: number, taxRate: number = 0.18): number => {
    return basePrice * taxRate;
  },

  /**
   * Calculate discount amount
   */
  calculateDiscountAmount: (
    originalPrice: number,
    discountPercent: number
  ): number => {
    return originalPrice * (discountPercent / 100);
  },

  /**
   * Apply discount to price
   */
  applyDiscount: (
    originalPrice: number,
    discountPercent: number
  ): number => {
    return originalPrice * (1 - discountPercent / 100);
  },

  /**
   * Calculate commission amount
   */
  calculateCommission: (
    totalAmount: number,
    commissionRate: number
  ): number => {
    return totalAmount * commissionRate;
  },

  /**
   * Calculate net amount after commission
   */
  calculateNetAmount: (
    totalAmount: number,
    commissionRate: number
  ): number => {
    return totalAmount * (1 - commissionRate);
  },

  /**
   * Calculate shipping cost based on weight and distance
   */
  calculateShippingCost: (
    weight: number, // kg
    distance: number, // km
    pricePerKg: number = 5, // TRY per kg
    pricePerKm: number = 0.5, // TRY per km
    minimumCost: number = 15 // Minimum shipping cost
  ): number => {
    const weightCost = weight * pricePerKg;
    const distanceCost = distance * pricePerKm;
    const totalCost = weightCost + distanceCost;
    
    return Math.max(totalCost, minimumCost);
  },

  /**
   * Calculate insurance cost based on declared value
   */
  calculateInsuranceCost: (
    declaredValue: number,
    insuranceRate: number = 0.002, // 0.2% of declared value
    minimumCost: number = 5
  ): number => {
    const calculatedCost = declaredValue * insuranceRate;
    return Math.max(calculatedCost, minimumCost);
  },

  /**
   * Calculate fuel surcharge
   */
  calculateFuelSurcharge: (
    baseCost: number,
    fuelSurchargeRate: number = 0.15 // 15% fuel surcharge
  ): number => {
    return baseCost * fuelSurchargeRate;
  },

  /**
   * Calculate express delivery surcharge
   */
  calculateExpressSurcharge: (
    baseCost: number,
    serviceType: 'same_day' | 'next_day' | 'express' | 'standard'
  ): number => {
    const surchargeRates = {
      same_day: 2.0,   // 100% surcharge
      next_day: 0.5,   // 50% surcharge
      express: 0.25,   // 25% surcharge
      standard: 0      // No surcharge
    };

    return baseCost * surchargeRates[serviceType];
  },

  /**
   * Calculate weekend delivery surcharge
   */
  calculateWeekendSurcharge: (
    baseCost: number,
    isWeekendDelivery: boolean,
    surchargeRate: number = 0.2
  ): number => {
    return isWeekendDelivery ? baseCost * surchargeRate : 0;
  },

  /**
   * Calculate special service costs
   */
  calculateSpecialServiceCosts: (
    baseCost: number,
    services: {
      coldChain?: boolean;
      fragileHandling?: boolean;
      signatureRequired?: boolean;
      appointmentDelivery?: boolean;
    }
  ): number => {
    let additionalCost = 0;

    if (services.coldChain) {
      additionalCost += baseCost * 0.3; // 30% surcharge for cold chain
    }

    if (services.fragileHandling) {
      additionalCost += baseCost * 0.15; // 15% surcharge for fragile handling
    }

    if (services.signatureRequired) {
      additionalCost += 5; // Fixed 5 TRY for signature required
    }

    if (services.appointmentDelivery) {
      additionalCost += baseCost * 0.1; // 10% surcharge for appointment delivery
    }

    return additionalCost;
  },

  /**
   * Calculate total shipping quote
   */
  calculateTotalQuote: (params: {
    weight: number;
    distance: number;
    declaredValue?: number;
    serviceType: 'same_day' | 'next_day' | 'express' | 'standard';
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
  }): {
    baseCost: number;
    expressSurcharge: number;
    weekendSurcharge: number;
    fuelSurcharge: number;
    insuranceCost: number;
    specialServiceCosts: number;
    subtotal: number;
    tax: number;
    total: number;
  } => {
    const rates = params.carrierRates || {};
    
    // Calculate base shipping cost
    const baseCost = PriceHelpers.calculateShippingCost(
      params.weight,
      params.distance,
      rates.pricePerKg,
      rates.pricePerKm,
      rates.minimumCost
    );

    // Calculate surcharges
    const expressSurcharge = PriceHelpers.calculateExpressSurcharge(
      baseCost,
      params.serviceType
    );

    const weekendSurcharge = PriceHelpers.calculateWeekendSurcharge(
      baseCost,
      params.isWeekendDelivery || false
    );

    const fuelSurcharge = PriceHelpers.calculateFuelSurcharge(
      baseCost,
      rates.fuelSurchargeRate
    );

    // Calculate insurance
    const insuranceCost = params.requiresInsurance && params.declaredValue
      ? PriceHelpers.calculateInsuranceCost(params.declaredValue)
      : 0;

    // Calculate special services
    const specialServiceCosts = params.specialServices
      ? PriceHelpers.calculateSpecialServiceCosts(baseCost, params.specialServices)
      : 0;

    // Calculate subtotal
    const subtotal = baseCost + expressSurcharge + weekendSurcharge + 
                    fuelSurcharge + insuranceCost + specialServiceCosts;

    // Calculate tax (18% KDV in Turkey)
    const tax = PriceHelpers.calculateTaxAmount(subtotal);

    // Calculate total
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

  /**
   * Compare prices between carriers
   */
  compareCarrierPrices: (quotes: Array<{
    carrierId: string;
    carrierName: string;
    totalCost: number;
    estimatedDeliveryDays: number;
    rating: number;
  }>): Array<{
    carrierId: string;
    carrierName: string;
    totalCost: number;
    estimatedDeliveryDays: number;
    rating: number;
    isLowestPrice: boolean;
    isFastestDelivery: boolean;
    isHighestRated: boolean;
    valueScore: number; // Combined price, speed, rating score
  }> => {
    if (quotes.length === 0) return [];

    const lowestPrice = Math.min(...quotes.map(q => q.totalCost));
    const fastestDelivery = Math.min(...quotes.map(q => q.estimatedDeliveryDays));
    const highestRating = Math.max(...quotes.map(q => q.rating));

    return quotes.map(quote => {
      // Calculate value score (0-100, higher is better)
      const priceScore = ((lowestPrice / quote.totalCost) * 40); // 40% weight for price
      const speedScore = ((fastestDelivery / quote.estimatedDeliveryDays) * 30); // 30% weight for speed
      const ratingScore = ((quote.rating / 5) * 30); // 30% weight for rating
      const valueScore = priceScore + speedScore + ratingScore;

      return {
        ...quote,
        isLowestPrice: quote.totalCost === lowestPrice,
        isFastestDelivery: quote.estimatedDeliveryDays === fastestDelivery,
        isHighestRated: quote.rating === highestRating,
        valueScore: Math.round(valueScore * 100) / 100,
      };
    }).sort((a, b) => b.valueScore - a.valueScore); // Sort by best value
  },

  /**
   * Calculate payment installment options
   */
  calculateInstallments: (
    totalAmount: number,
    interestRates: Record<number, number> // installmentCount -> interestRate
  ): Array<{
    installmentCount: number;
    monthlyAmount: number;
    totalAmount: number;
    interestAmount: number;
    interestRate: number;
  }> => {
    return Object.entries(interestRates).map(([count, rate]) => {
      const installmentCount = parseInt(count);
      const monthlyInterestRate = rate / 12 / 100; // Convert annual rate to monthly decimal
      
      let monthlyAmount: number;
      let finalTotalAmount: number;
      
      if (rate === 0) {
        // No interest
        monthlyAmount = totalAmount / installmentCount;
        finalTotalAmount = totalAmount;
      } else {
        // Calculate with compound interest
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

  /**
   * Format price for display
   */
  formatPrice: (
    amount: number,
    currency: 'TRY' | 'USD' | 'EUR' = 'TRY',
    includeSymbol: boolean = true
  ): string => {
    const formatted = new Intl.NumberFormat('tr-TR', {
      style: includeSymbol ? 'currency' : 'decimal',
      currency: includeSymbol ? currency : undefined,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return formatted;
  }
};

export default PriceHelpers;