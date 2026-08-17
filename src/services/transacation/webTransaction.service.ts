import mongoose from "mongoose";

import transactionRepository from "../../repositories/transaction/transaction.repository";

import transactionParserService from "../aiParser/transactionParser";

import supplierRepository from "../../repositories/supplier/Supplier.repositories";

import accountService from "../account/account.service";

interface CreateTransactionData {
  userId: string;

  text: string;

  file?: Express.Multer.File;
}

class TransactionService {
  async createTransaction(data: CreateTransactionData) {
    const { userId, text, file } = data;

    console.log("Transaction text:", text);

    // ==================================================
    // 1. PARSE TRANSACTION USING GEMINI
    // ==================================================

    const parsedTransactions = await transactionParserService.parseTransaction({
      text,
      file,
    });

    const transactions = [];

    // ==================================================
    // 2. PROCESS EACH TRANSACTION
    // ==================================================

    for (const parsedTransaction of parsedTransactions) {
      // ==================================================
      // SUPPLIER
      // ==================================================

      let supplierId: mongoose.Types.ObjectId | null = null;

      if (parsedTransaction.supplierName) {
        const supplier = await supplierRepository.findOrCreate(
          userId,
          parsedTransaction.supplierName,
        );

        supplierId = supplier._id;
      }

      // ==================================================
      // DEBIT ACCOUNT
      // ==================================================

      const debitAccount = await accountService.getOrCreateAccount(
        userId,
        parsedTransaction.debitAccount,
      );

      if (!debitAccount) {
        throw new Error(
          `Unable to create debit account: ${parsedTransaction.debitAccount}`,
        );
      }

      // ==================================================
      // CREDIT ACCOUNT
      // ==================================================

      const creditAccount = await accountService.getOrCreateAccount(
        userId,
        parsedTransaction.creditAccount,
      );

      if (!creditAccount) {
        throw new Error(
          `Unable to create credit account: ${parsedTransaction.creditAccount}`,
        );
      }

      // ==================================================
      // CREATE TRANSACTION
      // ==================================================

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

        // Account names
        debitAccount: debitAccount.name,

        creditAccount: creditAccount.name,

        // User account IDs
        debitAccountId: debitAccount._id,

        creditAccountId: creditAccount._id,
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default new TransactionService();
