"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)('admin'), (0, express_rate_limit_1.default)({ windowMs: 5 * 60 * 1000, max: 100 }), user_controller_1.UserController.getUsers);
router.get('/stats', auth_1.authMiddleware, (0, auth_1.requireRole)('admin'), (0, express_rate_limit_1.default)({ windowMs: 5 * 60 * 1000, max: 50 }), user_controller_1.UserController.getUserStats);
router.get('/:id', auth_1.authMiddleware, (0, express_rate_limit_1.default)({ windowMs: 5 * 60 * 1000, max: 200 }), user_controller_1.UserController.getUserById);
router.put('/:id', auth_1.authMiddleware, (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 20 }), user_controller_1.UserController.updateUser);
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)('admin'), (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 10 }), user_controller_1.UserController.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map