"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
const account_model_1 = __importDefault(require("../../models/account.model"));
class DashboardRepository {
    /**
     * Get transactions for the dashboard.
     */
    async findTransactions(userId, from, to) {
        const query = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
        };
        if (from || to) {
            query.transactionDate = {};
            if (from) {
                query.transactionDate.$gte = from;
            }
            if (to) {
                query.transactionDate.$lte = to;
            }
        }
        return await transaction_model_1.default.find(query)
            .select("_id type amount description category customer supplier customerId supplierId transactionDate paymentStatus paidAmount outstandingAmount debitAccount creditAccount debitAccountId creditAccountId")
            .sort({
            transactionDate: -1,
            createdAt: -1,
        })
            .lean();
    }
    /**
     * Get user's active accounts.
     *
     * Used to calculate cash/bank balance.
     */
    async findAccounts(userId) {
        return await account_model_1.default.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            isActive: true,
        })
            .select("_id name code type category subCategory normalBalance")
            .lean();
    }
}
exports.default = new DashboardRepository();
