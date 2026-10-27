"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reports_repository_1 = __importDefault(require("../../repositories/reports/reports.repository"));
class ReportsService {
    /**
     * Get financial report for one user.
     *
     * Includes:
     * - Sales
     * - Purchases
     * - Other income
     * - Other expenses
     * - Total income
     * - Total expenses
     * - Net profit
     * - Receivables
     * - Payables
     */
    async getReport(userId, from, to) {
        // ==================================================
        // 1. Validate user ID
        // ==================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        // ==================================================
        // 2. Get transactions
        // ==================================================
        const transactions = await reports_repository_1.default.findTransactions(userId, from, to);
        // ==================================================
        // 3. Initialize totals
        // ==================================================
        let totalSales = 0;
        let totalPurchases = 0;
        let otherIncome = 0;
        let otherExpenses = 0;
        // ==================================================
        // 4. Separate sales, purchases, income and expenses
        // ==================================================
        const sales = [];
        const purchases = [];
        for (const transaction of transactions) {
            const amount = Number(transaction.amount || 0);
            switch (transaction.type) {
                case "sale":
                    totalSales += amount;
                    sales.push({
                        ...transaction,
                        reportAmount: amount,
                    });
                    break;
                case "purchase":
                    totalPurchases += amount;
                    purchases.push({
                        ...transaction,
                        reportAmount: amount,
                    });
                    break;
                case "income":
                    otherIncome += amount;
                    break;
                case "expense":
                    otherExpenses += amount;
                    break;
                default:
                    // payment and capital transactions
                    // are not directly income or expense.
                    break;
            }
        }
        // ==================================================
        // 5. Calculate total income
        // ==================================================
        const totalIncome = totalSales + otherIncome;
        // ==================================================
        // 6. Calculate total expenses
        // ==================================================
        const totalExpenses = totalPurchases + otherExpenses;
        // ==================================================
        // 7. Calculate net profit
        // ==================================================
        const netProfit = totalIncome - totalExpenses;
        // ==================================================
        // 8. Calculate customer receivables
        // ==================================================
        const customerIds = [
            ...new Set(sales
                .map((sale) => (sale.customerId ? sale.customerId.toString() : null))
                .filter(Boolean)),
        ];
        const customerPayments = transactions.filter((transaction) => transaction.type === "payment" && transaction.customerId);
        let totalReceivables = 0;
        // Group sales by customer
        const salesByCustomer = new Map();
        for (const sale of sales) {
            if (!sale.customerId) {
                continue;
            }
            const customerId = sale.customerId.toString();
            if (!salesByCustomer.has(customerId)) {
                salesByCustomer.set(customerId, []);
            }
            salesByCustomer.get(customerId).push({
                ...sale,
                paidAmount: 0,
                outstandingAmount: sale.reportAmount,
            });
        }
        // Apply customer payments FIFO
        for (const payment of customerPayments) {
            if (!payment.customerId) {
                continue;
            }
            const customerId = payment.customerId.toString();
            const customerSales = salesByCustomer.get(customerId);
            if (!customerSales) {
                continue;
            }
            let remainingPayment = Number(payment.amount || 0);
            for (const sale of customerSales) {
                if (remainingPayment <= 0) {
                    break;
                }
                if (sale.outstandingAmount <= 0) {
                    continue;
                }
                const allocation = Math.min(remainingPayment, sale.outstandingAmount);
                sale.paidAmount += allocation;
                sale.outstandingAmount -= allocation;
                remainingPayment -= allocation;
            }
        }
        for (const customerSales of salesByCustomer.values()) {
            for (const sale of customerSales) {
                totalReceivables += sale.outstandingAmount;
            }
        }
        // ==================================================
        // 9. Calculate supplier payables
        // ==================================================
        const supplierIds = [
            ...new Set(purchases
                .map((purchase) => purchase.supplierId ? purchase.supplierId.toString() : null)
                .filter(Boolean)),
        ];
        const supplierPayments = transactions.filter((transaction) => transaction.type === "payment" && transaction.supplierId);
        let totalPayables = 0;
        // Group purchases by supplier
        const purchasesBySupplier = new Map();
        for (const purchase of purchases) {
            if (!purchase.supplierId) {
                continue;
            }
            const supplierId = purchase.supplierId.toString();
            if (!purchasesBySupplier.has(supplierId)) {
                purchasesBySupplier.set(supplierId, []);
            }
            purchasesBySupplier.get(supplierId).push({
                ...purchase,
                paidAmount: 0,
                outstandingAmount: purchase.reportAmount,
            });
        }
        // Apply supplier payments FIFO
        for (const payment of supplierPayments) {
            if (!payment.supplierId) {
                continue;
            }
            const supplierId = payment.supplierId.toString();
            const supplierPurchases = purchasesBySupplier.get(supplierId);
            if (!supplierPurchases) {
                continue;
            }
            let remainingPayment = Number(payment.amount || 0);
            for (const purchase of supplierPurchases) {
                if (remainingPayment <= 0) {
                    break;
                }
                if (purchase.outstandingAmount <= 0) {
                    continue;
                }
                const allocation = Math.min(remainingPayment, purchase.outstandingAmount);
                purchase.paidAmount += allocation;
                purchase.outstandingAmount -= allocation;
                remainingPayment -= allocation;
            }
        }
        for (const supplierPurchases of purchasesBySupplier.values()) {
            for (const purchase of supplierPurchases) {
                totalPayables += purchase.outstandingAmount;
            }
        }
        // ==================================================
        // 10. Return report
        // ==================================================
        return {
            period: {
                from: from ?? null,
                to: to ?? null,
            },
            summary: {
                totalSales,
                totalPurchases,
                otherIncome,
                otherExpenses,
                totalIncome,
                totalExpenses,
                netProfit,
                totalReceivables,
                totalPayables,
            },
        };
    }
}
exports.default = new ReportsService();
