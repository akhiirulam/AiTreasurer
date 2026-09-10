"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
class ReportsRepository {
    /**
     * Get all income and expense accounts for the user.
     */
    async findIncomeExpenseAccounts(userId) {
        return await account_model_1.default.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            isActive: true,
            type: {
                $in: ["income", "expense"],
            },
        })
            .select("_id name code type category subCategory")
            .lean();
    }
    /**
     * Get transactions for the selected period.
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
            .select("_id type amount description category transactionDate paymentStatus paidAmount outstandingAmount customerId supplierId debitAccountId creditAccountId")
            .sort({
            transactionDate: 1,
        })
            .lean();
    }
    /**
     * Get account balances for income and expense accounts.
     *
     * This is useful when calculating Profit & Loss
     * from journal entries.
     */
    async findAccountBalances(userId, accountIds, from, to) {
        if (accountIds.length === 0) {
            return [];
        }
        const JournalEntry = mongoose_1.default.model("JournalEntry");
        const JournalEntryLine = mongoose_1.default.model("JournalEntryLine");
        const journalQuery = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
        };
        if (from || to) {
            journalQuery.entryDate = {};
            if (from) {
                journalQuery.entryDate.$gte = from;
            }
            if (to) {
                journalQuery.entryDate.$lte = to;
            }
        }
        const journalEntries = await JournalEntry.find(journalQuery)
            .select("_id")
            .lean();
        if (journalEntries.length === 0) {
            return [];
        }
        const journalEntryIds = journalEntries.map((entry) => entry._id);
        return await JournalEntryLine.aggregate([
            {
                $match: {
                    journalEntryId: {
                        $in: journalEntryIds,
                    },
                    accountId: {
                        $in: accountIds,
                    },
                },
            },
            {
                $group: {
                    _id: "$accountId",
                    totalDebit: {
                        $sum: "$debit",
                    },
                    totalCredit: {
                        $sum: "$credit",
                    },
                },
            },
        ]);
    }
}
exports.default = new ReportsRepository();
