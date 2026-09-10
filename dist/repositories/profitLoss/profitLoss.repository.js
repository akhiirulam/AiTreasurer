"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
class ProfitLossRepository {
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
            // ==========================================
            // 1. JOIN JOURNAL ENTRY
            // ==========================================
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
            // ==========================================
            // 2. FILTER USER + DATE
            // ==========================================
            {
                $match: {
                    "journalEntry.userId": userId,
                    ...dateFilter,
                },
            },
            // ==========================================
            // 3. JOIN ACCOUNT
            // ==========================================
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
            // ==========================================
            // 4. ONLY INCOME AND EXPENSE ACCOUNTS
            // ==========================================
            {
                $match: {
                    "account.type": {
                        $in: ["income", "expense"],
                    },
                },
            },
            // ==========================================
            // 5. RETURN REQUIRED DATA
            // ==========================================
            {
                $project: {
                    accountId: "$account._id",
                    accountName: "$account.name",
                    accountCode: "$account.code",
                    accountType: "$account.type",
                    debit: 1,
                    credit: 1,
                    date: "$journalEntry.entryDate",
                },
            },
        ]);
    }
}
exports.default = new ProfitLossRepository();
