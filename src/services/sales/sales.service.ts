import mongoose from "mongoose";

import salesRepository from "../../repositories/sales/sales.repository";

class SalesService {
  async getSales(userId: string, from?: Date, to?: Date) {
    // ==========================================
    // 1. VALIDATE USER ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ==========================================
    // 2. FIND SALES ACCOUNT
    // ==========================================

    const salesAccount = await salesRepository.findSalesAccount(userObjectId);

    if (!salesAccount) {
      return {
        period: {
          from: from ?? null,
          to: to ?? null,
        },

        sales: [],

        totalSales: 0,

        totalPaid: 0,

        totalOutstanding: 0,
      };
    }

    // ==========================================
    // 3. GET SALES JOURNAL LINES
    // ==========================================

    const lines = await salesRepository.findSalesLines(
      userObjectId,
      salesAccount._id,
      from,
      to,
    );

    // ==========================================
    // 4. GET TRANSACTION IDs
    // ==========================================

    const transactionIds = lines.map((line: any) => {
      const journalEntry = line.journalEntryId;

      return journalEntry.transactionId;
    });

    // ==========================================
    // 5. GET TRANSACTIONS
    // ==========================================

    const transactions = await salesRepository.findTransactions(
      userObjectId,
      transactionIds,
    );

    const transactionMap = new Map<string, any>();

    for (const transaction of transactions) {
      transactionMap.set(transaction._id.toString(), transaction);
    }

    // ==========================================
    // 6. BUILD SALES REPORT
    // ==========================================

    const sales = [];

    for (const line of lines as any[]) {
      const journalEntry = line.journalEntryId;

      const transaction = transactionMap.get(
        journalEntry.transactionId.toString(),
      );

      if (!transaction) {
        continue;
      }

      const amount = line.credit ?? 0;

      sales.push({
        transactionId: transaction._id,

        date: journalEntry.entryDate,

        customer: transaction.customer ?? null,

        description: journalEntry.description,

        amount,

        paymentStatus: transaction.paymentStatus,

        paidAmount: transaction.paidAmount ?? 0,

        outstandingAmount: transaction.outstandingAmount ?? 0,
      });
    }

    // ==========================================
    // 7. TOTALS
    // ==========================================

    const totalSales = sales.reduce((total, sale) => total + sale.amount, 0);

    const totalPaid = sales.reduce((total, sale) => total + sale.paidAmount, 0);

    const totalOutstanding = sales.reduce(
      (total, sale) => total + sale.outstandingAmount,
      0,
    );

    // ==========================================
    // 8. RETURN REPORT
    // ==========================================

    return {
      period: {
        from: from ?? null,
        to: to ?? null,
      },

      account: {
        id: salesAccount._id,

        name: salesAccount.name,

        code: salesAccount.code,
      },

      sales,

      totalSales,

      totalPaid,

      totalOutstanding,
    };
  }
}

export default new SalesService();
