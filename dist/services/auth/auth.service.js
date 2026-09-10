"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userRegistration_model_1 = __importDefault(require("../../models/userRegistration.model"));
const token_1 = require("../../utils/token/token");
class AuthService {
    /**
     * Generate a new access token using
     * the refresh token.
     */
    async refreshAccessToken(refreshToken) {
        // ==================================================
        // 1. CHECK REFRESH TOKEN
        // ==================================================
        if (!refreshToken) {
            throw new Error("Refresh token is required");
        }
        // ==================================================
        // 2. VERIFY REFRESH TOKEN
        // ==================================================
        const decoded = (0, token_1.verifyRefreshToken)(refreshToken);
        // ==================================================
        // 3. FIND USER
        // ==================================================
        const user = await userRegistration_model_1.default.findById(decoded.id);
        if (!user) {
            throw new Error("User not found");
        }
        // ==================================================
        // 4. CHECK ACCOUNT STATUS
        // ==================================================
        if (user.accountStatus !== "active") {
            throw new Error("Your account is not active");
        }
        // ==================================================
        // 5. GENERATE NEW ACCESS TOKEN
        // ==================================================
        const accessToken = (0, token_1.generateAccessToken)(user._id.toString(), user.role);
        // ==================================================
        // 6. RETURN AUTH DATA
        // ==================================================
        return {
            user: {
                id: user._id.toString(),
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
            accessToken,
        };
    }
}
exports.default = new AuthService();
