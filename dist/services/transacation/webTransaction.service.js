"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_repository_1 = __importDefault(require("../../repositories/transaction/transaction.repository"));
const transactionParser_1 = __importDefault(require("../aiParser/transactionParser"));
const Supplier_repositories_1 = __importDefault(require("../../repositories/supplier/Supplier.repositories"));
const account_service_1 = __importDefault(require("../account/account.service"));
const journalEntry_service_1 = __importDefault(require("../journalEntry/journalEntry.service"));
const customer_service_1 = __importDefault(require("../customer/customer.service"));
class TransactionService {
    async createTransaction(data) {
        const { userId, text, file } = data;
        console.log("Transaction :", text, userId);
        // ==================================================
        // START MONGODB TRANSACTION
        // ==================================================
        const session = await mongoose_1.default.startSession();
        try {
            session.startTransaction();
            // ==================================================
            // 1. PARSE TRANSACTION USING GEMINI
            // ==================================================
            const parsedTransactions = await transactionParser_1.default.parseTransaction({
                text,
                file,
            });
            const transactions = [];
            // ==================================================
            // 2. PROCESS EACH PARSED TRANSACTION
            // ==================================================
            for (const parsedTransaction of parsedTransactions) {
                // ==================================================
                // SUPPLIER
                // ==================================================
                let supplierId = null;
                if (parsedTransaction.supplierName &&
                    ["purchase", "payment"].includes(parsedTransaction.type)) {
                    const supplier = await Supplier_repositories_1.default.findOrCreate(userId, parsedTransaction.supplierName);
                    supplierId = supplier._id;
                }
                // ==================================================
                // CUSTOMER
                // ==================================================
                let customerId = null;
                if (parsedTransaction.customerName) {
                    if (!parsedTransaction.customerPhone) {
                        throw new Error(`Customer phone number is required for ${parsedTransaction.customerName}`);
                    }
                    const customer = await customer_service_1.default.findOrCreateCustomer(userId, parsedTransaction.customerName, parsedTransaction.customerPhone);
                    customerId = customer._id;
                }
                // ==================================================
                // DEBIT ACCOUNT
                // ==================================================
                const debitAccount = await account_service_1.default.getOrCreateAccount(userId, parsedTransaction.debitAccount, parsedTransaction.debitAccountType, parsedTransaction.debitAccountCategory, parsedTransaction.debitAccountSubCategory);
                if (!debitAccount) {
                    throw new Error(`Unable to create debit account: ${parsedTransaction.debitAccount}`);
                }
                // ==================================================
                // CREDIT ACCOUNT
                // ==================================================
                const creditAccount = await account_service_1.default.getOrCreateAccount(userId, parsedTransaction.creditAccount, parsedTransaction.creditAccountType, parsedTransaction.creditAccountCategory, parsedTransaction.creditAccountSubCategory);
                if (!creditAccount) {
                    throw new Error(`Unable to create credit account: ${parsedTransaction.creditAccount}`);
                }
                // ==================================================
                // CREATE TRANSACTION
                // ==================================================
                const transaction = await transaction_repository_1.default.create({
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    rawText: text,
                    type: parsedTransaction.type,
                    amount: parsedTransaction.amount,
                    description: parsedTransaction.description,
                    category: parsedTransaction.category,
                    customer: parsedTransaction.customerName,
                    phone: parsedTransaction.customerPhone,
                    customerId,
                    supplierId,
                    transactionDate: new Date(parsedTransaction.transactionDate),
                    paymentStatus: parsedTransaction.paymentStatus,
                    paidAmount: parsedTransaction.paidAmount,
                    outstandingAmount: parsedTransaction.outstandingAmount,
                    debitAccount: debitAccount.name,
                    creditAccount: creditAccount.name,
                    debitAccountId: debitAccount._id,
                    creditAccountId: creditAccount._id,
                }, session);
                // ==================================================
                // CREATE JOURNAL ENTRY
                // ==================================================
                await journalEntry_service_1.default.createJournalEntry({
                    userId,
                    transactionId: transaction._id,
                    entryDate: transaction.transactionDate,
                    description: transaction.description,
                    debitAccountId: transaction.debitAccountId,
                    creditAccountId: transaction.creditAccountId,
                    amount: transaction.amount,
                    session,
                });
                // ==================================================
                // ADD TO RESULT
                // ==================================================
                transactions.push(transaction);
            }
            // ==================================================
            // COMMIT EVERYTHING
            // ==================================================
            await session.commitTransaction();
            console.log("Transaction + Journal Entry committed successfully");
            return transactions;
        }
        catch (error) {
            // ==================================================
            // ROLLBACK EVERYTHING
            // ==================================================
            await session.abortTransaction();
            console.error("Transaction rolled back:", error);
            throw error;
        }
        finally {
            // ==================================================
            // CLOSE SESSION
            // ==================================================
            await session.endSession();
        }
    }
}
exports.default = new TransactionService();
