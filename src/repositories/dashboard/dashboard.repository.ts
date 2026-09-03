import mongoose from "mongoose";

import Transaction from "../../models/transaction.model";
import Account from "../../models/account.model";

class DashboardRepository {
  /**
   * Get transactions for the dashboard.
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
        "_id type amount description category customer supplier customerId supplierId transactionDate paymentStatus paidAmount outstandingAmount debitAccount creditAccount debitAccountId creditAccountId",
      )
      .sort({
        transactionDate: -1,
        createdAt: -1,
      })
      .lean();
  }

  /**
   * Get user's active accounts.
   *
   * Used to calculate cash/bank balance.
   */
  async findAccounts(userId: string) {
    return await Account.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    })
      .select("_id name code type category subCategory normalBalance")
      .lean();
  }
}

export default new DashboardRepository();
