"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const journalEntry_service_1 = __importDefault(require("../../services/journalEntry/journalEntry.service"));
class JournalEntryController {
    async getByTransactionId(req, res, next) {
        try {
            const { transactionId } = req.params;
            if (!transactionId) {
                return res.status(400).json({
                    success: false,
                    message: "Transaction ID is required",
                });
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(transactionId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid transaction ID",
                });
            }
            const result = await journalEntry_service_1.default.getByTransactionId(new mongoose_1.default.Types.ObjectId(transactionId));
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Journal entry not found",
                });
            }
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
exports.default = new JournalEntryController();
