"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const expense_repository_1 = __importDefault(require("../../repositories/expense/expense.repository"));
class ExpenseService {
    async getExpenses(userId, from, to) {
        // ==========================================
        // 1. VALIDATE USER ID
        // ==========================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        // ==========================================
        // 2. GET EXPENSE ACCOUNTS
        // ==========================================
        const accounts = await expense_repository_1.default.findExpenseAccounts(userObjectId);
        if (accounts.length === 0) {
            return {
                period: {
                    from: from ?? null,
                    to: to ?? null,
                },
                expenses: [],
                totalExpenses: 0,
            };
        }
        const accountIds = accounts.map((account) => account._id);
        // ==========================================
        // 3. GET EXPENSE JOURNAL LINES
        // ==========================================
        const lines = await expense_repository_1.default.findExpenseLines(userObjectId, accountIds, from, to);
        // ==========================================
        // 4. ACCOUNT MAP
        // ==========================================
        const accountMap = new Map();
        for (const account of accounts) {
            accountMap.set(account._id.toString(), {
                name: account.name,
                code: account.code,
            });
        }
        // ==========================================
        // 5. BUILD EXPENSE REPORT
        // ==========================================
        const expenses = [];
        for (const line of lines) {
            const journalEntry = line.journalEntryId;
            const account = accountMap.get(line.accountId.toString());
            if (!account) {
                continue;
            }
            const debit = line.debit ?? 0;
            const credit = line.credit ?? 0;
            /**
             * Expense is debit-normal.
             *
             * Debit  → expense increases
             * Credit → expense decreases
             */
            const amount = debit - credit;
            // Ignore zero-value entries
            if (amount === 0) {
                continue;
            }
            expenses.push({
                accountId: line.accountId,
                accountName: account.name,
                accountCode: account.code,
                date: journalEntry.entryDate,
                description: journalEntry.description,
                amount,
            });
        }
        // ==========================================
        // 6. TOTAL EXPENSES
        // ==========================================
        const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
        // ==========================================
        // 7. RETURN REPORT
        // ==========================================
        return {
            period: {
                from: from ?? null,
                to: to ?? null,
            },
            expenses,
            totalExpenses,
        };
    }
}
exports.default = new ExpenseService();
