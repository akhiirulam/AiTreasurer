import mongoose from "mongoose";

import transactionHistoryRepository from "../../repositories/transactionHistory/transactionHistory.repository";

class TransactionHistoryService {
  async getTransactions(
    userId: string,
    options: {
      search?: string;
      type?: string;
      paymentStatus?: string;
      from?: Date;
      to?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    // ==========================================
    // 1. VALIDATE USER ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ==========================================
    // 2. PAGINATION
    // ==========================================

    const page = Math.max(Number(options.page) || 1, 1);

    const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);

    // ==========================================
    // 3. GET TRANSACTIONS
    // ==========================================

    const result = await transactionHistoryRepository.findTransactions(
      userObjectId,
      {
        search: options.search,
        type: options.type,
        paymentStatus: options.paymentStatus,
        from: options.from,
        to: options.to,
        page,
        limit,
      },
    );

    // ==========================================
    // 4. PAGINATION INFORMATION
    // ==========================================

    const totalPages = Math.ceil(result.total / limit);

    return {
      transactions: result.transactions,

      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },

      filters: {
        search: options.search ?? null,

        type: options.type ?? null,

        paymentStatus: options.paymentStatus ?? null,

        from: options.from ?? null,

        to: options.to ?? null,
      },
    };
  }
}

export default new TransactionHistoryService();
