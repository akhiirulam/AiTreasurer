"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = void 0;
const google_auth_library_1 = require("google-auth-library");
const userRegistration_model_1 = __importDefault(require("../../models/userRegistration.model"));
const token_1 = require("../../utils/token/token");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required",
            });
        }
        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({
                success: false,
                message: "Invalid Google token",
            });
        }
        const { sub: googleId, email, name, picture } = payload;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Google account email not available",
            });
        }
        const normalizedEmail = email.toLowerCase().trim();
        // Find existing user
        let user = await userRegistration_model_1.default.findOne({
            email: normalizedEmail,
        });
        // Create user if not found
        if (!user) {
            user = await userRegistration_model_1.default.create({
                fullName: name || "Google User",
                email: normalizedEmail,
                googleId,
                profileImage: picture || null,
                authProvider: "google",
                isEmailVerified: true,
                isMobileVerified: false,
                role: "owner",
                accountStatus: "active",
            });
        }
        // Check account status
        if (user.accountStatus !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is not active",
            });
        }
        // Generate your application's tokens
        const accessToken = (0, token_1.generateAccessToken)(user._id.toString(), user.role);
        const refreshToken = (0, token_1.generateRefreshToken)(user._id.toString(), user.role);
        // Store refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            success: true,
            message: "Google login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.fullName,
                    email: user.email,
                    profileImage: user.profileImage,
                    role: user.role,
                },
                accessToken,
            },
        });
    }
    catch (error) {
        console.error("Google login error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid Google credential",
        });
    }
};
exports.googleLogin = googleLogin;
