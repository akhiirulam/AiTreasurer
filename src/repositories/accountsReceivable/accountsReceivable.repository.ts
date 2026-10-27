import mongoose from "mongoose";

import Account from "../../models/account.model";
import JournalEntry from "../../models/journalEntry.model";
import JournalEntryLine from "../../models/journalEntryLine.model";
import Transaction from "../../models/transaction.model";

class AccountsReceivableRepository {
  /**
   * Find the user's Accounts Receivable account.
   *
   * We identify it using the account classification,
   * not by hard-coding an account ID.
   */
  async findReceivableAccount(userId: mongoose.Types.ObjectId) {
    return await Account.findOne({
      userId,
      isActive: true,
      type: "asset",
      subCategory: "receivables",
    });
  }

  /**
   * Get journal lines belonging to the
   * Accounts Receivable account.
   *
   * JournalEntry is used to filter by user and date.
   */
  async findReceivableLines(
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

    const journalEntries = await JournalEntry.find(dateFilter).select("_id");

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

  /**
   * Get transactions associated with the
   * Accounts Receivable journal entries.
   *
   * Used to determine the customer.
   */
  async findTransactions(
    userId: mongoose.Types.ObjectId,
    transactionIds: mongoose.Types.ObjectId[],
  ) {
    if (transactionIds.length === 0) {
      return [];
    }

    return await Transaction.find({
      userId,
      _id: {
        $in: transactionIds,
      },
    }).select(
      "_id customer customerName type amount paidAmount outstandingAmount",
    );
  }
}

export default new AccountsReceivableRepository();
