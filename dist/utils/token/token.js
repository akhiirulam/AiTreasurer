"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// =====================================================
// ACCESS TOKEN
// =====================================================
const generateAccessToken = (userId, role) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return jsonwebtoken_1.default.sign({
        id: userId,
        role,
    }, secret, {
        expiresIn: "15m",
    });
};
exports.generateAccessToken = generateAccessToken;
// =====================================================
// REFRESH TOKEN
// =====================================================
const generateRefreshToken = (userId, role) => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
        throw new Error("JWT_REFRESH_SECRET is not configured");
    }
    return jsonwebtoken_1.default.sign({
        id: userId,
        role,
    }, secret, {
        expiresIn: "7d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
// =====================================================
// VERIFY ACCESS TOKEN
// =====================================================
const verifyAccessToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    if (!decoded.id || !decoded.role) {
        throw new Error("Invalid access token payload");
    }
    return decoded;
};
exports.verifyAccessToken = verifyAccessToken;
// =====================================================
// VERIFY REFRESH TOKEN
// =====================================================
const verifyRefreshToken = (token) => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
        throw new Error("JWT_REFRESH_SECRET is not configured");
    }
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    if (!decoded.id || !decoded.role) {
        throw new Error("Invalid refresh token payload");
    }
    return decoded;
};
exports.verifyRefreshToken = verifyRefreshToken;
