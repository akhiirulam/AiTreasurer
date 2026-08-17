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
