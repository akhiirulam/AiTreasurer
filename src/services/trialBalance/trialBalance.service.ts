import mongoose from "mongoose";

import trialBalanceRepository from "../../repositories/trialBalance/trialBalance.repository";

class TrialBalanceService {
  async getTrialBalance(userId: string, from?: Date, to?: Date) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const lines = await trialBalanceRepository.findByUserId(
      userObjectId,
      from,
      to,
    );

    // ==========================================
    // GROUP JOURNAL LINES BY ACCOUNT
    // ==========================================

    const accountMap = new Map<
      string,
      {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        accountCode: string;
        accountType: string;
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
    // CREATE TRIAL BALANCE
    // ==========================================

    const accounts = Array.from(accountMap.values()).map((account) => ({
      accountId: account.accountId,

      accountName: account.accountName,

      accountCode: account.accountCode,

      accountType: account.accountType,

      debit: account.debit,

      credit: account.credit,
    }));

    // ==========================================
    // TOTALS
    // ==========================================

    const totalDebit = accounts.reduce(
      (total, account) => total + account.debit,
      0,
    );

    const totalCredit = accounts.reduce(
      (total, account) => total + account.credit,
      0,
    );

    return {
      accounts,

      totalDebit,

      totalCredit,

      isBalanced: totalDebit === totalCredit,
    };
  }
}

export default new TrialBalanceService();
