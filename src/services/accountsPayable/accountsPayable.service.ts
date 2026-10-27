import mongoose from "mongoose";

import accountsPayableRepository from "../../repositories/accountsPayable/accountsPayable.repository";

class AccountsPayableService {
  async getAccountsPayable(userId: string, from?: Date, to?: Date) {
    // ==========================================
    // 1. VALIDATE USER ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ==========================================
    // 2. FIND ACCOUNTS PAYABLE ACCOUNT
    // ==========================================

    const payableAccount =
      await accountsPayableRepository.findPayableAccount(userObjectId);

    if (!payableAccount) {
      return {
        period: {
          from: from ?? null,
          to: to ?? null,
        },

        suppliers: [],

        totalCreditPurchases: 0,

        totalPayments: 0,

        totalOutstanding: 0,
      };
    }

    // ==========================================
    // 3. GET PAYABLE JOURNAL LINES
    // ==========================================

    const lines = await accountsPayableRepository.findPayableLines(
      userObjectId,
      payableAccount._id,
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

    const transactions = await accountsPayableRepository.findTransactions(
      userObjectId,
      transactionIds,
    );

    const transactionMap = new Map<string, any>();

    for (const transaction of transactions) {
      transactionMap.set(transaction._id.toString(), transaction);
    }

    // ==========================================
    // 6. GET SUPPLIER IDs
    // ==========================================

    const supplierIds = transactions
      .map((transaction: any) => transaction.supplierId)
      .filter(Boolean)
      .map((supplierId: any) => new mongoose.Types.ObjectId(supplierId));

    // ==========================================
    // 7. GET SUPPLIERS
    // ==========================================

    const suppliers =
      await accountsPayableRepository.findSuppliers(supplierIds);

    const supplierMap = new Map<string, any>();

    for (const supplier of suppliers) {
      supplierMap.set(supplier._id.toString(), supplier);
    }

    // ==========================================
    // 8. GROUP BY SUPPLIER
    // ==========================================

    const supplierMapResult = new Map<
      string,
      {
        supplier: string;
        creditPurchases: number;
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

      // ------------------------------------------
      // FIND SUPPLIER
      // ------------------------------------------

      const supplierRecord = transaction.supplierId
        ? supplierMap.get(transaction.supplierId.toString())
        : null;

      const supplier = supplierRecord?.name || "Unknown Supplier";

      // ------------------------------------------
      // CREATE SUPPLIER ENTRY
      // ------------------------------------------

      if (!supplierMapResult.has(supplier)) {
        supplierMapResult.set(supplier, {
          supplier,

          creditPurchases: 0,

          payments: 0,

          outstanding: 0,
        });
      }

      const supplierData = supplierMapResult.get(supplier)!;

      const debit = line.debit ?? 0;

      const credit = line.credit ?? 0;

      /**
       * Accounts Payable is a
       * credit-normal liability.
       *
       * Credit → payable increases
       * Debit  → payable decreases
       */

      if (credit > 0) {
        supplierData.creditPurchases += credit;
      }

      if (debit > 0) {
        supplierData.payments += debit;
      }

      supplierData.outstanding =
        supplierData.creditPurchases - supplierData.payments;
    }

    // ==========================================
    // 9. CREATE SUPPLIER RESULT
    // ==========================================

    const supplierResults = Array.from(supplierMapResult.values());

    // ==========================================
    // 10. TOTALS
    // ==========================================

    const totalCreditPurchases = supplierResults.reduce(
      (total, supplier) => total + supplier.creditPurchases,
      0,
    );

    const totalPayments = supplierResults.reduce(
      (total, supplier) => total + supplier.payments,
      0,
    );

    const totalOutstanding = supplierResults.reduce(
      (total, supplier) => total + supplier.outstanding,
      0,
    );

    // ==========================================
    // 11. RETURN REPORT
    // ==========================================

    return {
      period: {
        from: from ?? null,
        to: to ?? null,
      },

      account: {
        id: payableAccount._id,
        name: payableAccount.name,
        code: payableAccount.code,
      },

      suppliers: supplierResults,

      totalCreditPurchases,

      totalPayments,

      totalOutstanding,
    };
  }
}

export default new AccountsPayableService();
