import mongoose from "mongoose";

import JournalEntryLine, {
  IJournalEntryLine,
} from "../../models/journalEntryLine.model";

interface CreateJournalEntryLineData {
  journalEntryId: mongoose.Types.ObjectId;

  accountId: mongoose.Types.ObjectId;

  debit: number;

  credit: number;
}

class JournalEntryLineRepository {
  async create(
    data: CreateJournalEntryLineData,
    session?: mongoose.ClientSession,
  ): Promise<IJournalEntryLine> {
    return await JournalEntryLine.create([data], { session }).then(
      (result) => result[0],
    );
  }

  async createMany(
    data: CreateJournalEntryLineData[],
    session?: mongoose.ClientSession,
  ): Promise<IJournalEntryLine[]> {
    return await JournalEntryLine.insertMany(data, { session });
  }

  async findByJournalEntryId(
    journalEntryId: mongoose.Types.ObjectId,
  ): Promise<IJournalEntryLine[]> {
    return await JournalEntryLine.find({
      journalEntryId,
    });
  }
}

export default new JournalEntryLineRepository();
