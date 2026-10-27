import mongoose from "mongoose";

import accountsReceivableRepository from "../../repositories/accountsReceivable/accountsReceivable.repository";

class AccountsReceivableService {
  async getAccountsReceivable(userId: string, from?: Date, to?: Date) {
    // ==========================================
    // 1. VALIDATE USER ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ==========================================
    // 2. FIND ACCOUNTS RECEIVABLE ACCOUNT
    // ==========================================

    const receivableAccount =
      await accountsReceivableRepository.findReceivableAccount(userObjectId);

    if (!receivableAccount) {
      return {
        period: {
          from: from ?? null,
          to: to ?? null,
        },

        customers: [],

        totalCreditSales: 0,

        totalPayments: 0,

        totalOutstanding: 0,
      };
    }

    // ==========================================
    // 3. GET RECEIVABLE JOURNAL LINES
    // ==========================================

    const lines = await accountsReceivableRepository.findReceivableLines(
      userObjectId,
      receivableAccount._id,
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

    const transactions = await accountsReceivableRepository.findTransactions(
      userObjectId,
      transactionIds,
    );

    const transactionMap = new Map<string, any>();

    for (const transaction of transactions) {
      transactionMap.set(transaction._id.toString(), transaction);
    }

    // ==========================================
    // 6. GROUP BY CUSTOMER
    // ==========================================

    const customerMap = new Map<
      string,
      {
        customer: string;
        creditSales: number;
        payments: number;
        outstanding: number;
      }
    >();

    for (const line of lines as any[]) {
      const journalEntry = line.journalEntryId;

      const transaction = transactionMap.get(
        journalEntry.transactionId.toString(),
      );

      if (!transaction) {
        continue;
      }

      const customer =
        transaction.customerName || transaction.customer || "Unknown Customer";

      if (!customerMap.has(customer)) {
        customerMap.set(customer, {
          customer,

          creditSales: 0,

          payments: 0,

          outstanding: 0,
        });
      }

      const customerData = customerMap.get(customer)!;

      const debit = line.debit ?? 0;

      const credit = line.credit ?? 0;

      /**
       * Accounts Receivable is a
       * debit-normal asset.
       *
       * Debit  → customer owes more
       * Credit → customer paid
       */

      if (debit > 0) {
        customerData.creditSales += debit;
      }

      if (credit > 0) {
        customerData.payments += credit;
      }

      customerData.outstanding =
        customerData.creditSales - customerData.payments;
    }

    // ==========================================
    // 7. CREATE CUSTOMER RESULT
    // ==========================================

    const customers = Array.from(customerMap.values());

    // ==========================================
    // 8. TOTALS
    // ==========================================

    const totalCreditSales = customers.reduce(
      (total, customer) => total + customer.creditSales,
      0,
    );

    const totalPayments = customers.reduce(
      (total, customer) => total + customer.payments,
      0,
    );

    const totalOutstanding = customers.reduce(
      (total, customer) => total + customer.outstanding,
      0,
    );

    // ==========================================
    // 9. RETURN REPORT
    // ==========================================

    return {
      period: {
        from: from ?? null,
        to: to ?? null,
      },

      account: {
        id: receivableAccount._id,
        name: receivableAccount.name,
        code: receivableAccount.code,
      },

      customers,

      totalCreditSales,

      totalPayments,

      totalOutstanding,
    };
  }
}

export default new AccountsReceivableService();
