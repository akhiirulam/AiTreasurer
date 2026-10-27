import mongoose from "mongoose";

import customerRepository from "../../repositories/customer/customer.repository";

class CustomerService {
  /**
   * Create a customer manually.
   *
   * Phone number is required because it is
   * the customer identity within a shop.
   */
  async createCustomer(
    userId: string,
    name: string,
    phone: string,
    email?: string | null,
    address?: string | null,
  ) {
    // =====================================================
    // VALIDATE USER
    // =====================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // =====================================================
    // VALIDATE NAME
    // =====================================================

    if (!name || !name.trim()) {
      throw new Error("Customer name is required");
    }

    // =====================================================
    // VALIDATE PHONE
    // =====================================================

    if (!phone || !phone.trim()) {
      throw new Error("Customer phone number is required");
    }

    // =====================================================
    // CHECK EXISTING CUSTOMER
    // =====================================================

    const existingCustomer = await customerRepository.findByPhone(
      userId,
      phone,
    );

    if (existingCustomer) {
      throw new Error(`A customer with phone number ${phone} already exists`);
    }

    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    return await customerRepository.create(userId, name, phone, email, address);
  }

  /**
   * Find an existing customer by phone number.
   */
  async getCustomerByPhone(userId: string, phone: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    if (!phone || !phone.trim()) {
      throw new Error("Customer phone number is required");
    }

    return await customerRepository.findByPhone(userId, phone);
  }

  /**
   * Find or create a customer.
   *
   * This is the method that the AI TransactionService
   * will use.
   *
   * AI provides:
   *
   * customerName
   * customerPhone
   *
   * The phone number identifies the customer.
   */
  async findOrCreateCustomer(userId: string, name: string, phone: string) {
    // =====================================================
    // VALIDATE USER
    // =====================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // =====================================================
    // VALIDATE CUSTOMER NAME
    // =====================================================

    if (!name || !name.trim()) {
      throw new Error("Customer name is required");
    }

    // =====================================================
    // VALIDATE CUSTOMER PHONE
    // =====================================================

    if (!phone || !phone.trim()) {
      throw new Error(`Customer phone number is required for ${name}`);
    }

    // =====================================================
    // FIND OR CREATE
    // =====================================================

    return await customerRepository.findOrCreate(userId, name, phone);
  }

  /**
   * Get one customer by ID.
   */
  async getCustomerById(userId: string, customerId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new Error("Invalid customer ID");
    }

    const customer = await customerRepository.findById(customerId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    // =====================================================
    // OWNERSHIP CHECK
    // =====================================================

    if (customer.userId.toString() !== userId) {
      throw new Error("Customer does not belong to this user");
    }

    return customer;
  }

  /**
   * Get all customers for a user/shop.
   */
  async getCustomers(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    return await customerRepository.findAllByUser(userId);
  }

  /**
   * Update customer.
   */
  async updateCustomer(
    userId: string,
    customerId: string,
    data: {
      name?: string;
      phone?: string;
      email?: string | null;
      address?: string | null;
      isActive?: boolean;
    },
  ) {
    // =====================================================
    // VALIDATE USER
    // =====================================================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // =====================================================
    // VALIDATE CUSTOMER
    // =====================================================

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new Error("Invalid customer ID");
    }

    // =====================================================
    // CHECK EXISTENCE + OWNERSHIP
    // =====================================================

    const customer = await customerRepository.findById(customerId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.userId.toString() !== userId) {
      throw new Error("Customer does not belong to this user");
    }

    // =====================================================
    // VALIDATE UPDATED NAME
    // =====================================================

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new Error("Customer name cannot be empty");
      }
    }

    // =====================================================
    // VALIDATE UPDATED PHONE
    // =====================================================

    if (data.phone !== undefined) {
      if (!data.phone.trim()) {
        throw new Error("Customer phone number cannot be empty");
      }

      // ---------------------------------------------------
      // Make sure another customer doesn't already use
      // the new phone number.
      // ---------------------------------------------------

      const existingCustomer = await customerRepository.findByPhone(
        userId,
        data.phone,
      );

      if (existingCustomer && existingCustomer._id.toString() !== customerId) {
        throw new Error(
          `A customer with phone number ${data.phone} already exists`,
        );
      }
    }

    // =====================================================
    // UPDATE
    // =====================================================

    return await customerRepository.update(customerId, data);
  }

  /**
   * Delete customer.
   */
  async deactivateCustomer(userId: string, customerId: string) {
    const customer = await customerRepository.findById(customerId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.userId.toString() !== userId) {
      throw new Error("Unauthorized customer access");
    }

    if (!customer.isActive) {
      return customer;
    }

    return await customerRepository.deactivate(customerId);
  }
}

export default new CustomerService();
