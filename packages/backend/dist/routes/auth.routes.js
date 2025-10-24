"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
router.post('/register', (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 5 }), auth_controller_1.AuthController.register);
router.post('/login', (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 10 }), auth_controller_1.AuthController.login);
router.post('/refresh', (0, express_rate_limit_1.default)({ windowMs: 5 * 60 * 1000, max: 20 }), auth_controller_1.AuthController.refresh);
router.post('/logout', auth_1.authMiddleware, auth_controller_1.AuthController.logout);
router.get('/profile', auth_1.authMiddleware, auth_controller_1.AuthController.profile);
router.put('/profile', auth_1.authMiddleware, auth_controller_1.AuthController.updateProfile);
router.put('/change-password', auth_1.authMiddleware, (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 3 }), auth_controller_1.AuthController.changePassword);
router.get('/check', auth_1.optionalAuthMiddleware, (req, res) => {
    res.json({
        success: true,
        data: {
            authenticated: !!req.user,
            user: req.user || null
        }
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map