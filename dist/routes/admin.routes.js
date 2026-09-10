"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const authorize_middleware_1 = __importDefault(require("../middleware/authorize.middleware"));
const admin_controller_1 = require("../controllers/admin/admin.controller");
const router = (0, express_1.Router)();
// =====================================================
// ADMIN DASHBOARD
// =====================================================
router.get("/dashboard", auth_middleware_1.default, (0, authorize_middleware_1.default)("admin"), admin_controller_1.getAdminDashboard);
// =====================================================
// USER MANAGEMENT
// =====================================================
router.get("/users", auth_middleware_1.default, (0, authorize_middleware_1.default)("admin"), admin_controller_1.getAllUsers);
router.get("/users/:userId", auth_middleware_1.default, (0, authorize_middleware_1.default)("admin"), admin_controller_1.getUserById);
router.patch("/users/:userId/status", auth_middleware_1.default, (0, authorize_middleware_1.default)("admin"), admin_controller_1.updateUserStatus);
exports.default = router;
