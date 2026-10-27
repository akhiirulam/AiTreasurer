"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_service_1 = __importDefault(require("../../services/dashboard/dashboard.service"));
class DashboardController {
    /**
     * Get dashboard data.
     *
     * GET /api/v1/dashboard
     * GET /api/v1/dashboard?from=2026-09-01&to=2026-09-30
     */
    async getDashboard(req, res, next) {
        try {
            const userId = req.userId;
            // ================================================
            // 1. Authentication check
            // ================================================
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            // ================================================
            // 2. Read date filters
            // ================================================
            const fromParam = typeof req.query.from === "string" ? req.query.from : undefined;
            const toParam = typeof req.query.to === "string" ? req.query.to : undefined;
            let from;
            let to;
            // ================================================
            // 3. Validate From date
            // ================================================
            if (fromParam) {
                from = new Date(`${fromParam}T00:00:00.000Z`);
                if (Number.isNaN(from.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid from date",
                    });
                }
            }
            // ================================================
            // 4. Validate To date
            // ================================================
            if (toParam) {
                to = new Date(`${toParam}T23:59:59.999Z`);
                if (Number.isNaN(to.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid to date",
                    });
                }
            }
            // ================================================
            // 5. Validate date range
            // ================================================
            if (from && to && from > to) {
                return res.status(400).json({
                    success: false,
                    message: "From date cannot be after to date",
                });
            }
            // ================================================
            // 6. Get dashboard data
            // ================================================
            const dashboard = await dashboard_service_1.default.getDashboard(userId, from, to);
            // ================================================
            // 7. Response
            // ================================================
            return res.status(200).json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new DashboardController();
