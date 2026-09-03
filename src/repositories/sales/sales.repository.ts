import mongoose from "mongoose";

import Account from "../../models/account.model";
import JournalEntry from "../../models/journalEntry.model";
import JournalEntryLine from "../../models/journalEntryLine.model";
import Transaction from "../../models/transaction.model";

class SalesRepository {
  /**
   * Find the user's Sales account.
   *
   * Sales is an income account.
   */
  async findSalesAccount(userId: mongoose.Types.ObjectId) {
    return await Account.findOne({
      userId,
      isActive: true,
      type: "income",
      subCategory: "sales",
    });
  }

  /**
   * Get journal lines belonging to
   * the Sales account.
   *
   * JournalEntry is used for:
   * - user filtering
   * - date filtering
   */
  async findSalesLines(
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
   * Get transactions associated with
   * Sales journal entries.
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

      type: "sale",
    }).select(
      "_id customer customerId amount description transactionDate paymentStatus paidAmount outstandingAmount",
    );
  }

  /**
   * Get customer payment transactions.
   *
   * Example:
   *
   * Sale:
   * Dr Accounts Receivable     ₹5,000
   *     Cr Sales               ₹5,000
   *
   * Payment:
   * Dr Cash                    ₹4,000
   *     Cr Accounts Receivable ₹4,000
   */
  async findCustomerPayments(
    userId: mongoose.Types.ObjectId,
    customerIds: mongoose.Types.ObjectId[],
    from?: Date,
    to?: Date,
  ) {
    if (customerIds.length === 0) {
      return [];
    }

    const dateFilter: any = {
      userId,

      type: "payment",

      customerId: {
        $in: customerIds,
      },
    };

    if (from || to) {
      dateFilter.transactionDate = {};

      if (from) {
        dateFilter.transactionDate.$gte = from;
      }

      if (to) {
        dateFilter.transactionDate.$lte = to;
      }
    }

    return await Transaction.find(dateFilter)
      .select(
        "_id customer customerId amount description transactionDate paymentStatus",
      )
      .sort({
        transactionDate: 1,
        createdAt: 1,
      });
  }
}

export default new SalesRepository();
