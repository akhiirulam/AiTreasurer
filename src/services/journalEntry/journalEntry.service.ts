import mongoose from "mongoose";

import journalEntryRepository from "../../repositories/journalEntry/journalEntry.repository";
import journalEntryLineRepository from "../../repositories/journalEntryLine/journalEntryLine.repository";

interface CreateJournalEntryData {
  userId: string;

  transactionId: mongoose.Types.ObjectId;

  entryDate: Date;

  description: string;

  debitAccountId: mongoose.Types.ObjectId;

  creditAccountId: mongoose.Types.ObjectId;

  amount: number;

  session?: mongoose.ClientSession;
}

class JournalEntryService {
  async createJournalEntry(data: CreateJournalEntryData) {
    const {
      userId,
      transactionId,
      entryDate,
      description,
      debitAccountId,
      creditAccountId,
      amount,
      session,
    } = data;

    // 1. Create journal entry

    const journalEntry = await journalEntryRepository.create(
      {
        userId: new mongoose.Types.ObjectId(userId),

        transactionId,

        entryDate,

        description,

        totalDebit: amount,

        totalCredit: amount,
      },
      session,
    );

    // 2. Create debit line

    await journalEntryLineRepository.create(
      {
        journalEntryId: journalEntry._id,

        accountId: debitAccountId,

        debit: amount,

        credit: 0,
      },
      session,
    );

    // 3. Create credit line

    await journalEntryLineRepository.create(
      {
        journalEntryId: journalEntry._id,

        accountId: creditAccountId,

        debit: 0,

        credit: amount,
      },
      session,
    );

    return journalEntry;
  }

  async getByTransactionId(transactionId: mongoose.Types.ObjectId) {
    const journalEntry =
      await journalEntryRepository.findByTransactionId(transactionId);

    if (!journalEntry) {
      return null;
    }

    const lines = await journalEntryLineRepository.findByJournalEntryId(
      journalEntry._id,
    );

    return {
      journalEntry,
      lines,
    };
  }
}

export default new JournalEntryService();
