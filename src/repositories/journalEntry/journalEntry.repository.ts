import mongoose from "mongoose";

import JournalEntry, { IJournalEntry } from "../../models/journalEntry.model";

interface CreateJournalEntryData {
  userId: mongoose.Types.ObjectId;

  transactionId: mongoose.Types.ObjectId;

  entryDate: Date;

  description: string;

  totalDebit: number;

  totalCredit: number;
}

class JournalEntryRepository {
  async create(
    data: CreateJournalEntryData,
    session?: mongoose.ClientSession,
  ): Promise<IJournalEntry> {
    const result = await JournalEntry.create([data], { session });

    return result[0];
  }

  async findByTransactionId(
    transactionId: mongoose.Types.ObjectId,
  ): Promise<IJournalEntry | null> {
    return await JournalEntry.findOne({
      transactionId,
    });
  }
  async findById(
    journalEntryId: mongoose.Types.ObjectId,
  ): Promise<IJournalEntry | null> {
    return await JournalEntry.findById(journalEntryId);
  }
}

export default new JournalEntryRepository();
