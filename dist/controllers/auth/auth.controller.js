"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshAccessToken = exports.userLogin = exports.userRegistration = void 0;
const userRegistration_service_1 = __importDefault(require("../../services/auth/userRegistration.service"));
const loginUser_service_1 = __importDefault(require("../../services/auth/loginUser.service"));
const auth_service_1 = __importDefault(require("../../services/auth/auth.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
// =====================================================
// REGISTER
// =====================================================
exports.userRegistration = (0, asyncHandler_1.default)(async (req, res) => {
    const user = await userRegistration_service_1.default.registerUser(req.body);
    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
    });
});
// =====================================================
// LOGIN
// =====================================================
exports.userLogin = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const result = await loginUser_service_1.default.loginUser({
        email,
        password,
    });
    // ==================================================
    // REFRESH TOKEN COOKIE
    // ==================================================
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: {
            user: {
                id: result.user._id.toString(),
                fullName: result.user.fullName,
                email: result.user.email,
                role: result.user.role,
                profileImage: result.user.profileImage,
            },
            accessToken: result.accessToken,
        },
    });
});
// =====================================================
// REFRESH ACCESS TOKEN
// =====================================================
exports.refreshAccessToken = (0, asyncHandler_1.default)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token required",
        });
    }
    const result = await auth_service_1.default.refreshAccessToken(refreshToken);
    return res.status(200).json({
        success: true,
        message: "Access token refreshed successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});
// =====================================================
// LOGOUT
// =====================================================
exports.logout = (0, asyncHandler_1.default)(async (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    });
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});
