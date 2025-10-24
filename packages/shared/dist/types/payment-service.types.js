"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhookEvent = exports.RefundReason = exports.ServiceCurrency = exports.ServicePaymentStatus = exports.ServicePaymentMethod = exports.ServicePaymentProvider = void 0;
var ServicePaymentProvider;
(function (ServicePaymentProvider) {
    ServicePaymentProvider["IYZICO"] = "iyzico";
    ServicePaymentProvider["PAYTR"] = "paytr";
    ServicePaymentProvider["STRIPE"] = "stripe";
    ServicePaymentProvider["PAYPAL"] = "paypal";
})(ServicePaymentProvider || (exports.ServicePaymentProvider = ServicePaymentProvider = {}));
var ServicePaymentMethod;
(function (ServicePaymentMethod) {
    ServicePaymentMethod["CREDIT_CARD"] = "credit_card";
    ServicePaymentMethod["DEBIT_CARD"] = "debit_card";
    ServicePaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    ServicePaymentMethod["DIGITAL_WALLET"] = "digital_wallet";
    ServicePaymentMethod["CASH_ON_DELIVERY"] = "cash_on_delivery";
})(ServicePaymentMethod || (exports.ServicePaymentMethod = ServicePaymentMethod = {}));
var ServicePaymentStatus;
(function (ServicePaymentStatus) {
    ServicePaymentStatus["PENDING"] = "pending";
    ServicePaymentStatus["PROCESSING"] = "processing";
    ServicePaymentStatus["SUCCESS"] = "success";
    ServicePaymentStatus["FAILED"] = "failed";
    ServicePaymentStatus["CANCELLED"] = "cancelled";
    ServicePaymentStatus["REFUNDED"] = "refunded";
    ServicePaymentStatus["PARTIALLY_REFUNDED"] = "partially_refunded";
})(ServicePaymentStatus || (exports.ServicePaymentStatus = ServicePaymentStatus = {}));
var ServiceCurrency;
(function (ServiceCurrency) {
    ServiceCurrency["TRY"] = "TRY";
    ServiceCurrency["USD"] = "USD";
    ServiceCurrency["EUR"] = "EUR";
    ServiceCurrency["GBP"] = "GBP";
})(ServiceCurrency || (exports.ServiceCurrency = ServiceCurrency = {}));
var RefundReason;
(function (RefundReason) {
    RefundReason["CUSTOMER_REQUEST"] = "customer_request";
    RefundReason["SHIPMENT_CANCELLED"] = "shipment_cancelled";
    RefundReason["SERVICE_ISSUE"] = "service_issue";
    RefundReason["FRAUD_PREVENTION"] = "fraud_prevention";
    RefundReason["DUPLICATE_PAYMENT"] = "duplicate_payment";
})(RefundReason || (exports.RefundReason = RefundReason = {}));
var PaymentWebhookEvent;
(function (PaymentWebhookEvent) {
    PaymentWebhookEvent["PAYMENT_SUCCESS"] = "payment.success";
    PaymentWebhookEvent["PAYMENT_FAILED"] = "payment.failed";
    PaymentWebhookEvent["PAYMENT_CANCELLED"] = "payment.cancelled";
    PaymentWebhookEvent["REFUND_SUCCESS"] = "refund.success";
    PaymentWebhookEvent["REFUND_FAILED"] = "refund.failed";
    PaymentWebhookEvent["CHARGEBACK"] = "chargeback";
})(PaymentWebhookEvent || (exports.PaymentWebhookEvent = PaymentWebhookEvent = {}));
//# sourceMappingURL=payment-service.types.js.map