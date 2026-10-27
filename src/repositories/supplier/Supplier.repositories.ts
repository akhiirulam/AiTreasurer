import mongoose from "mongoose";
import Supplier from "../../models/supplier.model";
import Transaction from "../../models/transaction.model";

class SupplierRepository {
  /**
   * Find supplier by name for a specific user/shop.
   */
  async findByName(userId: string, name: string) {
    return await Supplier.findOne({
      userId: new mongoose.Types.ObjectId(userId),
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
  async findOrCreate(userId: string, name: string) {
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

    supplier = await Supplier.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: normalizedName,
      isActive: true,
    });

    return supplier;
  }

  /**
   * Find supplier by ID.
   */
  async findById(supplierId: string) {
    return await Supplier.findById(supplierId);
  }

  /**
   * Get all suppliers belonging to a user/shop.
   */
  async findAllByUser(userId: string) {
    return await Supplier.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({
      name: 1,
    });
  }

  /**
   * Update supplier details.
   */
  async update(
    supplierId: string,
    data: {
      name?: string;
      phone?: string | null;
      email?: string | null;
      address?: string | null;
      isActive?: boolean;
    },
  ) {
    if (data.name) {
      data.name = data.name.trim();
    }

    return await Supplier.findByIdAndUpdate(supplierId, data, {
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
  async deactivate(supplierId: string) {
    return await Supplier.findByIdAndUpdate(
      supplierId,
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
  /**
   * Find supplier transactions are linked to.
   */
  async findTransactionsBySupplier(supplierId: string) {
    return await Transaction.find({
      supplierId: new mongoose.Types.ObjectId(supplierId),
    }).sort({
      transactionDate: 1,
    });
  }
}

export default new SupplierRepository();
