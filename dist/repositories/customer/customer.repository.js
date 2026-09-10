"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const customer_model_1 = __importDefault(require("../../models/customer.model"));
class CustomerRepository {
    /**
     * Find customer by phone number
     * for a specific user/shop.
     */
    async findByPhone(userId, phone) {
        return await customer_model_1.default.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            phone,
        });
    }
    /**
     * Find customer by ID.
     */
    async findById(customerId) {
        return await customer_model_1.default.findById(customerId);
    }
    /**
     * Find an existing customer by phone.
     *
     * If the customer does not exist, create a new one.
     *
     * If the customer exists but is inactive,
     * reactivate the customer.
     */
    async findOrCreate(userId, name, phone) {
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        let customer = await customer_model_1.default.findOne({
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
        customer = await customer_model_1.default.create({
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
    async findAllByUser(userId) {
        return await customer_model_1.default.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
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
    async create(userId, name, phone, email, address) {
        return await customer_model_1.default.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
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
    async update(customerId, data) {
        return await customer_model_1.default.findByIdAndUpdate(customerId, data, {
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
    async deactivate(customerId) {
        return await customer_model_1.default.findByIdAndUpdate(customerId, {
            isActive: false,
        }, {
            new: true,
            runValidators: true,
        });
    }
}
exports.default = new CustomerRepository();
