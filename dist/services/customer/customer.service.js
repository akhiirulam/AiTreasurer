"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const customer_repository_1 = __importDefault(require("../../repositories/customer/customer.repository"));
class CustomerService {
    /**
     * Create a customer manually.
     *
     * Phone number is required because it is
     * the customer identity within a shop.
     */
    async createCustomer(userId, name, phone, email, address) {
        // =====================================================
        // VALIDATE USER
        // =====================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
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
        const existingCustomer = await customer_repository_1.default.findByPhone(userId, phone);
        if (existingCustomer) {
            throw new Error(`A customer with phone number ${phone} already exists`);
        }
        // =====================================================
        // CREATE CUSTOMER
        // =====================================================
        return await customer_repository_1.default.create(userId, name, phone, email, address);
    }
    /**
     * Find an existing customer by phone number.
     */
    async getCustomerByPhone(userId, phone) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        if (!phone || !phone.trim()) {
            throw new Error("Customer phone number is required");
        }
        return await customer_repository_1.default.findByPhone(userId, phone);
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
    async findOrCreateCustomer(userId, name, phone) {
        // =====================================================
        // VALIDATE USER
        // =====================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
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
        return await customer_repository_1.default.findOrCreate(userId, name, phone);
    }
    /**
     * Get one customer by ID.
     */
    async getCustomerById(userId, customerId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
            throw new Error("Invalid customer ID");
        }
        const customer = await customer_repository_1.default.findById(customerId);
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
    async getCustomers(userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        return await customer_repository_1.default.findAllByUser(userId);
    }
    /**
     * Update customer.
     */
    async updateCustomer(userId, customerId, data) {
        // =====================================================
        // VALIDATE USER
        // =====================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        // =====================================================
        // VALIDATE CUSTOMER
        // =====================================================
        if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
            throw new Error("Invalid customer ID");
        }
        // =====================================================
        // CHECK EXISTENCE + OWNERSHIP
        // =====================================================
        const customer = await customer_repository_1.default.findById(customerId);
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
            const existingCustomer = await customer_repository_1.default.findByPhone(userId, data.phone);
            if (existingCustomer && existingCustomer._id.toString() !== customerId) {
                throw new Error(`A customer with phone number ${data.phone} already exists`);
            }
        }
        // =====================================================
        // UPDATE
        // =====================================================
        return await customer_repository_1.default.update(customerId, data);
    }
    /**
     * Delete customer.
     */
    async deactivateCustomer(userId, customerId) {
        const customer = await customer_repository_1.default.findById(customerId);
        if (!customer) {
            throw new Error("Customer not found");
        }
        if (customer.userId.toString() !== userId) {
            throw new Error("Unauthorized customer access");
        }
        if (!customer.isActive) {
            return customer;
        }
        return await customer_repository_1.default.deactivate(customerId);
    }
}
exports.default = new CustomerService();
