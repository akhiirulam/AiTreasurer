"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const accountsPayable_repository_1 = __importDefault(require("../../repositories/accountsPayable/accountsPayable.repository"));
class AccountsPayableService {
    async getAccountsPayable(userId, from, to) {
        // ==========================================
        // 1. VALIDATE USER ID
        // ==========================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        // ==========================================
        // 2. FIND ACCOUNTS PAYABLE ACCOUNT
        // ==========================================
        const payableAccount = await accountsPayable_repository_1.default.findPayableAccount(userObjectId);
        if (!payableAccount) {
            return {
                period: {
                    from: from ?? null,
                    to: to ?? null,
                },
                suppliers: [],
                totalCreditPurchases: 0,
                totalPayments: 0,
                totalOutstanding: 0,
            };
        }
        // ==========================================
        // 3. GET PAYABLE JOURNAL LINES
        // ==========================================
        const lines = await accountsPayable_repository_1.default.findPayableLines(userObjectId, payableAccount._id, from, to);
        // ==========================================
        // 4. GET TRANSACTION IDs
        // ==========================================
        const transactionIds = lines.map((line) => {
            const journalEntry = line.journalEntryId;
            return journalEntry.transactionId;
        });
        // ==========================================
        // 5. GET TRANSACTIONS
        // ==========================================
        const transactions = await accountsPayable_repository_1.default.findTransactions(userObjectId, transactionIds);
        const transactionMap = new Map();
        for (const transaction of transactions) {
            transactionMap.set(transaction._id.toString(), transaction);
        }
        // ==========================================
        // 6. GET SUPPLIER IDs
        // ==========================================
        const supplierIds = transactions
            .map((transaction) => transaction.supplierId)
            .filter(Boolean)
            .map((supplierId) => new mongoose_1.default.Types.ObjectId(supplierId));
        // ==========================================
        // 7. GET SUPPLIERS
        // ==========================================
        const suppliers = await accountsPayable_repository_1.default.findSuppliers(supplierIds);
        const supplierMap = new Map();
        for (const supplier of suppliers) {
            supplierMap.set(supplier._id.toString(), supplier);
        }
        // ==========================================
        // 8. GROUP BY SUPPLIER
        // ==========================================
        const supplierMapResult = new Map();
        for (const line of lines) {
            const journalEntry = line.journalEntryId;
            const transaction = transactionMap.get(journalEntry.transactionId.toString());
            if (!transaction) {
                continue;
            }
            // ------------------------------------------
            // FIND SUPPLIER
            // ------------------------------------------
            const supplierRecord = transaction.supplierId
                ? supplierMap.get(transaction.supplierId.toString())
                : null;
            const supplier = supplierRecord?.name || "Unknown Supplier";
            // ------------------------------------------
            // CREATE SUPPLIER ENTRY
            // ------------------------------------------
            if (!supplierMapResult.has(supplier)) {
                supplierMapResult.set(supplier, {
                    supplier,
                    creditPurchases: 0,
                    payments: 0,
                    outstanding: 0,
                });
            }
            const supplierData = supplierMapResult.get(supplier);
            const debit = line.debit ?? 0;
            const credit = line.credit ?? 0;
            /**
             * Accounts Payable is a
             * credit-normal liability.
             *
             * Credit → payable increases
             * Debit  → payable decreases
             */
            if (credit > 0) {
                supplierData.creditPurchases += credit;
            }
            if (debit > 0) {
                supplierData.payments += debit;
            }
            supplierData.outstanding =
                supplierData.creditPurchases - supplierData.payments;
        }
        // ==========================================
        // 9. CREATE SUPPLIER RESULT
        // ==========================================
        const supplierResults = Array.from(supplierMapResult.values());
        // ==========================================
        // 10. TOTALS
        // ==========================================
        const totalCreditPurchases = supplierResults.reduce((total, supplier) => total + supplier.creditPurchases, 0);
        const totalPayments = supplierResults.reduce((total, supplier) => total + supplier.payments, 0);
        const totalOutstanding = supplierResults.reduce((total, supplier) => total + supplier.outstanding, 0);
        // ==========================================
        // 11. RETURN REPORT
        // ==========================================
        return {
            period: {
                from: from ?? null,
                to: to ?? null,
            },
            account: {
                id: payableAccount._id,
                name: payableAccount.name,
                code: payableAccount.code,
            },
            suppliers: supplierResults,
            totalCreditPurchases,
            totalPayments,
            totalOutstanding,
        };
    }
}
exports.default = new AccountsPayableService();
