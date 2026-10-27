"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
class CustomerLedgerRepository {
    /**
     * Get all transactions belonging to a customer.
     *
     * The customerId and userId are both checked so that
     * transactions from another user's customer cannot
     * accidentally enter the ledger.
     */
    async findCustomerTransactions(userId, customerId, from, to) {
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const customerObjectId = new mongoose_1.default.Types.ObjectId(customerId);
        // =====================================================
        // BASE QUERY
        // =====================================================
        const query = {
            userId: userObjectId,
            customerId: customerObjectId,
        };
        // =====================================================
        // DATE FILTER
        // =====================================================
        if (from || to) {
            query.transactionDate = {};
            if (from) {
                query.transactionDate.$gte = from;
            }
            if (to) {
                query.transactionDate.$lte = to;
            }
        }
        // =====================================================
        // FETCH TRANSACTIONS
        // =====================================================
        return await transaction_model_1.default.find(query)
            .sort({
            transactionDate: 1,
            createdAt: 1,
        })
            .lean();
    }
}
exports.default = new CustomerLedgerRepository();
