import mongoose from "mongoose";

import dashboardRepository from "../../repositories/dashboard/dashboard.repository";

class DashboardService {
  /**
   * Get dashboard summary for one user.
   *
   * Default period: current month.
   */
  async getDashboard(userId: string, from?: Date, to?: Date) {
    // ==================================================
    // 1. Validate user ID
    // ==================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // ==================================================
    // 2. Get transactions and accounts
    // ==================================================

    const [transactions, accounts] = await Promise.all([
      dashboardRepository.findTransactions(userId, from, to),

      dashboardRepository.findAccounts(userId),
    ]);

    // ==================================================
    // 3. Initialize totals
    // ==================================================

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSales = 0;
    let totalPurchases = 0;

    // ==================================================
    // 4. Calculate income / expenses
    // ==================================================

    for (const transaction of transactions) {
      const amount = Number(transaction.amount || 0);

      switch (transaction.type) {
        case "income":
          totalIncome += amount;
          break;

        case "expense":
          totalExpenses += amount;
          break;

        case "sale":
          totalSales += amount;
          totalIncome += amount;
          break;

        case "purchase":
          totalPurchases += amount;
          totalExpenses += amount;
          break;

        default:
          // Payments and capital transactions
          // do not directly affect profit.
          break;
      }
    }

    // ==================================================
    // 5. Net profit
    // ==================================================

    const netProfit = totalIncome - totalExpenses;

    // ==================================================
    // 6. Calculate receivables
    // ==================================================

    const sales = transactions.filter(
      (transaction) => transaction.type === "sale",
    );

    const customerPayments = transactions.filter(
      (transaction) => transaction.type === "payment" && transaction.customerId,
    );

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
        amount: Number(sale.amount || 0),
        outstandingAmount: Number(sale.amount || 0),
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

        sale.outstandingAmount -= allocation;

        remainingPayment -= allocation;
      }
    }

    let totalReceivables = 0;

    for (const customerSales of salesByCustomer.values()) {
      for (const sale of customerSales) {
        totalReceivables += sale.outstandingAmount;
      }
    }

    // ==================================================
    // 7. Calculate payables
    // ==================================================

    const purchases = transactions.filter(
      (transaction) => transaction.type === "purchase",
    );

    const supplierPayments = transactions.filter(
      (transaction) => transaction.type === "payment" && transaction.supplierId,
    );

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
        amount: Number(purchase.amount || 0),
        outstandingAmount: Number(purchase.amount || 0),
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

        purchase.outstandingAmount -= allocation;

        remainingPayment -= allocation;
      }
    }

    let totalPayables = 0;

    for (const supplierPurchases of purchasesBySupplier.values()) {
      for (const purchase of supplierPurchases) {
        totalPayables += purchase.outstandingAmount;
      }
    }

    // ==================================================
    // 8. Calculate cash / bank balance
    // ==================================================

    const cashBankAccounts = accounts.filter(
      (account: any) =>
        account.subCategory === "cash_and_cash_equivalents" ||
        account.subCategory === "cash_and_bank",
    );

    const cashBankAccountIds = new Set(
      cashBankAccounts.map((account: any) => account._id.toString()),
    );

    let cashBankBalance = 0;

    for (const transaction of transactions) {
      const amount = Number(transaction.amount || 0);

      const debitIsCashBank =
        transaction.debitAccountId &&
        cashBankAccountIds.has(transaction.debitAccountId.toString());

      const creditIsCashBank =
        transaction.creditAccountId &&
        cashBankAccountIds.has(transaction.creditAccountId.toString());

      if (debitIsCashBank) {
        cashBankBalance += amount;
      }

      if (creditIsCashBank) {
        cashBankBalance -= amount;
      }
    }

    // ==================================================
    // 9. Recent transactions
    // ==================================================

    const recentTransactions = transactions
      .slice(0, 5)
      .map((transaction: any) => ({
        id: transaction._id,
        type: transaction.type,
        amount: Number(transaction.amount || 0),
        description: transaction.description || "",
        category: transaction.category || null,
        customer: transaction.customer || null,
        supplier: transaction.supplier || null,
        transactionDate: transaction.transactionDate,
        paymentStatus: transaction.paymentStatus || null,
      }));

    // ==================================================
    // 10. Return dashboard
    // ==================================================

    return {
      period: {
        from: from ?? null,
        to: to ?? null,
      },

      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        cashBankBalance,
      },

      business: {
        totalSales,
        totalPurchases,
        totalReceivables,
        totalPayables,
      },

      recentTransactions,
    };
  }
}

export default new DashboardService();
