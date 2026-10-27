import mongoose from "mongoose";

import supplierRepository from "../../repositories/supplier/Supplier.repositories";

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

  async findOrCreateSupplier(userId: string, name: string) {
    // ===================================================
    // VALIDATE USER
    // ===================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
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

    return await supplierRepository.findOrCreate(userId, name.trim());
  }

  // =====================================================
  // GET ALL SUPPLIERS
  // =====================================================

  async getSuppliers(userId: string) {
    // ===================================================
    // VALIDATE USER
    // ===================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // ===================================================
    // GET SUPPLIERS
    // ===================================================

    return await supplierRepository.findAllByUser(userId);
  }

  // =====================================================
  // GET SUPPLIER BY ID
  // =====================================================

  async getSupplierById(userId: string, supplierId: string) {
    // ===================================================
    // VALIDATE USER
    // ===================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // ===================================================
    // VALIDATE SUPPLIER ID
    // ===================================================

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      throw new Error("Invalid supplier ID");
    }

    // ===================================================
    // FIND SUPPLIER
    // ===================================================

    const supplier = await supplierRepository.findById(supplierId);

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

  async updateSupplier(
    userId: string,
    supplierId: string,
    data: {
      name?: string;
      phone?: string | null;
      email?: string | null;
      address?: string | null;
    },
  ) {
    // ===================================================
    // VALIDATE USER
    // ===================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // ===================================================
    // VALIDATE SUPPLIER ID
    // ===================================================

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      throw new Error("Invalid supplier ID");
    }

    // ===================================================
    // FIND + OWNERSHIP CHECK
    // ===================================================

    const supplier = await supplierRepository.findById(supplierId);

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

    return await supplierRepository.update(supplierId, data);
  }

  // =====================================================
  // DEACTIVATE SUPPLIER
  // =====================================================
  //
  // We do NOT physically delete suppliers because
  // historical transactions may reference them.
  //

  async deactivateSupplier(userId: string, supplierId: string) {
    // ===================================================
    // VALIDATE USER
    // ===================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // ===================================================
    // VALIDATE SUPPLIER ID
    // ===================================================

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      throw new Error("Invalid supplier ID");
    }

    // ===================================================
    // FIND + OWNERSHIP CHECK
    // ===================================================

    const supplier = await supplierRepository.findById(supplierId);

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

    return await supplierRepository.deactivate(supplierId);
  }
}

export default new SupplierService();
