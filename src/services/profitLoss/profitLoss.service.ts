import mongoose from "mongoose";

import profitLossRepository from "../../repositories/profitLoss/profitLoss.repository";

class ProfitLossService {
  async getProfitLoss(userId: string, from?: Date, to?: Date) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const lines = await profitLossRepository.findByUserId(
      userObjectId,
      from,
      to,
    );

    // ==========================================
    // GROUP BY ACCOUNT
    // ==========================================

    const accountMap = new Map<
      string,
      {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        accountCode: string;
        accountType: "income" | "expense";
        debit: number;
        credit: number;
      }
    >();

    for (const line of lines) {
      const accountId = line.accountId.toString();

      if (!accountMap.has(accountId)) {
        accountMap.set(accountId, {
          accountId: line.accountId,
          accountName: line.accountName,
          accountCode: line.accountCode,
          accountType: line.accountType,
          debit: 0,
          credit: 0,
        });
      }

      const account = accountMap.get(accountId)!;

      account.debit += line.debit ?? 0;
      account.credit += line.credit ?? 0;
    }

    // ==========================================
    // CALCULATE INCOME / EXPENSE
    // ==========================================

    const accounts = Array.from(accountMap.values()).map((account) => {
      let balance = 0;

      if (account.accountType === "income") {
        balance = account.credit - account.debit;
      } else {
        balance = account.debit - account.credit;
      }

      return {
        accountId: account.accountId,
        accountName: account.accountName,
        accountCode: account.accountCode,
        accountType: account.accountType,

        debit: account.debit,
        credit: account.credit,

        balance,
      };
    });

    // ==========================================
    // SEPARATE INCOME / EXPENSE
    // ==========================================

    const income = accounts.filter(
      (account) => account.accountType === "income",
    );

    const expenses = accounts.filter(
      (account) => account.accountType === "expense",
    );

    // ==========================================
    // TOTAL INCOME
    // ==========================================

    const totalIncome = income.reduce(
      (total, account) => total + account.balance,
      0,
    );

    // ==========================================
    // TOTAL EXPENSE
    // ==========================================

    const totalExpenses = expenses.reduce(
      (total, account) => total + account.balance,
      0,
    );

    // ==========================================
    // NET PROFIT / LOSS
    // ==========================================

    const netProfit = totalIncome - totalExpenses;

    return {
      income,
      expenses,

      totalIncome,
      totalExpenses,

      netProfit,

      isProfit: netProfit > 0,
      isLoss: netProfit < 0,
    };
  }
}

export default new ProfitLossService();
