"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
class JournalEntryLineRepository {
    async create(data, session) {
        return await journalEntryLine_model_1.default.create([data], { session }).then((result) => result[0]);
    }
    async createMany(data, session) {
        return await journalEntryLine_model_1.default.insertMany(data, { session });
    }
    async findByJournalEntryId(journalEntryId) {
        return await journalEntryLine_model_1.default.find({
            journalEntryId,
        });
    }
}
exports.default = new JournalEntryLineRepository();
