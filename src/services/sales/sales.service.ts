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
    // 4. GET SALES TRANSACTION IDs
    // ==========================================

    const transactionIds = lines
      .map((line: any) => {
        return line.journalEntryId?.transactionId;
      })
      .filter(Boolean);

    // ==========================================
    // 5. GET SALES TRANSACTIONS
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

    const sales: any[] = [];

    for (const line of lines as any[]) {
      const journalEntry = line.journalEntryId;

      if (!journalEntry?.transactionId) {
        continue;
      }

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
        customerId: transaction.customerId ?? null,
        description: journalEntry.description,
        amount,
        paymentStatus: transaction.paymentStatus,
        paidAmount: 0,
        outstandingAmount: amount,
      });
    }

    // ==========================================
    // 7. FIND CUSTOMERS FROM SALES
    // ==========================================

    const customerIds = sales.map((sale) => sale.customerId).filter(Boolean);

    const uniqueCustomerIds = Array.from(
      new Map(
        customerIds.map((id: mongoose.Types.ObjectId) => [id.toString(), id]),
      ).values(),
    );

    // ==========================================
    // 8. GET CUSTOMER PAYMENTS
    // ==========================================

    const payments = await salesRepository.findCustomerPayments(
      userObjectId,
      uniqueCustomerIds,
      from,
      to,
    );

    // ==========================================
    // 9. GROUP SALES BY CUSTOMER
    // ==========================================

    const salesByCustomer = new Map<string, any[]>();

    for (const sale of sales) {
      if (!sale.customerId) {
        continue;
      }

      const customerKey = sale.customerId.toString();

      if (!salesByCustomer.has(customerKey)) {
        salesByCustomer.set(customerKey, []);
      }

      salesByCustomer.get(customerKey)!.push(sale);
    }

    // ==========================================
    // 10. APPLY CUSTOMER PAYMENTS
    // ==========================================

    for (const payment of payments) {
      if (!payment.customerId) {
        continue;
      }

      const customerKey = payment.customerId.toString();

      const customerSales = salesByCustomer.get(customerKey);

      if (!customerSales) {
        continue;
      }

      let remainingPayment = payment.amount ?? 0;

      // Apply payment to the oldest
      // outstanding sale first.
      for (const sale of customerSales) {
        if (remainingPayment <= 0) {
          break;
        }

        const outstanding = sale.amount - sale.paidAmount;

        if (outstanding <= 0) {
          continue;
        }

        const appliedAmount = Math.min(remainingPayment, outstanding);

        sale.paidAmount += appliedAmount;

        sale.outstandingAmount -= appliedAmount;

        remainingPayment -= appliedAmount;
      }
    }

    // ==========================================
    // 11. DETERMINE PAYMENT STATUS
    // ==========================================

    for (const sale of sales) {
      if (sale.paidAmount <= 0) {
        sale.paidAmount = 0;
        sale.outstandingAmount = sale.amount;
        sale.paymentStatus = "unpaid";
      } else if (sale.paidAmount >= sale.amount) {
        sale.paidAmount = sale.amount;
        sale.outstandingAmount = 0;
        sale.paymentStatus = "paid";
      } else {
        sale.paymentStatus = "partial";
      }
    }

    // ==========================================
    // 12. CALCULATE TOTALS
    // ==========================================

    const totalSales = sales.reduce((total, sale) => total + sale.amount, 0);

    const totalPaid = sales.reduce((total, sale) => total + sale.paidAmount, 0);

    const totalOutstanding = sales.reduce(
      (total, sale) => total + sale.outstandingAmount,
      0,
    );

    // ==========================================
    // 13. RETURN REPORT
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
