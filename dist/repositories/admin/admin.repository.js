"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userRegistration_model_1 = __importDefault(require("../../models/userRegistration.model"));
class AdminRepository {
    // ==================================================
    // USER STATISTICS
    // ==================================================
    /**
     * Get total registered users.
     */
    async getTotalUsers() {
        return await userRegistration_model_1.default.countDocuments();
    }
    /**
     * Get active users.
     */
    async getActiveUsers() {
        return await userRegistration_model_1.default.countDocuments({
            accountStatus: "active",
        });
    }
    /**
     * Get inactive users.
     */
    async getInactiveUsers() {
        return await userRegistration_model_1.default.countDocuments({
            accountStatus: {
                $ne: "active",
            },
        });
    }
    // ==================================================
    // RECENT USERS
    // ==================================================
    /**
     * Get recently registered users.
     */
    async getRecentUsers(limit = 5) {
        return await userRegistration_model_1.default.find()
            .select("_id fullName email role accountStatus createdAt profileImage")
            .sort({
            createdAt: -1,
        })
            .limit(limit)
            .lean();
    }
    // ==================================================
    // GET ALL USERS
    // ==================================================
    /**
     * Get all platform users.
     */
    async getAllUsers() {
        return await userRegistration_model_1.default.find()
            .select("_id fullName email mobileNumber role accountStatus profileImage createdAt")
            .sort({
            createdAt: -1,
        })
            .lean();
    }
    // ==================================================
    // GET USER BY ID
    // ==================================================
    /**
     * Get one user by ID.
     */
    async getUserById(userId) {
        return await userRegistration_model_1.default.findById(userId)
            .select("_id fullName email mobileNumber role accountStatus profileImage createdAt")
            .lean();
    }
    // ==================================================
    // UPDATE USER STATUS
    // ==================================================
    /**
     * Activate or deactivate a user account.
     */
    async updateUserStatus(userId, accountStatus) {
        return await userRegistration_model_1.default.findByIdAndUpdate(userId, {
            accountStatus,
        }, {
            new: true,
            runValidators: true,
        })
            .select("_id fullName email mobileNumber role accountStatus profileImage createdAt")
            .lean();
    }
}
exports.default = new AdminRepository();
