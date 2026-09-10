"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const admin_repository_1 = __importDefault(require("../../repositories/admin/admin.repository"));
class AdminService {
    // ==================================================
    // ADMIN DASHBOARD
    // ==================================================
    /**
     * Get Admin Dashboard data.
     */
    async getDashboard() {
        const [totalUsers, activeUsers, inactiveUsers, recentUsers] = await Promise.all([
            admin_repository_1.default.getTotalUsers(),
            admin_repository_1.default.getActiveUsers(),
            admin_repository_1.default.getInactiveUsers(),
            admin_repository_1.default.getRecentUsers(5),
        ]);
        // ==================================================
        // FORMAT RECENT USERS
        // ==================================================
        const formattedRecentUsers = recentUsers.map((user) => ({
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus,
            profileImage: user.profileImage ?? null,
            createdAt: user.createdAt,
        }));
        return {
            statistics: {
                totalUsers,
                activeUsers,
                inactiveUsers,
            },
            recentUsers: formattedRecentUsers,
        };
    }
    // ==================================================
    // GET ALL USERS
    // ==================================================
    /**
     * Get all platform users.
     */
    async getAllUsers() {
        const users = await admin_repository_1.default.getAllUsers();
        return users.map((user) => ({
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            mobileNumber: user.mobileNumber ?? null,
            role: user.role,
            accountStatus: user.accountStatus,
            profileImage: user.profileImage ?? null,
            createdAt: user.createdAt,
        }));
    }
    // ==================================================
    // GET USER BY ID
    // ==================================================
    /**
     * Get platform user details.
     */
    async getUserById(userId) {
        // Validate MongoDB ID
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        const user = await admin_repository_1.default.getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            mobileNumber: user.mobileNumber ?? null,
            role: user.role,
            accountStatus: user.accountStatus,
            profileImage: user.profileImage ?? null,
            createdAt: user.createdAt,
        };
    }
    // ==================================================
    // UPDATE USER STATUS
    // ==================================================
    /**
     * Activate or deactivate a platform user.
     */
    async updateUserStatus(userId, accountStatus) {
        // Validate MongoDB ID
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        // Validate account status
        if (accountStatus !== "active" && accountStatus !== "inactive") {
            throw new Error("Account status must be active or inactive");
        }
        // Update user
        const user = await admin_repository_1.default.updateUserStatus(userId, accountStatus);
        if (!user) {
            throw new Error("User not found");
        }
        return {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            mobileNumber: user.mobileNumber ?? null,
            role: user.role,
            accountStatus: user.accountStatus,
            profileImage: user.profileImage ?? null,
            createdAt: user.createdAt,
        };
    }
}
exports.default = new AdminService();
