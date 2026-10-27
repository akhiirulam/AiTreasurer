import mongoose from "mongoose";

import Customer from "../../models/customer.model";

class CustomerRepository {
  /**
   * Find customer by phone number
   * for a specific user/shop.
   */
  async findByPhone(userId: string, phone: string) {
    return await Customer.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      phone,
    });
  }

  /**
   * Find customer by ID.
   */
  async findById(customerId: string) {
    return await Customer.findById(customerId);
  }

  /**
   * Find an existing customer by phone.
   *
   * If the customer does not exist, create a new one.
   *
   * If the customer exists but is inactive,
   * reactivate the customer.
   */
  async findOrCreate(userId: string, name: string, phone: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let customer = await Customer.findOne({
      userId: userObjectId,
      phone,
    });

    // ==================================================
    // EXISTING CUSTOMER
    // ==================================================

    if (customer) {
      // Reactivate if the customer was previously
      // deactivated and is now involved in a transaction.
      if (!customer.isActive) {
        customer.isActive = true;

        // Update name in case the user supplied
        // a different spelling/name.
        customer.name = name;

        await customer.save();
      }

      return customer;
    }

    // ==================================================
    // CREATE CUSTOMER
    // ==================================================

    customer = await Customer.create({
      userId: userObjectId,
      name,
      phone,
      isActive: true,
    });

    return customer;
  }

  /**
   * Get all customers belonging to a user/shop.
   */
  async findAllByUser(userId: string) {
    return await Customer.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({
      name: 1,
    });
  }

  /**
   * Create a customer manually.
   *
   * Currently kept for backend flexibility,
   * although the main application flow creates
   * customers through transactions.
   */
  async create(
    userId: string,
    name: string,
    phone: string,
    email?: string | null,
    address?: string | null,
  ) {
    return await Customer.create({
      userId: new mongoose.Types.ObjectId(userId),
      name,
      phone,
      email: email ?? null,
      address: address ?? null,
      isActive: true,
    });
  }

  /**
   * Update customer details.
   */
  async update(
    customerId: string,
    data: {
      name?: string;
      phone?: string;
      email?: string | null;
      address?: string | null;
      isActive?: boolean;
    },
  ) {
    return await Customer.findByIdAndUpdate(customerId, data, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Soft delete / deactivate customer.
   *
   * We NEVER physically delete the customer because
   * existing transactions may reference this customer.
   */
  async deactivate(customerId: string) {
    return await Customer.findByIdAndUpdate(
      customerId,
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
}

export default new CustomerRepository();
