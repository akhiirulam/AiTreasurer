"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const balanceSheet_service_1 = __importDefault(require("../../services/balanceSheet/balanceSheet.service"));
class BalanceSheetController {
    async getBalanceSheet(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { to } = req.query;
            // ----------------------------------------------
            // Validate userId
            // ----------------------------------------------
            if (!userId || Array.isArray(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid user ID is required",
                });
            }
            if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
            }
            // ----------------------------------------------
            // Validate date
            // ----------------------------------------------
            let toDate;
            if (to !== undefined) {
                if (Array.isArray(to)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid to date",
                    });
                }
                toDate = new Date(`${to}T23:59:59.999Z`);
                if (isNaN(toDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid to date",
                    });
                }
            }
            // ----------------------------------------------
            // Get Balance Sheet
            // ----------------------------------------------
            const result = await balanceSheet_service_1.default.getBalanceSheet(userId, toDate);
            return res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new BalanceSheetController();
