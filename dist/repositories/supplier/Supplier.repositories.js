"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const supplier_model_1 = __importDefault(require("../../models/supplier.model"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
class SupplierRepository {
    /**
     * Find supplier by name for a specific user/shop.
     */
    async findByName(userId, name) {
        return await supplier_model_1.default.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            name: {
                $regex: `^${name.trim()}$`,
                $options: "i",
            },
        });
    }
    /**
     * Find existing supplier or create a new one.
     *
     * Used by TransactionService.
     */
    async findOrCreate(userId, name) {
        const normalizedName = name.trim();
        let supplier = await this.findByName(userId, normalizedName);
        // ==================================================
        // EXISTING SUPPLIER
        // ==================================================
        if (supplier) {
            // Reactivate supplier if previously deactivated
            if (!supplier.isActive) {
                supplier.isActive = true;
                await supplier.save();
            }
            return supplier;
        }
        // ==================================================
        // CREATE SUPPLIER
        // ==================================================
        supplier = await supplier_model_1.default.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            name: normalizedName,
            isActive: true,
        });
        return supplier;
    }
    /**
     * Find supplier by ID.
     */
    async findById(supplierId) {
        return await supplier_model_1.default.findById(supplierId);
    }
    /**
     * Get all suppliers belonging to a user/shop.
     */
    async findAllByUser(userId) {
        return await supplier_model_1.default.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
        }).sort({
            name: 1,
        });
    }
    /**
     * Update supplier details.
     */
    async update(supplierId, data) {
        if (data.name) {
            data.name = data.name.trim();
        }
        return await supplier_model_1.default.findByIdAndUpdate(supplierId, data, {
            new: true,
            runValidators: true,
        });
    }
    /**
     * Deactivate supplier.
     *
     * We do NOT physically delete suppliers because
     * historical transactions may reference them.
     */
    async deactivate(supplierId) {
        return await supplier_model_1.default.findByIdAndUpdate(supplierId, {
            isActive: false,
        }, {
            new: true,
            runValidators: true,
        });
    }
    /**
     * Find supplier transactions are linked to.
     */
    async findTransactionsBySupplier(supplierId) {
        return await transaction_model_1.default.find({
            supplierId: new mongoose_1.default.Types.ObjectId(supplierId),
        }).sort({
            transactionDate: 1,
        });
    }
}
exports.default = new SupplierRepository();
