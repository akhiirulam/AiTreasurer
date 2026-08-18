import mongoose from "mongoose";

import JournalEntryLine from "../../models/journalEntryLine.model";
import Account from "../../models/account.model";
import JournalEntry from "../../models/journalEntry.model";

class BalanceSheetRepository {
  /**
   * Get all Balance Sheet accounts belonging to a user.
   *
   * Balance Sheet accounts:
   *   asset
   *   liability
   *   equity
   */
  async findUserAccounts(userId: mongoose.Types.ObjectId) {
    return await Account.find({
      userId,
      isActive: true,
      type: {
        $in: ["asset", "liability", "equity"],
      },
    }).sort({
      code: 1,
    });
  }

  /**
   * Get journal lines for Balance Sheet accounts
   * up to the requested date.
   *
   * Balance Sheet is an "as of" report.
   *
   * Example:
   *
   * to = 2024-05-31
   *
   * Include:
   *     entryDate <= 2024-05-31
   */
  async findJournalLines(
    userId: mongoose.Types.ObjectId,
    accountIds: mongoose.Types.ObjectId[],
    toDate?: Date,
  ) {
    const journalEntryFilter: any = {
      userId,
    };

    if (toDate) {
      journalEntryFilter.entryDate = {
        $lte: toDate,
      };
    }

    const journalEntries =
      await JournalEntry.find(journalEntryFilter).select("_id");

    const journalEntryIds = journalEntries.map((entry) => entry._id);

    return await JournalEntryLine.find({
      journalEntryId: {
        $in: journalEntryIds,
      },

      accountId: {
        $in: accountIds,
      },
    });
  }

  /**
   * Get Income and Expense journal lines.
   *
   * These are required to calculate:
   *
   * Net Profit = Income - Expenses
   *
   * The resulting profit is included in
   * Balance Sheet equity as:
   *
   * Current Period Profit
   */
  async findProfitLossLines(userId: mongoose.Types.ObjectId, toDate?: Date) {
    const journalEntryFilter: any = {
      userId,
    };

    if (toDate) {
      journalEntryFilter.entryDate = {
        $lte: toDate,
      };
    }

    const journalEntries =
      await JournalEntry.find(journalEntryFilter).select("_id");

    const journalEntryIds = journalEntries.map((entry) => entry._id);

    // Get Income and Expense accounts
    const profitLossAccounts = await Account.find({
      userId,
      isActive: true,
      type: {
        $in: ["income", "expense"],
      },
    }).select("_id name code type");

    const accountIds = profitLossAccounts.map((account) => account._id);

    const lines = await JournalEntryLine.find({
      journalEntryId: {
        $in: journalEntryIds,
      },

      accountId: {
        $in: accountIds,
      },
    });

    return {
      accounts: profitLossAccounts,
      lines,
    };
  }
}

export default new BalanceSheetRepository();
