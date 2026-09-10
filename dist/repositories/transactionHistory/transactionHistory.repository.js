"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
class TransactionHistoryRepository {
    async findTransactions(userId, filters) {
        const { search, type, paymentStatus, from, to, page, limit } = filters;
        const query = {
            userId,
        };
        // ==========================================
        // SEARCH
        // ==========================================
        if (search?.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                {
                    rawText: searchRegex,
                },
                {
                    description: searchRegex,
                },
                {
                    category: searchRegex,
                },
                {
                    customer: searchRegex,
                },
                {
                    debitAccount: searchRegex,
                },
                {
                    creditAccount: searchRegex,
                },
                {
                    paymentStatus: searchRegex,
                },
            ];
        }
        // ==========================================
        // TRANSACTION TYPE
        // ==========================================
        if (type) {
            query.type = type;
        }
        // ==========================================
        // PAYMENT STATUS
        // ==========================================
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }
        // ==========================================
        // DATE FILTER
        // ==========================================
        if (from || to) {
            query.transactionDate = {};
            if (from) {
                query.transactionDate.$gte = from;
            }
            if (to) {
                query.transactionDate.$lte = to;
            }
        }
        // ==========================================
        // PAGINATION
        // ==========================================
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            transaction_model_1.default.find(query)
                .sort({
                transactionDate: -1,
                createdAt: -1,
            })
                .skip(skip)
                .limit(limit)
                .lean(),
            transaction_model_1.default.countDocuments(query),
        ]);
        return {
            transactions,
            total,
        };
    }
}
exports.default = new TransactionHistoryRepository();
