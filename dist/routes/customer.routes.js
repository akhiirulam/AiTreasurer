"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = __importDefault(require("../controllers/customers/customer.controller"));
const customerLedger_controller_1 = __importDefault(require("../controllers/customers/customerLedger.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const customerRouter = (0, express_1.Router)();
// Create customer
customerRouter.post("/", auth_middleware_1.default, customer_controller_1.default.createCustomer);
// Get all customers
customerRouter.get("/", auth_middleware_1.default, customer_controller_1.default.getCustomers);
// Get customer by phone
customerRouter.get("/phone/:phone", auth_middleware_1.default, customer_controller_1.default.getCustomerByPhone);
// Get customer by ID
customerRouter.get("/:customerId", auth_middleware_1.default, customer_controller_1.default.getCustomerById);
// Update customer
customerRouter.put("/:customerId", auth_middleware_1.default, customer_controller_1.default.updateCustomer);
// Delete customer
customerRouter.delete("/:customerId", auth_middleware_1.default, customer_controller_1.default.deleteCustomer);
customerRouter.get("/:customerId/ledger", auth_middleware_1.default, customerLedger_controller_1.default.getCustomerLedger);
exports.default = customerRouter;
