import mongoose from "mongoose";

import JournalEntryLine from "../../models/journalEntryLine.model";

class LedgerRepository {
  /**
   * Get all journal lines belonging to one account,
   * ordered by the actual accounting entry date.
   */
  async findByAccountId(accountId: mongoose.Types.ObjectId) {
    return await JournalEntryLine.aggregate([
      // 1. Get journal lines for this account
      {
        $match: {
          accountId,
        },
      },

      // 2. Join JournalEntry
      {
        $lookup: {
          from: "journalentries",
          localField: "journalEntryId",
          foreignField: "_id",
          as: "journalEntry",
        },
      },

      // 3. Convert journalEntry array to object
      {
        $unwind: "$journalEntry",
      },

      // 4. Sort by actual accounting date
      {
        $sort: {
          "journalEntry.entryDate": 1,
          _id: 1,
        },
      },

      // 5. Return only what LedgerService needs
      {
        $project: {
          _id: 1,
          journalEntryId: {
            _id: "$journalEntry._id",
            transactionId: "$journalEntry.transactionId",
            entryDate: "$journalEntry.entryDate",
            description: "$journalEntry.description",
          },
          accountId: 1,
          debit: 1,
          credit: 1,
        },
      },
    ]);
  }
}

export default new LedgerRepository();
