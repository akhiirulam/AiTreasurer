import mongoose from "mongoose";
import Transaction, { ITransaction } from "../../models/transaction.model";

class TransactionRepository {
  async create(
    data: Partial<ITransaction>,
    session?: mongoose.ClientSession,
  ): Promise<ITransaction> {
    const transaction = new Transaction(data);

    await transaction.save({
      session,
    });

    return transaction;
  }

  async findById(transactionId: string): Promise<ITransaction | null> {
    return await Transaction.findById(transactionId);
  }

  async findByUserId(userId: string): Promise<ITransaction[]> {
    return await Transaction.find({
      userId,
    }).sort({ transactionDate: -1 });
  }

  // =====================================================
  // FIND SALES
  // =====================================================

  async findSalesByUser(
    userId: string,
    filters?: {
      search?: string;
      paymentStatus?: string;
      from?: Date;
      to?: Date;
    },
  ): Promise<ITransaction[]> {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
      type: "sale",
    };

    // ===================================================
    // PAYMENT STATUS
    // ===================================================

    if (filters?.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    // ===================================================
    // DATE RANGE
    // ===================================================

    if (filters?.from || filters?.to) {
      query.transactionDate = {};

      if (filters.from) {
        query.transactionDate.$gte = filters.from;
      }

      if (filters.to) {
        query.transactionDate.$lte = filters.to;
      }
    }

    // ===================================================
    // SEARCH
    // ===================================================

    if (filters?.search?.trim()) {
      const search = filters.search.trim();

      query.$or = [
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          customer: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ===================================================
    // RETURN
    // ===================================================

    return await Transaction.find(query).sort({
      transactionDate: -1,
      createdAt: -1,
    });
  }

  async updateById(
    transactionId: string,
    transactionData: Partial<ITransaction>,
  ): Promise<ITransaction | null> {
    return await Transaction.findByIdAndUpdate(transactionId, transactionData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(transactionId: string): Promise<ITransaction | null> {
    return await Transaction.findByIdAndDelete(transactionId);
  }
}

export default new TransactionRepository();
