"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const account_model_1 = __importDefault(require("../../models/account.model"));
const journalEntry_model_1 = __importDefault(require("../../models/journalEntry.model"));
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
class CashBookRepository {
    /**
     * Find all Cash Book accounts belonging to the user.
     *
     * We do NOT hard-code account names.
     *
     * Account classification determines whether
     * an account belongs to the Cash Book.
     */
    async findCashAccounts(userId) {
        return await account_model_1.default.find({
            userId,
            isActive: true,
            type: "asset",
            category: "current_asset",
            subCategory: {
                $in: ["cash_and_cash_equivalents", "cash_and_bank"],
            },
        }).sort({
            code: 1,
        });
    }
    /**
     * Get all journal lines before the period.
     *
     * Used to calculate opening balance.
     */
    async findOpeningLines(userId, accountId, from) {
        const journalEntries = await journalEntry_model_1.default.find({
            userId,
            entryDate: {
                $lt: from,
            },
        }).select("_id");
        const journalEntryIds = journalEntries.map((entry) => entry._id);
        if (journalEntryIds.length === 0) {
            return [];
        }
        return await journalEntryLine_model_1.default.find({
            journalEntryId: {
                $in: journalEntryIds,
            },
            accountId,
        });
    }
    /**
     * Get journal lines inside the requested period.
     */
    async findPeriodLines(userId, accountId, from, to) {
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
        const journalEntries = await journalEntry_model_1.default.find(dateFilter)
            .select("_id")
            .sort({
            entryDate: 1,
        });
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
}
exports.default = new CashBookRepository();
