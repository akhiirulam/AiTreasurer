"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_service_1 = __importDefault(require("../../services/customer/customer.service"));
class CustomerController {
    // =====================================================
    // CREATE CUSTOMER
    // =====================================================
    async createCustomer(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { name, phone, email, address } = req.body;
            const customer = await customer_service_1.default.createCustomer(userId, name, phone, email, address);
            return res.status(201).json({
                success: true,
                message: "Customer created successfully",
                data: customer,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to create customer",
            });
        }
    }
    // =====================================================
    // GET ALL CUSTOMERS
    // =====================================================
    async getCustomers(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const customers = await customer_service_1.default.getCustomers(userId);
            return res.status(200).json({
                success: true,
                data: customers,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to fetch customers",
            });
        }
    }
    // =====================================================
    // GET CUSTOMER BY PHONE
    // =====================================================
    async getCustomerByPhone(req, res) {
        try {
            const userId = req.userId;
            const phone = String(req.params.phone);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const customer = await customer_service_1.default.getCustomerByPhone(userId, phone);
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found",
                });
            }
            return res.status(200).json({
                success: true,
                data: customer,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to fetch customer",
            });
        }
    }
    // =====================================================
    // GET CUSTOMER BY ID
    // =====================================================
    async getCustomerById(req, res) {
        try {
            const userId = req.userId;
            const customerId = String(req.params.customerId);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const customer = await customer_service_1.default.getCustomerById(userId, customerId);
            return res.status(200).json({
                success: true,
                data: customer,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to fetch customer",
            });
        }
    }
    // =====================================================
    // UPDATE CUSTOMER
    // =====================================================
    async updateCustomer(req, res) {
        try {
            const userId = req.userId;
            const customerId = String(req.params.customerId);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const customer = await customer_service_1.default.updateCustomer(userId, customerId, req.body);
            return res.status(200).json({
                success: true,
                message: "Customer updated successfully",
                data: customer,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to update customer",
            });
        }
    }
    // =====================================================
    // DEACTIVATE CUSTOMER
    // =====================================================
    async deleteCustomer(req, res) {
        try {
            const userId = req.userId;
            const customerId = String(req.params.customerId);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const customer = await customer_service_1.default.deactivateCustomer(userId, customerId);
            return res.status(200).json({
                success: true,
                message: "Customer deactivated successfully",
                data: customer,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to deactivate customer",
            });
        }
    }
}
exports.default = new CustomerController();
