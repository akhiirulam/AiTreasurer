"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customerLedger_service_1 = __importDefault(require("../../services/customer/customerLedger.service"));
class CustomerLedgerController {
    // =====================================================
    // GET CUSTOMER LEDGER
    // =====================================================
    async getCustomerLedger(req, res) {
        try {
            // ==================================================
            // 1. GET LOGGED-IN USER
            // ==================================================
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            // ==================================================
            // 2. GET CUSTOMER ID
            // ==================================================
            const customerId = String(req.params.customerId);
            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: "Customer ID is required",
                });
            }
            // ==================================================
            // 3. GET DATE PARAMETERS
            // ==================================================
            const { from, to } = req.query;
            // ==================================================
            // 4. VALIDATE QUERY PARAMETERS
            // ==================================================
            if (Array.isArray(from) || Array.isArray(to)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date parameters",
                });
            }
            // ==================================================
            // 5. CONVERT DATES
            // ==================================================
            const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;
            const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined;
            // ==================================================
            // 6. VALIDATE FROM DATE
            // ==================================================
            if (fromDate && isNaN(fromDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid from date",
                });
            }
            // ==================================================
            // 7. VALIDATE TO DATE
            // ==================================================
            if (toDate && isNaN(toDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid to date",
                });
            }
            // ==================================================
            // 8. VALIDATE DATE RANGE
            // ==================================================
            if (fromDate && toDate && fromDate > toDate) {
                return res.status(400).json({
                    success: false,
                    message: "From date cannot be later than to date",
                });
            }
            // ==================================================
            // 9. GET CUSTOMER LEDGER
            // ==================================================
            const result = await customerLedger_service_1.default.getCustomerLedger(userId, customerId, fromDate, toDate);
            // ==================================================
            // 10. RESPONSE
            // ==================================================
            return res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Get customer ledger error:", error);
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to fetch customer ledger",
            });
        }
    }
}
exports.default = new CustomerLedgerController();
