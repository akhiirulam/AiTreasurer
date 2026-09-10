"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reports_service_1 = __importDefault(require("../../services/reports/reports.service"));
class ReportsController {
    /**
     * Get financial report.
     *
     * GET /api/v1/reports
     * GET /api/v1/reports?from=2024-11-01&to=2024-11-30
     */
    async getReport(req, res, next) {
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
            // ================================================
            // 3. Validate dates
            // ================================================
            let from;
            let to;
            if (fromParam) {
                from = new Date(`${fromParam}T00:00:00.000Z`);
                if (Number.isNaN(from.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid from date",
                    });
                }
            }
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
            // 4. Validate date range
            // ================================================
            if (from && to && from > to) {
                return res.status(400).json({
                    success: false,
                    message: "From date cannot be after to date",
                });
            }
            // ================================================
            // 5. Get report
            // ================================================
            const report = await reports_service_1.default.getReport(userId, from, to);
            // ================================================
            // 6. Response
            // ================================================
            return res.status(200).json({
                success: true,
                data: report,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ReportsController();
