"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const customer_repository_1 = __importDefault(require("../../repositories/customer/customer.repository"));
const customerLedger_repository_1 = __importDefault(require("../../repositories/customer/customerLedger.repository"));
class CustomerLedgerService {
    // =====================================================
    // GET CUSTOMER LEDGER
    // =====================================================
    async getCustomerLedger(userId, customerId, from, to) {
        // ===================================================
        // 1. VALIDATE USER ID
        // ===================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        // ===================================================
        // 2. VALIDATE CUSTOMER ID
        // ===================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
            throw new Error("Invalid customer ID");
        }
        // ===================================================
        // 3. VALIDATE DATE RANGE
        // ===================================================
        if (from && to && from > to) {
            throw new Error("From date cannot be later than to date");
        }
        // ===================================================
        // 4. FIND CUSTOMER
        // ===================================================
        const customer = await customer_repository_1.default.findById(customerId);
        if (!customer) {
            throw new Error("Customer not found");
        }
        // ===================================================
        // 5. OWNERSHIP CHECK
        // ===================================================
        if (customer.userId.toString() !== userId) {
            throw new Error("Customer does not belong to this user");
        }
        // ===================================================
        // 6. GET CUSTOMER TRANSACTIONS
        // ===================================================
        const transactions = await customerLedger_repository_1.default.findCustomerTransactions(userId, customerId, from, to);
        // ===================================================
        // 7. TOTALS
        // ===================================================
        let totalSales = 0;
        let totalPayments = 0;
        let outstandingBalance = 0;
        // ===================================================
        // 8. CREATE LEDGER ENTRIES
        // ===================================================
        const entries = transactions.map((transaction) => {
            let debit = 0;
            let credit = 0;
            // =================================================
            // CREDIT SALE
            // =================================================
            //
            // Example:
            //
            // Sold goods ₹10,000 on credit
            //
            // Dr Accounts Receivable   ₹10,000
            // Cr Sales                  ₹10,000
            //
            // Customer owes us ₹10,000.
            //
            // Therefore customer ledger gets a DEBIT.
            // =================================================
            if (transaction.type === "sale" && transaction.paymentStatus !== "paid") {
                debit = transaction.amount;
                totalSales += transaction.amount;
                outstandingBalance += transaction.amount;
            }
            // =================================================
            // CUSTOMER PAYMENT
            // =================================================
            //
            // Example:
            //
            // Received ₹4,000 from customer
            //
            // Dr Cash                   ₹4,000
            // Cr Accounts Receivable    ₹4,000
            //
            // Customer outstanding
            // decreases by ₹4,000.
            // =================================================
            if (transaction.type === "payment") {
                credit = transaction.amount;
                totalPayments += transaction.amount;
                outstandingBalance -= transaction.amount;
            }
            // =================================================
            // PAID SALE
            // =================================================
            //
            // If the customer paid immediately, there is no
            // outstanding receivable.
            // =================================================
            if (transaction.type === "sale" && transaction.paymentStatus === "paid") {
                totalSales += transaction.amount;
            }
            return {
                transactionId: transaction._id.toString(),
                date: transaction.transactionDate,
                description: transaction.description,
                type: transaction.type,
                debit,
                credit,
                balance: outstandingBalance,
            };
        });
        // ===================================================
        // 9. FINAL BALANCE
        // ===================================================
        const finalOutstandingBalance = Math.max(outstandingBalance, 0);
        // ===================================================
        // 10. RETURN LEDGER
        // ===================================================
        return {
            customer: {
                id: customer._id.toString(),
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                isActive: customer.isActive,
            },
            totalSales,
            totalPayments,
            outstandingBalance: finalOutstandingBalance,
            entries,
        };
    }
}
exports.default = new CustomerLedgerService();
