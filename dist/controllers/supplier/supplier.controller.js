"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supplier_service_1 = __importDefault(require("../../services/supplier/supplier.service"));
class SupplierController {
    // =====================================================
    // GET ALL SUPPLIERS
    // =====================================================
    async getSuppliers(req, res) {
        try {
            const userId = req.userId;
            // ==================================================
            // VALIDATE AUTHENTICATION
            // ==================================================
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            // ==================================================
            // GET SUPPLIERS
            // ==================================================
            const suppliers = await supplier_service_1.default.getSuppliers(userId);
            return res.status(200).json({
                success: true,
                data: suppliers,
            });
        }
        catch (error) {
            console.error("Get suppliers error:", error);
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to fetch suppliers",
            });
        }
    }
    // =====================================================
    // GET SUPPLIER BY ID
    // =====================================================
    async getSupplierById(req, res) {
        try {
            const userId = req.userId;
            const supplierId = String(req.params.supplierId);
            // ==================================================
            // VALIDATE AUTHENTICATION
            // ==================================================
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            // ==================================================
            // GET SUPPLIER
            // ==================================================
            const supplier = await supplier_service_1.default.getSupplierById(userId, supplierId);
            return res.status(200).json({
                success: true,
                data: supplier,
            });
        }
        catch (error) {
            console.error("Get supplier error:", error);
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to fetch supplier",
            });
        }
    }
    // =====================================================
    // UPDATE SUPPLIER
    // =====================================================
    async updateSupplier(req, res) {
        try {
            const userId = req.userId;
            const supplierId = String(req.params.supplierId);
            // ==================================================
            // VALIDATE AUTHENTICATION
            // ==================================================
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            // ==================================================
            // UPDATE SUPPLIER
            // ==================================================
            const supplier = await supplier_service_1.default.updateSupplier(userId, supplierId, req.body);
            return res.status(200).json({
                success: true,
                message: "Supplier updated successfully",
                data: supplier,
            });
        }
        catch (error) {
            console.error("Update supplier error:", error);
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to update supplier",
            });
        }
    }
    // =====================================================
    // DEACTIVATE SUPPLIER
    // =====================================================
    async deleteSupplier(req, res) {
        try {
            const userId = req.userId;
            const supplierId = String(req.params.supplierId);
            // ==================================================
            // VALIDATE AUTHENTICATION
            // ==================================================
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            // ==================================================
            // DEACTIVATE SUPPLIER
            // ==================================================
            const supplier = await supplier_service_1.default.deactivateSupplier(userId, supplierId);
            return res.status(200).json({
                success: true,
                message: "Supplier deactivated successfully",
                data: supplier,
            });
        }
        catch (error) {
            console.error("Deactivate supplier error:", error);
            return res.status(400).json({
                success: false,
                message: error?.message || "Failed to deactivate supplier",
            });
        }
    }
}
exports.default = new SupplierController();
