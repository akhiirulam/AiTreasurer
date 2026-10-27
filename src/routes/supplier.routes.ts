import { Router } from "express";

import supplierController from "../controllers/supplier/supplier.controller";
import authenticate from "../middleware/auth.middleware";
import supplierLedgerController from "../controllers/supplier/supplierLedger.controller";

const supplierRouter = Router();

// =====================================================
// GET ALL SUPPLIERS
// =====================================================

supplierRouter.get("/", authenticate, supplierController.getSuppliers);

// =====================================================
// GET SUPPLIER BY ID
// =====================================================

supplierRouter.get(
  "/:supplierId",
  authenticate,
  supplierController.getSupplierById,
);

// =====================================================
// UPDATE SUPPLIER
// =====================================================

supplierRouter.put(
  "/:supplierId",
  authenticate,
  supplierController.updateSupplier,
);

// =====================================================
// DEACTIVATE SUPPLIER
// =====================================================

supplierRouter.delete(
  "/:supplierId",
  authenticate,
  supplierController.deleteSupplier,
);

// =====================================================
// GET SUPPLIER LEDGER
// =====================================================

supplierRouter.get(
  "/:supplierId/ledger",
  authenticate,
  supplierLedgerController.getSupplierLedger,
);

export default supplierRouter;
