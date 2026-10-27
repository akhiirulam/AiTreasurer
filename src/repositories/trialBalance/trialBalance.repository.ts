import mongoose from "mongoose";

import JournalEntryLine from "../../models/journalEntryLine.model";

class TrialBalanceRepository {
  /**
   * Get all journal lines belonging to a user.
   *
   * JournalEntryLine
   *      ↓
   * JournalEntry
   *      ↓
   * userId
   */
  async findByUserId(userId: mongoose.Types.ObjectId, from?: Date, to?: Date) {
    const dateFilter: any = {};

    if (from || to) {
      dateFilter["journalEntry.entryDate"] = {};

      if (from) {
        dateFilter["journalEntry.entryDate"].$gte = from;
      }

      if (to) {
        dateFilter["journalEntry.entryDate"].$lte = to;
      }
    }

    return await JournalEntryLine.aggregate([
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

      // USER FILTER
      {
        $match: {
          "journalEntry.userId": userId,
          ...dateFilter,
        },
      },

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

      {
        $project: {
          accountId: "$account._id",
          accountName: "$account.name",
          accountCode: "$account.code",
          accountType: "$account.type",

          debit: 1,
          credit: 1,
        },
      },
    ]);
  }
}
export default new TrialBalanceRepository();
