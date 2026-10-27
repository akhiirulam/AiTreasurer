"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const accountsPayable_service_1 = __importDefault(require("../../services/accountsPayable/accountsPayable.service"));
class AccountsPayableController {
    async getAccountsPayable(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { from, to } = req.query;
            // ==========================================
            // 1. VALIDATE USER ID
            // ==========================================
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
            }
            if (Array.isArray(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
            }
            // ==========================================
            // 2. VALIDATE DATE PARAMETERS
            // ==========================================
            if (Array.isArray(from) || Array.isArray(to)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date parameters",
                });
            }
            // ==========================================
            // 3. CONVERT DATES
            // ==========================================
            const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;
            const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined;
            // ==========================================
            // 4. VALIDATE FROM DATE
            // ==========================================
            if (fromDate && isNaN(fromDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid from date",
                });
            }
            // ==========================================
            // 5. VALIDATE TO DATE
            // ==========================================
            if (toDate && isNaN(toDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid to date",
                });
            }
            // ==========================================
            // 6. VALIDATE DATE RANGE
            // ==========================================
            if (fromDate && toDate && fromDate > toDate) {
                return res.status(400).json({
                    success: false,
                    message: "From date cannot be later than to date",
                });
            }
            // ==========================================
            // 7. GET REPORT
            // ==========================================
            const result = await accountsPayable_service_1.default.getAccountsPayable(userId, fromDate, toDate);
            // ==========================================
            // 8. RESPONSE
            // ==========================================
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
exports.default = new AccountsPayableController();
