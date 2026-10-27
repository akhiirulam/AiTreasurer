"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const journalEntry_model_1 = __importDefault(require("../../models/journalEntry.model"));
class JournalEntryRepository {
    async create(data, session) {
        const result = await journalEntry_model_1.default.create([data], { session });
        return result[0];
    }
    async findByTransactionId(transactionId) {
        return await journalEntry_model_1.default.findOne({
            transactionId,
        });
    }
    async findById(journalEntryId) {
        return await journalEntry_model_1.default.findById(journalEntryId);
    }
}
exports.default = new JournalEntryRepository();
