"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transactionHistory_repository_1 = __importDefault(require("../../repositories/transactionHistory/transactionHistory.repository"));
class TransactionHistoryService {
    async getTransactions(userId, options) {
        // ==========================================
        // 1. VALIDATE USER ID
        // ==========================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        // ==========================================
        // 2. PAGINATION
        // ==========================================
        const page = Math.max(Number(options.page) || 1, 1);
        const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
        // ==========================================
        // 3. GET TRANSACTIONS
        // ==========================================
        const result = await transactionHistory_repository_1.default.findTransactions(userObjectId, {
            search: options.search,
            type: options.type,
            paymentStatus: options.paymentStatus,
            from: options.from,
            to: options.to,
            page,
            limit,
        });
        // ==========================================
        // 4. PAGINATION INFORMATION
        // ==========================================
        const totalPages = Math.ceil(result.total / limit);
        return {
            transactions: result.transactions,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            filters: {
                search: options.search ?? null,
                type: options.type ?? null,
                paymentStatus: options.paymentStatus ?? null,
                from: options.from ?? null,
                to: options.to ?? null,
            },
        };
    }
}
exports.default = new TransactionHistoryService();
