"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supplier_controller_1 = __importDefault(require("../controllers/supplier/supplier.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const supplierLedger_controller_1 = __importDefault(require("../controllers/supplier/supplierLedger.controller"));
const supplierRouter = (0, express_1.Router)();
// =====================================================
// GET ALL SUPPLIERS
// =====================================================
supplierRouter.get("/", auth_middleware_1.default, supplier_controller_1.default.getSuppliers);
// =====================================================
// GET SUPPLIER BY ID
// =====================================================
supplierRouter.get("/:supplierId", auth_middleware_1.default, supplier_controller_1.default.getSupplierById);
// =====================================================
// UPDATE SUPPLIER
// =====================================================
supplierRouter.put("/:supplierId", auth_middleware_1.default, supplier_controller_1.default.updateSupplier);
// =====================================================
// DEACTIVATE SUPPLIER
// =====================================================
supplierRouter.delete("/:supplierId", auth_middleware_1.default, supplier_controller_1.default.deleteSupplier);
// =====================================================
// GET SUPPLIER LEDGER
// =====================================================
supplierRouter.get("/:supplierId/ledger", auth_middleware_1.default, supplierLedger_controller_1.default.getSupplierLedger);
exports.default = supplierRouter;
