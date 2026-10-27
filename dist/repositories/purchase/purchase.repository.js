"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
const journalEntry_model_1 = __importDefault(require("../../models/journalEntry.model"));
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const supplier_model_1 = __importDefault(require("../../models/supplier.model"));
class PurchaseRepository {
    /**
     * Find the user's Purchase account.
     */
    async findPurchaseAccount(userId) {
        return await account_model_1.default.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            isActive: true,
            type: "expense",
            subCategory: "purchases",
        }).lean();
    }
    /**
     * Find journal lines belonging to the Purchase account.
     */
    async findPurchaseLines(userId, accountId, from, to) {
        const journalQuery = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
        };
        if (from || to) {
            journalQuery.entryDate = {};
            if (from) {
                journalQuery.entryDate.$gte = from;
            }
            if (to) {
                journalQuery.entryDate.$lte = to;
            }
        }
        const journalEntries = await journalEntry_model_1.default.find(journalQuery)
            .select("_id entryDate description")
            .lean();
        if (journalEntries.length === 0) {
            return [];
        }
        const journalEntryIds = journalEntries.map((entry) => entry._id);
        return await journalEntryLine_model_1.default.find({
            journalEntryId: { $in: journalEntryIds },
            accountId,
            debit: { $gt: 0 },
        })
            .populate({
            path: "journalEntryId",
            select: "_id transactionId entryDate description",
        })
            .lean();
    }
    /**
     * Find purchase transactions corresponding to journal entries.
     */
    async findTransactions(userId, transactionIds) {
        if (transactionIds.length === 0) {
            return [];
        }
        return await transaction_model_1.default.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            _id: { $in: transactionIds },
            type: "purchase",
        })
            .select("_id supplier supplierId amount description transactionDate paymentStatus paidAmount outstandingAmount")
            .lean();
    }
    /**
     * Find supplier payments.
     *
     * Payments are separate transactions from purchases.
     */
    async findSupplierPayments(userId, supplierIds, from, to) {
        if (supplierIds.length === 0) {
            return [];
        }
        const query = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type: "payment",
            supplierId: {
                $in: supplierIds,
            },
        };
        if (from || to) {
            query.transactionDate = {};
            if (from) {
                query.transactionDate.$gte = from;
            }
            if (to) {
                query.transactionDate.$lte = to;
            }
        }
        return await transaction_model_1.default.find(query)
            .select("_id supplier supplierId amount description transactionDate paymentStatus paidAmount outstandingAmount")
            .sort({
            transactionDate: 1,
            createdAt: 1,
        })
            .lean();
    }
    /**
     * Find suppliers by their IDs.
     */
    async findSuppliersByIds(userId, supplierIds) {
        if (supplierIds.length === 0) {
            return [];
        }
        return await supplier_model_1.default.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            _id: {
                $in: supplierIds,
            },
        })
            .select("_id name phone email")
            .lean();
    }
}
exports.default = new PurchaseRepository();
