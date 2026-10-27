"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const account_model_1 = __importDefault(require("../../models/account.model"));
const journalEntry_model_1 = __importDefault(require("../../models/journalEntry.model"));
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
class AccountsReceivableRepository {
    /**
     * Find the user's Accounts Receivable account.
     *
     * We identify it using the account classification,
     * not by hard-coding an account ID.
     */
    async findReceivableAccount(userId) {
        return await account_model_1.default.findOne({
            userId,
            isActive: true,
            type: "asset",
            subCategory: "receivables",
        });
    }
    /**
     * Get journal lines belonging to the
     * Accounts Receivable account.
     *
     * JournalEntry is used to filter by user and date.
     */
    async findReceivableLines(userId, accountId, from, to) {
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
     * Get transactions associated with the
     * Accounts Receivable journal entries.
     *
     * Used to determine the customer.
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
        }).select("_id customer customerName type amount paidAmount outstandingAmount");
    }
}
exports.default = new AccountsReceivableRepository();
