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

    // ==================================================
    // 1. GROUP JOURNAL LINES BY ACCOUNT
    // ==================================================

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

    // ==================================================
    // 2. CALCULATE NET TRIAL BALANCE
    // ==================================================

    const accounts = Array.from(accountMap.values())
      .map((account) => {
        const debit = account.debit ?? 0;

        const credit = account.credit ?? 0;

        const netBalance = debit - credit;

        // ----------------------------------------------
        // Debit balance
        // ----------------------------------------------

        if (netBalance > 0) {
          return {
            accountId: account.accountId,

            accountName: account.accountName,

            accountCode: account.accountCode,

            accountType: account.accountType,

            debit: netBalance,

            credit: 0,
          };
        }

        // ----------------------------------------------
        // Credit balance
        // ----------------------------------------------

        if (netBalance < 0) {
          return {
            accountId: account.accountId,

            accountName: account.accountName,

            accountCode: account.accountCode,

            accountType: account.accountType,

            debit: 0,

            credit: Math.abs(netBalance),
          };
        }

        // ----------------------------------------------
        // Zero balance
        // ----------------------------------------------

        return null;
      })
      .filter(
        (account): account is NonNullable<typeof account> => account !== null,
      );

    // ==================================================
    // 3. TOTALS
    // ==================================================

    const totalDebit = accounts.reduce(
      (total, account) => total + account.debit,
      0,
    );

    const totalCredit = accounts.reduce(
      (total, account) => total + account.credit,
      0,
    );

    // ==================================================
    // 4. RESULT
    // ==================================================

    return {
      accounts,

      totalDebit,

      totalCredit,

      isBalanced: totalDebit === totalCredit,
    };
  }
}

export default new TrialBalanceService();
