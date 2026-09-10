"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.getUserById = exports.getAllUsers = exports.getAdminDashboard = void 0;
const admin_service_1 = __importDefault(require("../../services/admin/admin.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
// =====================================================
// ADMIN DASHBOARD
// =====================================================
exports.getAdminDashboard = (0, asyncHandler_1.default)(async (_req, res) => {
    const data = await admin_service_1.default.getDashboard();
    return res.status(200).json({
        success: true,
        message: "Admin dashboard fetched successfully",
        data,
    });
});
// =====================================================
// GET ALL USERS
// =====================================================
exports.getAllUsers = (0, asyncHandler_1.default)(async (_req, res) => {
    const users = await admin_service_1.default.getAllUsers();
    return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
    });
});
// =====================================================
// GET USER BY ID
// =====================================================
exports.getUserById = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    if (typeof userId !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }
    const user = await admin_service_1.default.getUserById(userId);
    return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user,
    });
});
// =====================================================
// UPDATE USER STATUS
// =====================================================
exports.updateUserStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const { accountStatus } = req.body;
    if (typeof userId !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }
    const user = await admin_service_1.default.updateUserStatus(userId, accountStatus);
    return res.status(200).json({
        success: true,
        message: "User status updated successfully",
        data: user,
    });
});
