"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const account_model_1 = __importDefault(require("../../models/account.model"));
const journalEntry_model_1 = __importDefault(require("../../models/journalEntry.model"));
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
class ExpenseRepository {
    /**
     * Get all active expense accounts
     * belonging to the user.
     */
    async findExpenseAccounts(userId) {
        return await account_model_1.default.find({
            userId,
            isActive: true,
            type: "expense",
        }).sort({
            code: 1,
        });
    }
    /**
     * Get journal lines for the user's
     * expense accounts.
     *
     * JournalEntry is used for:
     * - user filtering
     * - date filtering
     */
    async findExpenseLines(userId, accountIds, from, to) {
        if (accountIds.length === 0) {
            return [];
        }
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
            accountId: {
                $in: accountIds,
            },
        })
            .populate({
            path: "journalEntryId",
            select: "entryDate transactionId description",
        })
            .sort({
            createdAt: 1,
        });
    }
}
exports.default = new ExpenseRepository();
