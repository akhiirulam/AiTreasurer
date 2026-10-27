"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const journalEntry_model_1 = __importDefault(require("../../models/journalEntry.model"));
class BalanceSheetRepository {
    /**
     * Get all Balance Sheet accounts belonging to a user.
     *
     * Balance Sheet accounts:
     *   asset
     *   liability
     *   equity
     */
    async findUserAccounts(userId) {
        return await account_model_1.default.find({
            userId,
            isActive: true,
            type: {
                $in: ["asset", "liability", "equity"],
            },
        }).sort({
            code: 1,
        });
    }
    /**
     * Get journal lines for Balance Sheet accounts
     * up to the requested date.
     *
     * Balance Sheet is an "as of" report.
     *
     * Example:
     *
     * to = 2024-05-31
     *
     * Include:
     *     entryDate <= 2024-05-31
     */
    async findJournalLines(userId, accountIds, toDate) {
        const journalEntryFilter = {
            userId,
        };
        if (toDate) {
            journalEntryFilter.entryDate = {
                $lte: toDate,
            };
        }
        const journalEntries = await journalEntry_model_1.default.find(journalEntryFilter).select("_id");
        const journalEntryIds = journalEntries.map((entry) => entry._id);
        return await journalEntryLine_model_1.default.find({
            journalEntryId: {
                $in: journalEntryIds,
            },
            accountId: {
                $in: accountIds,
            },
        });
    }
    /**
     * Get Income and Expense journal lines.
     *
     * These are required to calculate:
     *
     * Net Profit = Income - Expenses
     *
     * The resulting profit is included in
     * Balance Sheet equity as:
     *
     * Current Period Profit
     */
    async findProfitLossLines(userId, toDate) {
        const journalEntryFilter = {
            userId,
        };
        if (toDate) {
            journalEntryFilter.entryDate = {
                $lte: toDate,
            };
        }
        const journalEntries = await journalEntry_model_1.default.find(journalEntryFilter).select("_id");
        const journalEntryIds = journalEntries.map((entry) => entry._id);
        // Get Income and Expense accounts
        const profitLossAccounts = await account_model_1.default.find({
            userId,
            isActive: true,
            type: {
                $in: ["income", "expense"],
            },
        }).select("_id name code type");
        const accountIds = profitLossAccounts.map((account) => account._id);
        const lines = await journalEntryLine_model_1.default.find({
            journalEntryId: {
                $in: journalEntryIds,
            },
            accountId: {
                $in: accountIds,
            },
        });
        return {
            accounts: profitLossAccounts,
            lines,
        };
    }
}
exports.default = new BalanceSheetRepository();
