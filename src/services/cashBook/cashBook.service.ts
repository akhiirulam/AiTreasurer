import mongoose from "mongoose";

import cashBookRepository from "../../repositories/cashBook/cashBook.repository";

class CashBookService {
  async getCashBook(userId: string, from?: Date, to?: Date) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ==================================================
    // GET ALL CASH/BANK ACCOUNTS
    // ==================================================

    const accounts = await cashBookRepository.findCashAccounts(userObjectId);

    const accountResults = [];

    // ==================================================
    // PROCESS EACH CASH/BANK ACCOUNT
    // ==================================================

    for (const account of accounts) {
      let openingBalance = 0;

      // ==================================================
      // OPENING BALANCE
      // ==================================================

      if (from) {
        const openingLines = await cashBookRepository.findOpeningLines(
          userObjectId,
          account._id,
          from,
        );

        for (const line of openingLines) {
          openingBalance += (line.debit ?? 0) - (line.credit ?? 0);
        }
      }

      // ==================================================
      // PERIOD ENTRIES
      // ==================================================

      const lines = await cashBookRepository.findPeriodLines(
        userObjectId,
        account._id,
        from,
        to,
      );

      let balance = openingBalance;

      let totalReceipts = 0;
      let totalPayments = 0;

      const entries = lines.map((line) => {
        const receipt = line.debit ?? 0;

        const payment = line.credit ?? 0;

        totalReceipts += receipt;

        totalPayments += payment;

        balance += receipt - payment;

        const journalEntry = line.journalEntryId as any;

        return {
          journalEntryId: journalEntry._id,

          transactionId: journalEntry.transactionId,

          date: journalEntry.entryDate,

          description: journalEntry.description,

          receipt,

          payment,

          balance,
        };
      });

      accountResults.push({
        account: {
          id: account._id,

          name: account.name,

          code: account.code,

          type: account.type,

          category: account.category,

          subCategory: account.subCategory,
        },

        openingBalance,

        entries,

        totalReceipts,

        totalPayments,

        closingBalance: balance,
      });
    }

    // ==================================================
    // TOTALS
    // ==================================================

    const totalOpeningBalance = accountResults.reduce(
      (total, account) => total + account.openingBalance,
      0,
    );

    const totalReceipts = accountResults.reduce(
      (total, account) => total + account.totalReceipts,
      0,
    );

    const totalPayments = accountResults.reduce(
      (total, account) => total + account.totalPayments,
      0,
    );

    const totalClosingBalance = accountResults.reduce(
      (total, account) => total + account.closingBalance,
      0,
    );

    return {
      period: {
        from: from ?? null,
        to: to ?? null,
      },

      accounts: accountResults,

      totalOpeningBalance,

      totalReceipts,

      totalPayments,

      totalClosingBalance,
    };
  }
}

export default new CashBookService();
