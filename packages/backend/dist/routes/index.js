"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoutes = void 0;
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const shipment_routes_1 = require("./shipment.routes");
const payment_routes_1 = require("./payment.routes");
const upload_routes_1 = __importDefault(require("./upload.routes"));
const notification_routes_1 = require("./notification.routes");
const health_routes_1 = require("./health.routes");
const router = (0, express_1.Router)();
exports.apiRoutes = router;
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/shipments', shipment_routes_1.shipmentRoutes);
router.use('/upload', upload_routes_1.default);
router.use('/notifications', notification_routes_1.notificationRoutes);
router.use('/', health_routes_1.healthRoutes);
const paymentController = global.paymentController;
if (paymentController) {
    router.use('/payments', (0, payment_routes_1.createPaymentRoutes)(paymentController));
}
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'CargoLink API v1',
        version: '1.0.0',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            shipments: '/api/v1/shipments',
            cargo: '/api/v1/cargo',
            payments: '/api/v1/payments',
            upload: '/api/v1/upload',
            notifications: '/api/v1/notifications',
            health: '/api/v1/health'
        },
        documentation: 'https://docs.cargolink.com/api',
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=index.js.map