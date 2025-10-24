"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIMENSION_UNITS = exports.WEIGHT_UNITS = exports.CURRENCY = exports.NotificationType = exports.PaymentProvider = exports.PaymentMethod = exports.ServiceType = exports.CarrierType = exports.PaymentStatus = exports.ShipmentStatus = exports.SpecialRequirement = exports.PackageType = void 0;
__exportStar(require("./types/user.types"), exports);
__exportStar(require("./types/common.types"), exports);
__exportStar(require("./types/cargo-service.types"), exports);
var PackageType;
(function (PackageType) {
    PackageType["DOCUMENT"] = "DOCUMENT";
    PackageType["PARCEL"] = "PARCEL";
    PackageType["FOOD"] = "FOOD";
    PackageType["FRAGILE"] = "FRAGILE";
    PackageType["LIQUID"] = "LIQUID";
    PackageType["ELECTRONICS"] = "ELECTRONICS";
    PackageType["TEXTILE"] = "TEXTILE";
    PackageType["AUTOMOTIVE"] = "AUTOMOTIVE";
    PackageType["INDUSTRIAL"] = "INDUSTRIAL";
    PackageType["OTHER"] = "OTHER";
})(PackageType || (exports.PackageType = PackageType = {}));
var SpecialRequirement;
(function (SpecialRequirement) {
    SpecialRequirement["COLD_CHAIN"] = "COLD_CHAIN";
    SpecialRequirement["FRAGILE_HANDLING"] = "FRAGILE_HANDLING";
    SpecialRequirement["EXPRESS_DELIVERY"] = "EXPRESS_DELIVERY";
    SpecialRequirement["INSURANCE_REQUIRED"] = "INSURANCE_REQUIRED";
    SpecialRequirement["SIGNATURE_REQUIRED"] = "SIGNATURE_REQUIRED";
    SpecialRequirement["WEEKEND_DELIVERY"] = "WEEKEND_DELIVERY";
    SpecialRequirement["MORNING_DELIVERY"] = "MORNING_DELIVERY";
    SpecialRequirement["EVENING_DELIVERY"] = "EVENING_DELIVERY";
})(SpecialRequirement || (exports.SpecialRequirement = SpecialRequirement = {}));
var ShipmentStatus;
(function (ShipmentStatus) {
    ShipmentStatus["PENDING"] = "PENDING";
    ShipmentStatus["QUOTED"] = "QUOTED";
    ShipmentStatus["BOOKED"] = "BOOKED";
    ShipmentStatus["PICKED_UP"] = "PICKED_UP";
    ShipmentStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ShipmentStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    ShipmentStatus["DELIVERED"] = "DELIVERED";
    ShipmentStatus["CANCELLED"] = "CANCELLED";
    ShipmentStatus["RETURNED"] = "RETURNED";
    ShipmentStatus["LOST"] = "LOST";
    ShipmentStatus["DAMAGED"] = "DAMAGED";
})(ShipmentStatus || (exports.ShipmentStatus = ShipmentStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["PARTIAL_REFUND"] = "PARTIAL_REFUND";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var CarrierType;
(function (CarrierType) {
    CarrierType["CORPORATE"] = "CORPORATE";
    CarrierType["INDIVIDUAL"] = "INDIVIDUAL";
    CarrierType["PARTNER"] = "PARTNER";
})(CarrierType || (exports.CarrierType = CarrierType = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["STANDARD"] = "STANDARD";
    ServiceType["EXPRESS"] = "EXPRESS";
    ServiceType["OVERNIGHT"] = "OVERNIGHT";
    ServiceType["SAME_DAY"] = "SAME_DAY";
    ServiceType["INTERNATIONAL"] = "INTERNATIONAL";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["WALLET"] = "WALLET";
    PaymentMethod["CASH_ON_DELIVERY"] = "CASH_ON_DELIVERY";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["IYZICO"] = "IYZICO";
    PaymentProvider["PAYTR"] = "PAYTR";
    PaymentProvider["STRIPE"] = "STRIPE";
    PaymentProvider["INTERNAL"] = "INTERNAL";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["SHIPMENT_UPDATE"] = "SHIPMENT_UPDATE";
    NotificationType["PAYMENT_SUCCESS"] = "PAYMENT_SUCCESS";
    NotificationType["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    NotificationType["DELIVERY_REMINDER"] = "DELIVERY_REMINDER";
    NotificationType["PROMOTION"] = "PROMOTION";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
exports.CURRENCY = {
    TRY: 'TRY',
    USD: 'USD',
    EUR: 'EUR',
};
exports.WEIGHT_UNITS = {
    KG: 'kg',
    G: 'g',
    LB: 'lb',
};
exports.DIMENSION_UNITS = {
    CM: 'cm',
    M: 'm',
    IN: 'in',
    FT: 'ft',
};
__exportStar(require("./components/index"), exports);
__exportStar(require("./animations/index"), exports);
__exportStar(require("./utils/performance"), exports);
//# sourceMappingURL=index.js.map