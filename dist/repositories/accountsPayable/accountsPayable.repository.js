"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const account_model_1 = __importDefault(require("../../models/account.model"));
const journalEntry_model_1 = __importDefault(require("../../models/journalEntry.model"));
const journalEntryLine_model_1 = __importDefault(require("../../models/journalEntryLine.model"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
const supplier_model_1 = __importDefault(require("../../models/supplier.model"));
class AccountsPayableRepository {
    /**
     * Find the user's Accounts Payable account.
     *
     * The account is identified by its classification,
     * not by a hard-coded account ID.
     */
    async findPayableAccount(userId) {
        return await account_model_1.default.findOne({
            userId,
            isActive: true,
            type: "liability",
            subCategory: "payables",
        });
    }
    /**
     * Get journal lines belonging to
     * Accounts Payable.
     */
    async findPayableLines(userId, accountId, from, to) {
        const dateFilter = {
            userId,
        };
        if (from || to) {
            dateFilter.entryDate = {};
            if (from) {
                dateFilter.entryDate.$gte = from;
            }
            if (to) {
                dateFilter.entryDate.$lte = to;
            }
        }
        const journalEntries = await journalEntry_model_1.default.find(dateFilter).select("_id");
        const journalEntryIds = journalEntries.map((entry) => entry._id);
        if (journalEntryIds.length === 0) {
            return [];
        }
        return await journalEntryLine_model_1.default.find({
            journalEntryId: {
                $in: journalEntryIds,
            },
            accountId,
        })
            .populate({
            path: "journalEntryId",
            select: "entryDate transactionId description",
        })
            .sort({
            createdAt: 1,
        });
    }
    /**
     * Get transactions associated with
     * Accounts Payable journal entries.
     *
     * Transaction stores supplierId.
     */
    async findTransactions(userId, transactionIds) {
        if (transactionIds.length === 0) {
            return [];
        }
        return await transaction_model_1.default.find({
            userId,
            _id: {
                $in: transactionIds,
            },
        }).select("_id supplierId type amount paidAmount outstandingAmount");
    }
    /**
     * Get suppliers using supplier IDs
     * stored inside transactions.
     */
    async findSuppliers(supplierIds) {
        if (supplierIds.length === 0) {
            return [];
        }
        return await supplier_model_1.default.find({
            _id: {
                $in: supplierIds,
            },
        }).select("_id name");
    }
}
exports.default = new AccountsPayableRepository();
