"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Supplier_repositories_1 = __importDefault(require("../../repositories/supplier/Supplier.repositories"));
class SupplierService {
    // =====================================================
    // FIND OR CREATE SUPPLIER
    // =====================================================
    //
    // Used by TransactionService when Gemini
    // detects a supplier in a purchase/payment.
    //
    // Example:
    //
    // "Bought goods from Raj Traders for ₹5,000"
    //
    // supplierName = "Raj Traders"
    //
    // Existing supplier → return it
    // New supplier      → create it
    //
    async findOrCreateSupplier(userId, name) {
        // ===================================================
        // VALIDATE USER
        // ===================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        // ===================================================
        // VALIDATE SUPPLIER NAME
        // ===================================================
        if (!name || !name.trim()) {
            throw new Error("Supplier name is required");
        }
        // ===================================================
        // FIND OR CREATE
        // ===================================================
        return await Supplier_repositories_1.default.findOrCreate(userId, name.trim());
    }
    // =====================================================
    // GET ALL SUPPLIERS
    // =====================================================
    async getSuppliers(userId) {
        // ===================================================
        // VALIDATE USER
        // ===================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        // ===================================================
        // GET SUPPLIERS
        // ===================================================
        return await Supplier_repositories_1.default.findAllByUser(userId);
    }
    // =====================================================
    // GET SUPPLIER BY ID
    // =====================================================
    async getSupplierById(userId, supplierId) {
        // ===================================================
        // VALIDATE USER
        // ===================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        // ===================================================
        // VALIDATE SUPPLIER ID
        // ===================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(supplierId)) {
            throw new Error("Invalid supplier ID");
        }
        // ===================================================
        // FIND SUPPLIER
        // ===================================================
        const supplier = await Supplier_repositories_1.default.findById(supplierId);
        if (!supplier) {
            throw new Error("Supplier not found");
        }
        // ===================================================
        // OWNERSHIP CHECK
        // ===================================================
        if (supplier.userId.toString() !== userId) {
            throw new Error("Supplier does not belong to this user");
        }
        return supplier;
    }
    // =====================================================
    // UPDATE SUPPLIER
    // =====================================================
    async updateSupplier(userId, supplierId, data) {
        // ===================================================
        // VALIDATE USER
        // ===================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        // ===================================================
        // VALIDATE SUPPLIER ID
        // ===================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(supplierId)) {
            throw new Error("Invalid supplier ID");
        }
        // ===================================================
        // FIND + OWNERSHIP CHECK
        // ===================================================
        const supplier = await Supplier_repositories_1.default.findById(supplierId);
        if (!supplier) {
            throw new Error("Supplier not found");
        }
        if (supplier.userId.toString() !== userId) {
            throw new Error("Supplier does not belong to this user");
        }
        // ===================================================
        // VALIDATE NAME
        // ===================================================
        if (data.name !== undefined) {
            if (!data.name.trim()) {
                throw new Error("Supplier name cannot be empty");
            }
            data.name = data.name.trim();
        }
        // ===================================================
        // NORMALIZE OPTIONAL FIELDS
        // ===================================================
        if (data.phone !== undefined && data.phone !== null) {
            data.phone = data.phone.trim();
            if (!data.phone) {
                data.phone = null;
            }
        }
        if (data.email !== undefined && data.email !== null) {
            data.email = data.email.trim();
            if (!data.email) {
                data.email = null;
            }
        }
        if (data.address !== undefined && data.address !== null) {
            data.address = data.address.trim();
            if (!data.address) {
                data.address = null;
            }
        }
        // ===================================================
        // UPDATE
        // ===================================================
        return await Supplier_repositories_1.default.update(supplierId, data);
    }
    // =====================================================
    // DEACTIVATE SUPPLIER
    // =====================================================
    //
    // We do NOT physically delete suppliers because
    // historical transactions may reference them.
    //
    async deactivateSupplier(userId, supplierId) {
        // ===================================================
        // VALIDATE USER
        // ===================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        // ===================================================
        // VALIDATE SUPPLIER ID
        // ===================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(supplierId)) {
            throw new Error("Invalid supplier ID");
        }
        // ===================================================
        // FIND + OWNERSHIP CHECK
        // ===================================================
        const supplier = await Supplier_repositories_1.default.findById(supplierId);
        if (!supplier) {
            throw new Error("Supplier not found");
        }
        if (supplier.userId.toString() !== userId) {
            throw new Error("Supplier does not belong to this user");
        }
        // ===================================================
        // ALREADY INACTIVE
        // ===================================================
        if (!supplier.isActive) {
            return supplier;
        }
        // ===================================================
        // DEACTIVATE
        // ===================================================
        return await Supplier_repositories_1.default.deactivate(supplierId);
    }
}
exports.default = new SupplierService();
