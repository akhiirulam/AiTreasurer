"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const balanceSheet_repository_1 = __importDefault(require("../../repositories/balanceSheet/balanceSheet.repository"));
class BalanceSheetService {
    async getBalanceSheet(userId, toDate) {
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        // ==================================================
        // 1. GET BALANCE SHEET ACCOUNTS
        // ==================================================
        const accounts = await balanceSheet_repository_1.default.findUserAccounts(userObjectId);
        const accountIds = accounts.map((account) => account._id);
        // ==================================================
        // 2. GET BALANCE SHEET JOURNAL LINES
        // ==================================================
        const lines = await balanceSheet_repository_1.default.findJournalLines(userObjectId, accountIds, toDate);
        // ==================================================
        // 3. CALCULATE ACCOUNT MOVEMENTS
        // ==================================================
        const balanceMap = new Map();
        for (const line of lines) {
            const accountId = line.accountId.toString();
            if (!balanceMap.has(accountId)) {
                balanceMap.set(accountId, {
                    debit: 0,
                    credit: 0,
                });
            }
            const balance = balanceMap.get(accountId);
            balance.debit += line.debit ?? 0;
            balance.credit += line.credit ?? 0;
        }
        // ==================================================
        // 4. CLASSIFY BALANCE SHEET ACCOUNTS
        // ==================================================
        const assets = [];
        const liabilities = [];
        const equity = [];
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;
        for (const account of accounts) {
            const values = balanceMap.get(account._id.toString()) || {
                debit: 0,
                credit: 0,
            };
            // ==================================================
            // ASSET
            // ==================================================
            if (account.type === "asset") {
                const balance = values.debit - values.credit;
                if (balance !== 0) {
                    assets.push({
                        accountId: account._id,
                        accountName: account.name,
                        accountCode: account.code,
                        accountType: account.type,
                        balance,
                    });
                    totalAssets += balance;
                }
            }
            // ==================================================
            // LIABILITY
            // ==================================================
            if (account.type === "liability") {
                const balance = values.credit - values.debit;
                if (balance !== 0) {
                    liabilities.push({
                        accountId: account._id,
                        accountName: account.name,
                        accountCode: account.code,
                        accountType: account.type,
                        balance,
                    });
                    totalLiabilities += balance;
                }
            }
            // ==================================================
            // EQUITY
            // ==================================================
            if (account.type === "equity") {
                const balance = values.credit - values.debit;
                if (balance !== 0) {
                    equity.push({
                        accountId: account._id,
                        accountName: account.name,
                        accountCode: account.code,
                        accountType: account.type,
                        balance,
                    });
                    totalEquity += balance;
                }
            }
        }
        // ==================================================
        // 5. GET INCOME + EXPENSES
        // ==================================================
        const profitLoss = await balanceSheet_repository_1.default.findProfitLossLines(userObjectId, toDate);
        let totalIncome = 0;
        let totalExpenses = 0;
        // ==================================================
        // 6. CALCULATE NET PROFIT
        // ==================================================
        const profitLossMap = new Map();
        for (const line of profitLoss.lines) {
            const accountId = line.accountId.toString();
            const account = profitLoss.accounts.find((item) => item._id.toString() === accountId);
            if (!account) {
                continue;
            }
            if (!profitLossMap.has(accountId)) {
                profitLossMap.set(accountId, {
                    debit: 0,
                    credit: 0,
                    type: account.type,
                });
            }
            const values = profitLossMap.get(accountId);
            values.debit += line.debit ?? 0;
            values.credit += line.credit ?? 0;
        }
        for (const values of profitLossMap.values()) {
            // Income accounts are credit-normal
            if (values.type === "income") {
                totalIncome += values.credit - values.debit;
            }
            // Expense accounts are debit-normal
            if (values.type === "expense") {
                totalExpenses += values.debit - values.credit;
            }
        }
        const netProfit = totalIncome - totalExpenses;
        // ==================================================
        // 7. ADD CURRENT PERIOD PROFIT/LOSS TO EQUITY
        // ==================================================
        if (netProfit !== 0) {
            equity.push({
                accountId: null,
                accountName: netProfit > 0 ? "Current Period Profit" : "Current Period Loss",
                accountCode: netProfit > 0 ? "CURRENT-PROFIT" : "CURRENT-LOSS",
                accountType: "equity",
                balance: netProfit,
            });
            totalEquity += netProfit;
        }
        // ==================================================
        // 8. TOTAL LIABILITIES + EQUITY
        // ==================================================
        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
        // ==================================================
        // 9. RETURN BALANCE SHEET
        // ==================================================
        return {
            assets,
            liabilities,
            equity,
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalLiabilitiesAndEquity,
            isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01,
        };
    }
}
exports.default = new BalanceSheetService();
