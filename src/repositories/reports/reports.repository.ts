import mongoose from "mongoose";

import Account from "../../models/account.model";
import Transaction from "../../models/transaction.model";

class ReportsRepository {
  /**
   * Get all income and expense accounts for the user.
   */
  async findIncomeExpenseAccounts(userId: string) {
    return await Account.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      type: {
        $in: ["income", "expense"],
      },
    })
      .select("_id name code type category subCategory")
      .lean();
  }

  /**
   * Get transactions for the selected period.
   */
  async findTransactions(userId: string, from?: Date, to?: Date) {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (from || to) {
      query.transactionDate = {};

      if (from) {
        query.transactionDate.$gte = from;
      }

      if (to) {
        query.transactionDate.$lte = to;
      }
    }

    return await Transaction.find(query)
      .select(
        "_id type amount description category transactionDate paymentStatus paidAmount outstandingAmount customerId supplierId debitAccountId creditAccountId",
      )
      .sort({
        transactionDate: 1,
      })
      .lean();
  }

  /**
   * Get account balances for income and expense accounts.
   *
   * This is useful when calculating Profit & Loss
   * from journal entries.
   */
  async findAccountBalances(
    userId: string,
    accountIds: mongoose.Types.ObjectId[],
    from?: Date,
    to?: Date,
  ) {
    if (accountIds.length === 0) {
      return [];
    }

    const JournalEntry = mongoose.model("JournalEntry");
    const JournalEntryLine = mongoose.model("JournalEntryLine");

    const journalQuery: any = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (from || to) {
      journalQuery.entryDate = {};

      if (from) {
        journalQuery.entryDate.$gte = from;
      }

      if (to) {
        journalQuery.entryDate.$lte = to;
      }
    }

    const journalEntries = await JournalEntry.find(journalQuery)
      .select("_id")
      .lean();

    if (journalEntries.length === 0) {
      return [];
    }

    const journalEntryIds = journalEntries.map((entry: any) => entry._id);

    return await JournalEntryLine.aggregate([
      {
        $match: {
          journalEntryId: {
            $in: journalEntryIds,
          },
          accountId: {
            $in: accountIds,
          },
        },
      },

      {
        $group: {
          _id: "$accountId",

          totalDebit: {
            $sum: "$debit",
          },

          totalCredit: {
            $sum: "$credit",
          },
        },
      },
    ]);
  }
}

export default new ReportsRepository();
