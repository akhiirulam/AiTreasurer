import mongoose from "mongoose";

import Transaction from "../../models/transaction.model";

interface TransactionHistoryFilters {
  search?: string;
  type?: string;
  paymentStatus?: string;
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
}

class TransactionHistoryRepository {
  async findTransactions(
    userId: mongoose.Types.ObjectId,
    filters: TransactionHistoryFilters,
  ) {
    const { search, type, paymentStatus, from, to, page, limit } = filters;

    const query: any = {
      userId,
    };

    // ==========================================
    // SEARCH
    // ==========================================

    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      query.$or = [
        {
          rawText: searchRegex,
        },
        {
          description: searchRegex,
        },
        {
          category: searchRegex,
        },
        {
          customer: searchRegex,
        },
        {
          debitAccount: searchRegex,
        },
        {
          creditAccount: searchRegex,
        },
        {
          paymentStatus: searchRegex,
        },
      ];
    }

    // ==========================================
    // TRANSACTION TYPE
    // ==========================================

    if (type) {
      query.type = type;
    }

    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // ==========================================
    // DATE FILTER
    // ==========================================

    if (from || to) {
      query.transactionDate = {};

      if (from) {
        query.transactionDate.$gte = from;
      }

      if (to) {
        query.transactionDate.$lte = to;
      }
    }

    // ==========================================
    // PAGINATION
    // ==========================================

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({
          transactionDate: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Transaction.countDocuments(query),
    ]);

    return {
      transactions,
      total,
    };
  }
}

export default new TransactionHistoryRepository();
