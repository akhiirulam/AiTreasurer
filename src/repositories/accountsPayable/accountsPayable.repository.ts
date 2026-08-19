import mongoose from "mongoose";

import Account from "../../models/account.model";
import JournalEntry from "../../models/journalEntry.model";
import JournalEntryLine from "../../models/journalEntryLine.model";
import Transaction from "../../models/transaction.model";
import Supplier from "../../models/supplier.model";

class AccountsPayableRepository {
  /**
   * Find the user's Accounts Payable account.
   *
   * The account is identified by its classification,
   * not by a hard-coded account ID.
   */
  async findPayableAccount(userId: mongoose.Types.ObjectId) {
    return await Account.findOne({
      userId,
      isActive: true,
      type: "liability",
      subCategory: "payables",
    });
  }

  /**
   * Get journal lines belonging to
   * Accounts Payable.
   */
  async findPayableLines(
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
   * Accounts Payable journal entries.
   *
   * Transaction stores supplierId.
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
    }).select("_id supplierId type amount paidAmount outstandingAmount");
  }

  /**
   * Get suppliers using supplier IDs
   * stored inside transactions.
   */
  async findSuppliers(supplierIds: mongoose.Types.ObjectId[]) {
    if (supplierIds.length === 0) {
      return [];
    }

    return await Supplier.find({
      _id: {
        $in: supplierIds,
      },
    }).select("_id name");
  }
}

export default new AccountsPayableRepository();
