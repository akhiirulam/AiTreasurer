import mongoose from "mongoose";
import Supplier from "../../models/supplier.model";

class SupplierRepository {
  /**
   * Find a supplier by name for a specific user/shop.
   */
  async findByName(userId: string, name: string) {
    return await Supplier.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      name: name.trim(),
    });
  }

  /**
   * Find an existing supplier or create a new one.
   */
  async findOrCreate(userId: string, name: string) {
    const normalizedName = name.trim();

    let supplier = await this.findByName(userId, normalizedName);

    if (supplier) {
      return supplier;
    }

    supplier = await Supplier.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: normalizedName,
    });

    return supplier;
  }

  /**
   * Create a supplier manually.
   */
  async create(
    userId: string,
    name: string,
    phone?: string | null,
    email?: string | null,
    address?: string | null,
  ) {
    return await Supplier.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: name.trim(),
      phone: phone ?? null,
      email: email ?? null,
      address: address ?? null,
    });
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
   * Delete supplier.
   */
  async delete(supplierId: string) {
    return await Supplier.findByIdAndDelete(supplierId);
  }
}

export default new SupplierRepository();
