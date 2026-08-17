import mongoose from "mongoose";

import ledgerRepository from "../../repositories/ledger/ledger.repository";

import Account from "../../models/account.model";

class LedgerService {
  /**
   * Get ledger for one user account.
   */
  async getAccountLedger(userId: string, accountId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const accountObjectId = new mongoose.Types.ObjectId(accountId);

    // ==================================================
    // 1. GET ACCOUNT
    // ==================================================

    const account = await Account.findOne({
      _id: accountObjectId,
      userId: userObjectId,
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // ==================================================
    // 2. GET JOURNAL LINES
    // ==================================================

    const lines = await ledgerRepository.findByAccountId(accountObjectId);

    // ==================================================
    // 3. CALCULATE BALANCE
    // ==================================================

    let balance = 0;

    let totalDebit = 0;

    let totalCredit = 0;

    const entries = lines.map((line) => {
      const debit = line.debit ?? 0;

      const credit = line.credit ?? 0;

      totalDebit += debit;

      totalCredit += credit;

      /**
       * Debit-normal accounts:
       *
       * Asset
       * Expense
       *
       * Balance = Debit - Credit
       *
       * Credit-normal accounts:
       *
       * Liability
       * Equity
       * Income
       *
       * Balance = Credit - Debit
       */

      if (account.type === "asset" || account.type === "expense") {
        balance += debit - credit;
      } else {
        balance += credit - debit;
      }

      const journalEntry = line.journalEntryId as any;

      return {
        journalEntryId: journalEntry._id,

        transactionId: journalEntry.transactionId,

        date: journalEntry.entryDate,

        description: journalEntry.description,

        debit,

        credit,

        balance,
      };
    });

    // ==================================================
    // 4. RETURN LEDGER
    // ==================================================

    return {
      account: {
        id: account._id,

        name: account.name,

        code: account.code,

        type: account.type,
      },

      entries,

      totalDebit,

      totalCredit,

      closingBalance: balance,
    };
  }
}

export default new LedgerService();
