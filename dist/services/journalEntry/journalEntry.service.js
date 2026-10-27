"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const journalEntry_repository_1 = __importDefault(require("../../repositories/journalEntry/journalEntry.repository"));
const journalEntryLine_repository_1 = __importDefault(require("../../repositories/journalEntryLine/journalEntryLine.repository"));
class JournalEntryService {
    async createJournalEntry(data) {
        const { userId, transactionId, entryDate, description, debitAccountId, creditAccountId, amount, session, } = data;
        // 1. Create journal entry
        const journalEntry = await journalEntry_repository_1.default.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            transactionId,
            entryDate,
            description,
            totalDebit: amount,
            totalCredit: amount,
        }, session);
        // 2. Create debit line
        await journalEntryLine_repository_1.default.create({
            journalEntryId: journalEntry._id,
            accountId: debitAccountId,
            debit: amount,
            credit: 0,
        }, session);
        // 3. Create credit line
        await journalEntryLine_repository_1.default.create({
            journalEntryId: journalEntry._id,
            accountId: creditAccountId,
            debit: 0,
            credit: amount,
        }, session);
        return journalEntry;
    }
    async getByTransactionId(transactionId) {
        const journalEntry = await journalEntry_repository_1.default.findByTransactionId(transactionId);
        if (!journalEntry) {
            return null;
        }
        const lines = await journalEntryLine_repository_1.default.findByJournalEntryId(journalEntry._id);
        return {
            journalEntry,
            lines,
        };
    }
}
exports.default = new JournalEntryService();
