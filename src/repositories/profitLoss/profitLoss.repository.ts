import mongoose from "mongoose";

import JournalEntryLine from "../../models/journalEntryLine.model";

class ProfitLossRepository {
  async findByUserId(userId: mongoose.Types.ObjectId, from?: Date, to?: Date) {
    const dateFilter: Record<string, any> = {};

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
      // ==========================================
      // 1. JOIN JOURNAL ENTRY
      // ==========================================

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

      // ==========================================
      // 2. FILTER USER + DATE
      // ==========================================

      {
        $match: {
          "journalEntry.userId": userId,
          ...dateFilter,
        },
      },

      // ==========================================
      // 3. JOIN ACCOUNT
      // ==========================================

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

      // ==========================================
      // 4. ONLY INCOME AND EXPENSE ACCOUNTS
      // ==========================================

      {
        $match: {
          "account.type": {
            $in: ["income", "expense"],
          },
        },
      },

      // ==========================================
      // 5. RETURN REQUIRED DATA
      // ==========================================

      {
        $project: {
          accountId: "$account._id",
          accountName: "$account.name",
          accountCode: "$account.code",
          accountType: "$account.type",

          debit: 1,
          credit: 1,

          date: "$journalEntry.entryDate",
        },
      },
    ]);
  }
}

export default new ProfitLossRepository();
