"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const account_model_1 = __importDefault(require("../../models/account.model"));
const journalEntry_model_1 = __importDefault(require("../../models/journalEntry.model"));
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
class SalesRepository {
    /**
     * Find the user's Sales account.
     *
     * Sales is an income account.
     */
    async findSalesAccount(userId) {
        return await account_model_1.default.findOne({
            userId,
            isActive: true,
            type: "income",
            subCategory: "sales",
        });
    }
    /**
     * Get journal lines belonging to
     * the Sales account.
     *
     * JournalEntry is used for:
     * - user filtering
     * - date filtering
     */
    async findSalesLines(userId, accountId, from, to) {
        const dateFilter = {
            userId,
        };
        if (from || to) {
            dateFilter.entryDate = {};
            if (from) {
                dateFilter.entryDate.$gte = from;
            }
            if (to) {
                dateFilter.entryDate.$lte = to;
            }
        }
        const journalEntries = await journalEntry_model_1.default.find(dateFilter).select("_id");
        const journalEntryIds = journalEntries.map((entry) => entry._id);
        if (journalEntryIds.length === 0) {
            return [];
        }
        return await journalEntryLine_model_1.default.find({
            journalEntryId: {
                $in: journalEntryIds,
            },
            accountId,
        })
            .populate({
            path: "journalEntryId",
            select: "entryDate transactionId description",
        })
            .sort({
            createdAt: 1,
        });
    }
    /**
     * Get transactions associated with
     * Sales journal entries.
     */
    async findTransactions(userId, transactionIds) {
        if (transactionIds.length === 0) {
            return [];
        }
        return await transaction_model_1.default.find({
            userId,
            _id: {
                $in: transactionIds,
            },
            type: "sale",
        }).select("_id customer customerId amount description transactionDate paymentStatus paidAmount outstandingAmount");
    }
    /**
     * Get customer payment transactions.
     *
     * Example:
     *
     * Sale:
     * Dr Accounts Receivable     ₹5,000
     *     Cr Sales               ₹5,000
     *
     * Payment:
     * Dr Cash                    ₹4,000
     *     Cr Accounts Receivable ₹4,000
     */
    async findCustomerPayments(userId, customerIds, from, to) {
        if (customerIds.length === 0) {
            return [];
        }
        const dateFilter = {
            userId,
            type: "payment",
            customerId: {
                $in: customerIds,
            },
        };
        if (from || to) {
            dateFilter.transactionDate = {};
            if (from) {
                dateFilter.transactionDate.$gte = from;
            }
            if (to) {
                dateFilter.transactionDate.$lte = to;
            }
        }
        return await transaction_model_1.default.find(dateFilter)
            .select("_id customer customerId amount description transactionDate paymentStatus")
            .sort({
            transactionDate: 1,
            createdAt: 1,
        });
    }
}
exports.default = new SalesRepository();
