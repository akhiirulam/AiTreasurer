import { Router } from "express";

import customerController from "../controllers/customers/customer.controller";
import customerLedgerController from "../controllers/customers/customerLedger.controller";

import authenticate from "../middleware/auth.middleware";

const customerRouter = Router();

// Create customer
customerRouter.post("/", authenticate, customerController.createCustomer);

// Get all customers
customerRouter.get("/", authenticate, customerController.getCustomers);

// Get customer by phone
customerRouter.get(
  "/phone/:phone",
  authenticate,
  customerController.getCustomerByPhone,
);

// Get customer by ID
customerRouter.get(
  "/:customerId",
  authenticate,
  customerController.getCustomerById,
);

// Update customer
customerRouter.put(
  "/:customerId",
  authenticate,
  customerController.updateCustomer,
);

// Delete customer
customerRouter.delete(
  "/:customerId",
  authenticate,
  customerController.deleteCustomer,
);

customerRouter.get(
  "/:customerId/ledger",
  authenticate,
  customerLedgerController.getCustomerLedger,
);

export default customerRouter;
