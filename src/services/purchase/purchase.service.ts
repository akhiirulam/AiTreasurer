import mongoose from "mongoose";

import purchaseRepository from "../../repositories/purchase/purchase.repository";

class PurchaseService {
  /**
   * Get purchase report for one user.
   *
   * Purchase amount comes from the debit side of the
   * Purchase account.
   *
   * Supplier payments are separate payment transactions,
   * so they are allocated against purchases using FIFO.
   */
  async getPurchases(userId: string, from?: Date, to?: Date) {
    // ==================================================
    // 1. Validate user ID
    // ==================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // ==================================================
    // 2. Find Purchase account
    // ==================================================

    const purchaseAccount =
      await purchaseRepository.findPurchaseAccount(userId);

    if (!purchaseAccount) {
      throw new Error("Purchase account not found");
    }

    // ==================================================
    // 3. Find journal lines for Purchase account
    // ==================================================

    const purchaseLines = await purchaseRepository.findPurchaseLines(
      userId,
      purchaseAccount._id,
      from,
      to,
    );

    if (purchaseLines.length === 0) {
      return {
        period: {
          from: from ?? null,
          to: to ?? null,
        },

        account: {
          id: purchaseAccount._id,
          name: purchaseAccount.name,
          code: purchaseAccount.code,
        },

        purchases: [],

        totalPurchases: 0,
        totalPaid: 0,
        totalOutstanding: 0,
      };
    }

    // ==================================================
    // 4. Get transaction IDs
    // ==================================================

    const transactionIds = purchaseLines
      .map((line: any) => line.journalEntryId?.transactionId)
      .filter(Boolean);

    // ==================================================
    // 5. Find purchase transactions
    // ==================================================

    const transactions = await purchaseRepository.findTransactions(
      userId,
      transactionIds,
    );

    // ==================================================
    // 6. Create transaction lookup
    // ==================================================

    const transactionMap = new Map<string, any>();

    for (const transaction of transactions) {
      transactionMap.set(transaction._id.toString(), transaction);
    }

    // ==================================================
    // 7. Get supplier IDs
    // ==================================================

    const supplierIds = [
      ...new Set(
        transactions
          .map((transaction: any) =>
            transaction.supplierId ? transaction.supplierId.toString() : null,
          )
          .filter(Boolean),
      ),
    ].map((id) => new mongoose.Types.ObjectId(id));

    // ==================================================
    // 8. Get suppliers
    // ==================================================

    const suppliers = await purchaseRepository.findSuppliersByIds(
      userId,
      supplierIds,
    );

    // ==================================================
    // 9. Create supplier lookup
    // ==================================================

    const supplierMap = new Map<string, string>();

    for (const supplier of suppliers) {
      supplierMap.set(supplier._id.toString(), supplier.name);
    }

    // ==================================================
    // 10. Build purchase rows
    // ==================================================

    const purchases = purchaseLines
      .map((line: any) => {
        const journalEntry = line.journalEntryId;

        if (!journalEntry) {
          return null;
        }

        const transaction = transactionMap.get(
          journalEntry.transactionId?.toString(),
        );

        if (!transaction) {
          return null;
        }

        const supplierId = transaction.supplierId
          ? transaction.supplierId.toString()
          : null;

        const supplierName = supplierId ? supplierMap.get(supplierId) : null;

        const amount = Number(line.debit || 0);

        return {
          transactionId: transaction._id.toString(),

          date: transaction.transactionDate,

          supplier: supplierName || transaction.supplier || null,

          supplierId,

          description:
            transaction.description || journalEntry.description || "",

          amount,

          paymentStatus: transaction.paymentStatus || "unknown",

          paidAmount: 0,

          outstandingAmount: amount,
        };
      })
      .filter(
        (purchase): purchase is NonNullable<typeof purchase> =>
          purchase !== null,
      );
    // ==================================================
    // 11. Sort purchases oldest first temporarily
    //     because FIFO payment allocation needs this.
    // ==================================================

    purchases.sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // ==================================================
    // 12. Get supplier payments
    // ==================================================

    const supplierPayments = await purchaseRepository.findSupplierPayments(
      userId,
      supplierIds,
      from,
      to,
    );

    // ==================================================
    // 13. Group purchases by supplier
    // ==================================================

    const purchasesBySupplier = new Map<string, any[]>();

    for (const purchase of purchases) {
      if (!purchase.supplierId) {
        continue;
      }

      const supplierId = purchase.supplierId;

      if (!purchasesBySupplier.has(supplierId)) {
        purchasesBySupplier.set(supplierId, []);
      }

      purchasesBySupplier.get(supplierId)!.push(purchase);
    }

    // ==================================================
    // 14. Apply supplier payments using FIFO
    // ==================================================

    for (const payment of supplierPayments) {
      if (!payment.supplierId) {
        continue;
      }

      const supplierId = payment.supplierId.toString();

      const supplierPurchases = purchasesBySupplier.get(supplierId);

      if (!supplierPurchases) {
        continue;
      }

      let remainingPayment = Number(payment.amount || 0);

      // Oldest purchase gets payment first.
      for (const purchase of supplierPurchases) {
        if (remainingPayment <= 0) {
          break;
        }

        const outstanding = purchase.amount - purchase.paidAmount;

        if (outstanding <= 0) {
          continue;
        }

        const allocation = Math.min(remainingPayment, outstanding);

        purchase.paidAmount += allocation;

        purchase.outstandingAmount = purchase.amount - purchase.paidAmount;

        remainingPayment -= allocation;
      }
    }

    // ==================================================
    // 15. Update payment status
    // ==================================================

    for (const purchase of purchases) {
      if (purchase.paidAmount <= 0) {
        purchase.paymentStatus = "unpaid";
      } else if (purchase.paidAmount >= purchase.amount) {
        purchase.paymentStatus = "paid";

        purchase.paidAmount = purchase.amount;

        purchase.outstandingAmount = 0;
      } else {
        purchase.paymentStatus = "partial";
      }
    }

    // ==================================================
    // 16. Calculate totals
    // ==================================================

    const totalPurchases = purchases.reduce(
      (total: number, purchase: any) => total + purchase.amount,
      0,
    );

    const totalPaid = purchases.reduce(
      (total: number, purchase: any) => total + purchase.paidAmount,
      0,
    );

    const totalOutstanding = purchases.reduce(
      (total: number, purchase: any) => total + purchase.outstandingAmount,
      0,
    );

    // ==================================================
    // 17. Sort newest first for UI
    // ==================================================

    purchases.sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // ==================================================
    // 18. Return report
    // ==================================================

    return {
      period: {
        from: from ?? null,
        to: to ?? null,
      },

      account: {
        id: purchaseAccount._id,
        name: purchaseAccount.name,
        code: purchaseAccount.code,
      },

      purchases,

      totalPurchases,
      totalPaid,
      totalOutstanding,
    };
  }
}

export default new PurchaseService();
