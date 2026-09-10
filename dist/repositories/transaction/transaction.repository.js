"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
class TransactionRepository {
    async create(data, session) {
        const transaction = new transaction_model_1.default(data);
        await transaction.save({
            session,
        });
        return transaction;
    }
    async findById(transactionId) {
        return await transaction_model_1.default.findById(transactionId);
    }
    async findByUserId(userId) {
        return await transaction_model_1.default.find({
            userId,
        }).sort({ transactionDate: -1 });
    }
    // =====================================================
    // FIND SALES
    // =====================================================
    async findSalesByUser(userId, filters) {
        const query = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type: "sale",
        };
        // ===================================================
        // PAYMENT STATUS
        // ===================================================
        if (filters?.paymentStatus) {
            query.paymentStatus = filters.paymentStatus;
        }
        // ===================================================
        // DATE RANGE
        // ===================================================
        if (filters?.from || filters?.to) {
            query.transactionDate = {};
            if (filters.from) {
                query.transactionDate.$gte = filters.from;
            }
            if (filters.to) {
                query.transactionDate.$lte = filters.to;
            }
        }
        // ===================================================
        // SEARCH
        // ===================================================
        if (filters?.search?.trim()) {
            const search = filters.search.trim();
            query.$or = [
                {
                    description: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    customer: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    category: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }
        // ===================================================
        // RETURN
        // ===================================================
        return await transaction_model_1.default.find(query).sort({
            transactionDate: -1,
            createdAt: -1,
        });
    }
    async updateById(transactionId, transactionData) {
        return await transaction_model_1.default.findByIdAndUpdate(transactionId, transactionData, {
            new: true,
            runValidators: true,
        });
    }
    async deleteById(transactionId) {
        return await transaction_model_1.default.findByIdAndDelete(transactionId);
    }
}
exports.default = new TransactionRepository();
