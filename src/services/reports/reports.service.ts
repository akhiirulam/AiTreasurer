import mongoose from "mongoose";

import reportsRepository from "../../repositories/reports/reports.repository";

class ReportsService {
  /**
   * Get financial report for one user.
   *
   * Includes:
   * - Sales
   * - Purchases
   * - Other income
   * - Other expenses
   * - Total income
   * - Total expenses
   * - Net profit
   * - Receivables
   * - Payables
   */
  async getReport(userId: string, from?: Date, to?: Date) {
    // ==================================================
    // 1. Validate user ID
    // ==================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // ==================================================
    // 2. Get transactions
    // ==================================================

    const transactions = await reportsRepository.findTransactions(
      userId,
      from,
      to,
    );

    // ==================================================
    // 3. Initialize totals
    // ==================================================

    let totalSales = 0;
    let totalPurchases = 0;

    let otherIncome = 0;
    let otherExpenses = 0;

    // ==================================================
    // 4. Separate sales, purchases, income and expenses
    // ==================================================

    const sales: any[] = [];
    const purchases: any[] = [];

    for (const transaction of transactions) {
      const amount = Number(transaction.amount || 0);

      switch (transaction.type) {
        case "sale":
          totalSales += amount;
          sales.push({
            ...transaction,
            reportAmount: amount,
          });
          break;

        case "purchase":
          totalPurchases += amount;
          purchases.push({
            ...transaction,
            reportAmount: amount,
          });
          break;

        case "income":
          otherIncome += amount;
          break;

        case "expense":
          otherExpenses += amount;
          break;

        default:
          // payment and capital transactions
          // are not directly income or expense.
          break;
      }
    }

    // ==================================================
    // 5. Calculate total income
    // ==================================================

    const totalIncome = totalSales + otherIncome;

    // ==================================================
    // 6. Calculate total expenses
    // ==================================================

    const totalExpenses = totalPurchases + otherExpenses;

    // ==================================================
    // 7. Calculate net profit
    // ==================================================

    const netProfit = totalIncome - totalExpenses;

    // ==================================================
    // 8. Calculate customer receivables
    // ==================================================

    const customerIds = [
      ...new Set(
        sales
          .map((sale) => (sale.customerId ? sale.customerId.toString() : null))
          .filter(Boolean),
      ),
    ];

    const customerPayments = transactions.filter(
      (transaction: any) =>
        transaction.type === "payment" && transaction.customerId,
    );

    let totalReceivables = 0;

    // Group sales by customer
    const salesByCustomer = new Map<string, any[]>();

    for (const sale of sales) {
      if (!sale.customerId) {
        continue;
      }

      const customerId = sale.customerId.toString();

      if (!salesByCustomer.has(customerId)) {
        salesByCustomer.set(customerId, []);
      }

      salesByCustomer.get(customerId)!.push({
        ...sale,
        paidAmount: 0,
        outstandingAmount: sale.reportAmount,
      });
    }

    // Apply customer payments FIFO
    for (const payment of customerPayments) {
      if (!payment.customerId) {
        continue;
      }

      const customerId = payment.customerId.toString();

      const customerSales = salesByCustomer.get(customerId);

      if (!customerSales) {
        continue;
      }

      let remainingPayment = Number(payment.amount || 0);

      for (const sale of customerSales) {
        if (remainingPayment <= 0) {
          break;
        }

        if (sale.outstandingAmount <= 0) {
          continue;
        }

        const allocation = Math.min(remainingPayment, sale.outstandingAmount);

        sale.paidAmount += allocation;

        sale.outstandingAmount -= allocation;

        remainingPayment -= allocation;
      }
    }

    for (const customerSales of salesByCustomer.values()) {
      for (const sale of customerSales) {
        totalReceivables += sale.outstandingAmount;
      }
    }

    // ==================================================
    // 9. Calculate supplier payables
    // ==================================================

    const supplierIds = [
      ...new Set(
        purchases
          .map((purchase) =>
            purchase.supplierId ? purchase.supplierId.toString() : null,
          )
          .filter(Boolean),
      ),
    ];

    const supplierPayments = transactions.filter(
      (transaction: any) =>
        transaction.type === "payment" && transaction.supplierId,
    );

    let totalPayables = 0;

    // Group purchases by supplier
    const purchasesBySupplier = new Map<string, any[]>();

    for (const purchase of purchases) {
      if (!purchase.supplierId) {
        continue;
      }

      const supplierId = purchase.supplierId.toString();

      if (!purchasesBySupplier.has(supplierId)) {
        purchasesBySupplier.set(supplierId, []);
      }

      purchasesBySupplier.get(supplierId)!.push({
        ...purchase,
        paidAmount: 0,
        outstandingAmount: purchase.reportAmount,
      });
    }

    // Apply supplier payments FIFO
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

      for (const purchase of supplierPurchases) {
        if (remainingPayment <= 0) {
          break;
        }

        if (purchase.outstandingAmount <= 0) {
          continue;
        }

        const allocation = Math.min(
          remainingPayment,
          purchase.outstandingAmount,
        );

        purchase.paidAmount += allocation;

        purchase.outstandingAmount -= allocation;

        remainingPayment -= allocation;
      }
    }

    for (const supplierPurchases of purchasesBySupplier.values()) {
      for (const purchase of supplierPurchases) {
        totalPayables += purchase.outstandingAmount;
      }
    }

    // ==================================================
    // 10. Return report
    // ==================================================

    return {
      period: {
        from: from ?? null,
        to: to ?? null,
      },

      summary: {
        totalSales,
        totalPurchases,
        otherIncome,
        otherExpenses,
        totalIncome,
        totalExpenses,
        netProfit,
        totalReceivables,
        totalPayables,
      },
    };
  }
}

export default new ReportsService();
