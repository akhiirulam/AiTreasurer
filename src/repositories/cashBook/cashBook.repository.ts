import mongoose from "mongoose";

import Account from "../../models/account.model";
import JournalEntry from "../../models/journalEntry.model";
import JournalEntryLine from "../../models/journalEntryLine.model";

class CashBookRepository {
  /**
   * Find all Cash Book accounts belonging to the user.
   *
   * We do NOT hard-code account names.
   *
   * Account classification determines whether
   * an account belongs to the Cash Book.
   */
  async findCashAccounts(userId: mongoose.Types.ObjectId) {
    return await Account.find({
      userId,

      isActive: true,

      type: "asset",

      category: "current_asset",

      subCategory: {
        $in: ["cash_and_cash_equivalents", "cash_and_bank"],
      },
    }).sort({
      code: 1,
    });
  }

  /**
   * Get all journal lines before the period.
   *
   * Used to calculate opening balance.
   */
  async findOpeningLines(
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

    if (journalEntryIds.length === 0) {
      return [];
    }

    return await JournalEntryLine.find({
      journalEntryId: {
        $in: journalEntryIds,
      },

      accountId,
    });
  }

  /**
   * Get journal lines inside the requested period.
   */
  async findPeriodLines(
    userId: mongoose.Types.ObjectId,
    accountId: mongoose.Types.ObjectId,
    from?: Date,
    to?: Date,
  ) {
    const dateFilter: any = {
      userId,
    };

    if (from || to) {
      dateFilter.entryDate = {};

      if (from) {
        dateFilter.entryDate.$gte = from;
      }

      if (to) {
        dateFilter.entryDate.$lte = to;
      }
    }

    const journalEntries = await JournalEntry.find(dateFilter)
      .select("_id")
      .sort({
        entryDate: 1,
      });

    const journalEntryIds = journalEntries.map((entry) => entry._id);

    if (journalEntryIds.length === 0) {
      return [];
    }

    return await JournalEntryLine.find({
      journalEntryId: {
        $in: journalEntryIds,
      },

      accountId,
    })
      .populate({
        path: "journalEntryId",
        select: "entryDate transactionId description",
      })
      .sort({
        createdAt: 1,
      });
  }
}

export default new CashBookRepository();
