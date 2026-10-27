import mongoose from "mongoose";

import Transaction from "../../models/transaction.model";

class SupplierLedgerRepository {
  // =====================================================
  // GET SUPPLIER TRANSACTIONS
  // =====================================================

  async findSupplierTransactions(
    userId: string,
    supplierId: string,
    from?: Date,
    to?: Date,
  ) {
    const query: {
      userId: mongoose.Types.ObjectId;
      supplierId: mongoose.Types.ObjectId;
      transactionDate?: {
        $gte?: Date;
        $lte?: Date;
      };
    } = {
      userId: new mongoose.Types.ObjectId(userId),

      supplierId: new mongoose.Types.ObjectId(supplierId),
    };

    // ===================================================
    // DATE FILTER
    // ===================================================

    if (from || to) {
      query.transactionDate = {};

      if (from) {
        query.transactionDate.$gte = from;
      }

      if (to) {
        query.transactionDate.$lte = to;
      }
    }

    return await Transaction.find(query).sort({
      transactionDate: 1,
      createdAt: 1,
    });
  }

  // =====================================================
  // GET ALL SUPPLIER TRANSACTIONS
  // =====================================================

  async findAllSupplierTransactions(userId: string, supplierId: string) {
    return await Transaction.find({
      userId: new mongoose.Types.ObjectId(userId),

      supplierId: new mongoose.Types.ObjectId(supplierId),
    }).sort({
      transactionDate: 1,
      createdAt: 1,
    });
  }
}

export default new SupplierLedgerRepository();
