import mongoose from "mongoose";

import Account from "../../models/account.model";
import JournalEntry from "../../models/journalEntry.model";
import JournalEntryLine from "../../models/journalEntryLine.model";

class ExpenseRepository {
  /**
   * Get all active expense accounts
   * belonging to the user.
   */
  async findExpenseAccounts(userId: mongoose.Types.ObjectId) {
    return await Account.find({
      userId,
      isActive: true,
      type: "expense",
    }).sort({
      code: 1,
    });
  }

  /**
   * Get journal lines for the user's
   * expense accounts.
   *
   * JournalEntry is used for:
   * - user filtering
   * - date filtering
   */
  async findExpenseLines(
    userId: mongoose.Types.ObjectId,
    accountIds: mongoose.Types.ObjectId[],
    from?: Date,
    to?: Date,
  ) {
    if (accountIds.length === 0) {
      return [];
    }

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

    const journalEntries = await JournalEntry.find(dateFilter).select("_id");

    const journalEntryIds = journalEntries.map((entry) => entry._id);

    if (journalEntryIds.length === 0) {
      return [];
    }

    return await JournalEntryLine.find({
      journalEntryId: {
        $in: journalEntryIds,
      },

      accountId: {
        $in: accountIds,
      },
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

export default new ExpenseRepository();
