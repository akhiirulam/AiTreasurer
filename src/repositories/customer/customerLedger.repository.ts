import mongoose from "mongoose";

import Transaction from "../../models/transaction.model";

class CustomerLedgerRepository {
  /**
   * Get all transactions belonging to a customer.
   *
   * The customerId and userId are both checked so that
   * transactions from another user's customer cannot
   * accidentally enter the ledger.
   */
  async findCustomerTransactions(
    userId: string,
    customerId: string,
    from?: Date,
    to?: Date,
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const customerObjectId = new mongoose.Types.ObjectId(customerId);

    // =====================================================
    // BASE QUERY
    // =====================================================

    const query: {
      userId: mongoose.Types.ObjectId;
      customerId: mongoose.Types.ObjectId;
      transactionDate?: {
        $gte?: Date;
        $lte?: Date;
      };
    } = {
      userId: userObjectId,
      customerId: customerObjectId,
    };

    // =====================================================
    // DATE FILTER
    // =====================================================

    if (from || to) {
      query.transactionDate = {};

      if (from) {
        query.transactionDate.$gte = from;
      }

      if (to) {
        query.transactionDate.$lte = to;
      }
    }

    // =====================================================
    // FETCH TRANSACTIONS
    // =====================================================

    return await Transaction.find(query)
      .sort({
        transactionDate: 1,
        createdAt: 1,
      })
      .lean();
  }
}

export default new CustomerLedgerRepository();
