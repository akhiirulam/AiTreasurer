"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ledger_repository_1 = __importDefault(require("../../repositories/ledger/ledger.repository"));
const account_model_1 = __importDefault(require("../../models/account.model"));
class LedgerService {
    async getAccountLedger(userId, accountId, from, to) {
        // ==================================================
        // 1. VALIDATE IDS
        // ==================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(accountId)) {
            throw new Error("Invalid account ID");
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const accountObjectId = new mongoose_1.default.Types.ObjectId(accountId);
        // ==================================================
        // 2. GET ACCOUNT
        // ==================================================
        const account = await account_model_1.default.findOne({
            _id: accountObjectId,
            userId: userObjectId,
            isActive: true,
        });
        if (!account) {
            throw new Error("Account not found");
        }
        // ==================================================
        // 3. CALCULATE OPENING BALANCE
        // ==================================================
        let openingBalance = 0;
        if (from) {
            const openingLines = await ledger_repository_1.default.findOpeningBalanceLines(userObjectId, accountObjectId, from);
            for (const line of openingLines) {
                const debit = line.debit ?? 0;
                const credit = line.credit ?? 0;
                if (account.type === "asset" || account.type === "expense") {
                    openingBalance += debit - credit;
                }
                else {
                    openingBalance += credit - debit;
                }
            }
        }
        // ==================================================
        // 4. GET PERIOD ENTRIES
        // ==================================================
        const lines = await ledger_repository_1.default.findByAccountId(userObjectId, accountObjectId, from, to);
        // ==================================================
        // 5. START RUNNING BALANCE
        //    FROM OPENING BALANCE
        // ==================================================
        let balance = openingBalance;
        let totalDebit = 0;
        let totalCredit = 0;
        // ==================================================
        // 6. CREATE LEDGER ENTRIES
        // ==================================================
        const entries = lines
            .sort((a, b) => {
            const dateA = a.journalEntryId.entryDate.getTime();
            const dateB = b.journalEntryId.entryDate.getTime();
            return dateA - dateB;
        })
            .map((line) => {
            const debit = line.debit ?? 0;
            const credit = line.credit ?? 0;
            totalDebit += debit;
            totalCredit += credit;
            // ----------------------------------------------
            // Debit-normal accounts
            // ----------------------------------------------
            if (account.type === "asset" || account.type === "expense") {
                balance += debit - credit;
            }
            // ----------------------------------------------
            // Credit-normal accounts
            // ----------------------------------------------
            else {
                balance += credit - debit;
            }
            const journalEntry = line.journalEntryId;
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
        // 7. RETURN LEDGER
        // ==================================================
        return {
            account: {
                id: account._id,
                name: account.name,
                code: account.code,
                type: account.type,
                normalBalance: account.type === "asset" || account.type === "expense"
                    ? "debit"
                    : "credit",
            },
            period: {
                from: from ?? null,
                to: to ?? null,
            },
            openingBalance,
            entries,
            totalDebit,
            totalCredit,
            closingBalance: balance,
        };
    }
}
exports.default = new LedgerService();
