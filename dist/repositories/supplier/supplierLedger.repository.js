"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
class SupplierLedgerRepository {
    // =====================================================
    // GET SUPPLIER TRANSACTIONS
    // =====================================================
    async findSupplierTransactions(userId, supplierId, from, to) {
        const query = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
            supplierId: new mongoose_1.default.Types.ObjectId(supplierId),
        };
        // ===================================================
        // DATE FILTER
        // ===================================================
        if (from || to) {
            query.transactionDate = {};
            if (from) {
                query.transactionDate.$gte = from;
            }
            if (to) {
                query.transactionDate.$lte = to;
            }
        }
        return await transaction_model_1.default.find(query).sort({
            transactionDate: 1,
            createdAt: 1,
        });
    }
    // =====================================================
    // GET ALL SUPPLIER TRANSACTIONS
    // =====================================================
    async findAllSupplierTransactions(userId, supplierId) {
        return await transaction_model_1.default.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            supplierId: new mongoose_1.default.Types.ObjectId(supplierId),
        }).sort({
            transactionDate: 1,
            createdAt: 1,
        });
    }
}
exports.default = new SupplierLedgerRepository();
