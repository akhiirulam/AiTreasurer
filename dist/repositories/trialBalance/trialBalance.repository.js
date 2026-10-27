"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
class TrialBalanceRepository {
    /**
     * Get all journal lines belonging to a user.
     *
     * JournalEntryLine
     *      ↓
     * JournalEntry
     *      ↓
     * userId
     */
    async findByUserId(userId, from, to) {
        const dateFilter = {};
        if (from || to) {
            dateFilter["journalEntry.entryDate"] = {};
            if (from) {
                dateFilter["journalEntry.entryDate"].$gte = from;
            }
            if (to) {
                dateFilter["journalEntry.entryDate"].$lte = to;
            }
        }
        return await journalEntryLine_model_1.default.aggregate([
            {
                $lookup: {
                    from: "journalentries",
                    localField: "journalEntryId",
                    foreignField: "_id",
                    as: "journalEntry",
                },
            },
            {
                $unwind: "$journalEntry",
            },
            // USER FILTER
            {
                $match: {
                    "journalEntry.userId": userId,
                    ...dateFilter,
                },
            },
            {
                $lookup: {
                    from: "accounts",
                    localField: "accountId",
                    foreignField: "_id",
                    as: "account",
                },
            },
            {
                $unwind: "$account",
            },
            {
                $project: {
                    accountId: "$account._id",
                    accountName: "$account.name",
                    accountCode: "$account.code",
                    accountType: "$account.type",
                    debit: 1,
                    credit: 1,
                },
            },
        ]);
    }
}
exports.default = new TrialBalanceRepository();
