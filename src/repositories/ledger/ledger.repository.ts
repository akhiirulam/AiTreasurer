import mongoose from "mongoose";

import JournalEntryLine from "../../models/journalEntryLine.model";
import JournalEntry from "../../models/journalEntry.model";

class LedgerRepository {
  /**
   * Get journal lines before the requested period.
   *
   * These lines are used to calculate opening balance.
   */
  async findOpeningBalanceLines(
    userId: mongoose.Types.ObjectId,
    accountId: mongoose.Types.ObjectId,
    from: Date,
  ) {
    const journalEntries = await JournalEntry.find({
      userId,
      entryDate: {
        $lt: from,
      },
    }).select("_id");

    const journalEntryIds = journalEntries.map((entry) => entry._id);

    return await JournalEntryLine.find({
      accountId,
      journalEntryId: {
        $in: journalEntryIds,
      },
    });
  }

  /**
   * Get journal lines inside the requested period.
   */
  async findByAccountId(
    userId: mongoose.Types.ObjectId,
    accountId: mongoose.Types.ObjectId,
    from?: Date,
    to?: Date,
  ) {
    const filter: any = {
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

    const journalEntries = await JournalEntry.find(filter)
      .select("_id entryDate description transactionId")
      .sort({
        entryDate: 1,
        _id: 1,
      });

    const journalEntryIds = journalEntries.map((entry) => entry._id);

    return await JournalEntryLine.find({
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

export default new LedgerRepository();
