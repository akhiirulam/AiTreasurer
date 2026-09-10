"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../utils/token/token");
const authenticate = (req, res, next) => {
    try {
        // ==========================================
        // 1. GET AUTHORIZATION HEADER
        // ==========================================
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access token required",
            });
        }
        // ==========================================
        // 2. EXTRACT BEARER TOKEN
        // ==========================================
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization header",
            });
        }
        const token = parts[1];
        // ==========================================
        // 3. VERIFY ACCESS TOKEN
        // ==========================================
        const decoded = (0, token_1.verifyAccessToken)(token);
        // ==========================================
        // 4. ATTACH USER DATA
        // ==========================================
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // ==========================================
        // 5. CONTINUE
        // ==========================================
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
        });
    }
};
exports.default = authenticate;
