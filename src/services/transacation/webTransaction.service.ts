import mongoose from "mongoose";

import transactionRepository from "../../repositories/transaction/transaction.repository";
import transactionParserService from "../aiParser/transactionParser";
import supplierRepository from "../../repositories/supplier/Supplier.repositories";

interface CreateTransactionData {
  userId: string;
  text: string;
  file?: Express.Multer.File;
}

class TransactionService {
  async createTransaction(data: CreateTransactionData) {
    const { userId, text, file } = data;

    console.log("Transaction text:", text);

    // 1. Parse transaction using Gemini
    const parsedTransactions = await transactionParserService.parseTransaction({
      text,
      file,
    });

    // 2. Store each parsed transaction
    const transactions = [];

    for (const parsedTransaction of parsedTransactions) {
      // IMPORTANT:
      // supplierId must be reset for every transaction
      let supplierId: mongoose.Types.ObjectId | null = null;

      // Find/create supplier using the name extracted by Gemini
      if (parsedTransaction.supplierName) {
        const supplier = await supplierRepository.findOrCreate(
          userId,
          parsedTransaction.supplierName,
        );

        supplierId = supplier._id;
      }

      const transaction = await transactionRepository.create({
        userId: new mongoose.Types.ObjectId(userId),

        rawText: text,

        type: parsedTransaction.type,

        amount: parsedTransaction.amount,

        description: parsedTransaction.description,

        category: parsedTransaction.category,

        customer: parsedTransaction.customerName,

        supplierId,

        transactionDate: new Date(parsedTransaction.transactionDate),

        paymentStatus: parsedTransaction.paymentStatus,

        paidAmount: parsedTransaction.paidAmount,

        outstandingAmount: parsedTransaction.outstandingAmount,

        debitAccount: parsedTransaction.debitAccount,

        creditAccount: parsedTransaction.creditAccount,
      });

      transactions.push(transaction);
    }

    // 3. Return all created transactions
    return transactions;
  }
}

export default new TransactionService();
