"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Role-based authorization middleware.
 *
 * Usage:
 *
 * router.get(
 *   "/admin",
 *   authenticate,
 *   authorize("admin"),
 *   controller,
 * );
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // ==========================================
            // 1. CHECK AUTHENTICATED USER
            // ==========================================
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            // ==========================================
            // 2. CHECK USER ROLE
            // ==========================================
            if (!req.userRole) {
                return res.status(403).json({
                    success: false,
                    message: "User role not found",
                });
            }
            // ==========================================
            // 3. CHECK PERMISSION
            // ==========================================
            if (!allowedRoles.includes(req.userRole)) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to access this resource",
                });
            }
            // ==========================================
            // 4. ALLOW ACCESS
            // ==========================================
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.default = authorize;
