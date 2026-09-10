"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
const journalEntry_model_1 = __importDefault(require("../../models/journalEntry.model"));
class LedgerRepository {
    /**
     * Get journal lines before the requested period.
     *
     * These lines are used to calculate opening balance.
     */
    async findOpeningBalanceLines(userId, accountId, from) {
        const journalEntries = await journalEntry_model_1.default.find({
            userId,
            entryDate: {
                $lt: from,
            },
        }).select("_id");
        const journalEntryIds = journalEntries.map((entry) => entry._id);
        return await journalEntryLine_model_1.default.find({
            accountId,
            journalEntryId: {
                $in: journalEntryIds,
            },
        });
    }
    /**
     * Get journal lines inside the requested period.
     */
    async findByAccountId(userId, accountId, from, to) {
        const filter = {
            userId,
        };
        if (from || to) {
            filter.entryDate = {};
            if (from) {
                filter.entryDate.$gte = from;
            }
            if (to) {
                filter.entryDate.$lte = to;
            }
        }
        const journalEntries = await journalEntry_model_1.default.find(filter)
            .select("_id entryDate description transactionId")
            .sort({
            entryDate: 1,
            _id: 1,
        });
        const journalEntryIds = journalEntries.map((entry) => entry._id);
        return await journalEntryLine_model_1.default.find({
            accountId,
            journalEntryId: {
                $in: journalEntryIds,
            },
        }).populate({
            path: "journalEntryId",
            select: "entryDate description transactionId",
        });
    }
}
exports.default = new LedgerRepository();
