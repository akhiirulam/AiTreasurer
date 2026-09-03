import mongoose from "mongoose";

import Transaction from "../../models/transaction.model";
import JournalEntry from "../../models/journalEntry.model";
import JournalEntryLine from "../../models/journalEntryLine.model";
import Account from "../../models/account.model";
import Supplier from "../../models/supplier.model";

class PurchaseRepository {
  /**
   * Find the user's Purchase account.
   */
  async findPurchaseAccount(userId: string) {
    return await Account.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      type: "expense",
      subCategory: "purchases",
    }).lean();
  }

  /**
   * Find journal lines belonging to the Purchase account.
   */
  async findPurchaseLines(
    userId: string,
    accountId: mongoose.Types.ObjectId,
    from?: Date,
    to?: Date,
  ) {
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
      .select("_id entryDate description")
      .lean();

    if (journalEntries.length === 0) {
      return [];
    }

    const journalEntryIds = journalEntries.map((entry) => entry._id);

    return await JournalEntryLine.find({
      journalEntryId: { $in: journalEntryIds },
      accountId,
      debit: { $gt: 0 },
    })
      .populate({
        path: "journalEntryId",
        select: "_id transactionId entryDate description",
      })
      .lean();
  }

  /**
   * Find purchase transactions corresponding to journal entries.
   */
  async findTransactions(
    userId: string,
    transactionIds: mongoose.Types.ObjectId[],
  ) {
    if (transactionIds.length === 0) {
      return [];
    }

    return await Transaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      _id: { $in: transactionIds },
      type: "purchase",
    })
      .select(
        "_id supplier supplierId amount description transactionDate paymentStatus paidAmount outstandingAmount",
      )
      .lean();
  }

  /**
   * Find supplier payments.
   *
   * Payments are separate transactions from purchases.
   */
  async findSupplierPayments(
    userId: string,
    supplierIds: mongoose.Types.ObjectId[],
    from?: Date,
    to?: Date,
  ) {
    if (supplierIds.length === 0) {
      return [];
    }

    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
      type: "payment",
      supplierId: {
        $in: supplierIds,
      },
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
        "_id supplier supplierId amount description transactionDate paymentStatus paidAmount outstandingAmount",
      )
      .sort({
        transactionDate: 1,
        createdAt: 1,
      })
      .lean();
  }

  /**
   * Find suppliers by their IDs.
   */
  async findSuppliersByIds(
    userId: string,
    supplierIds: mongoose.Types.ObjectId[],
  ) {
    if (supplierIds.length === 0) {
      return [];
    }

    return await Supplier.find({
      userId: new mongoose.Types.ObjectId(userId),
      _id: {
        $in: supplierIds,
      },
    })
      .select("_id name phone email")
      .lean();
  }
}

export default new PurchaseRepository();
