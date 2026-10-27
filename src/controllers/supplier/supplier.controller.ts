import { Response } from "express";

import supplierService from "../../services/supplier/supplier.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

class SupplierController {
  // =====================================================
  // GET ALL SUPPLIERS
  // =====================================================

  async getSuppliers(req: AuthenticatedRequest, res: Response) {
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

      const suppliers = await supplierService.getSuppliers(userId);

      return res.status(200).json({
        success: true,
        data: suppliers,
      });
    } catch (error: any) {
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

  async getSupplierById(req: AuthenticatedRequest, res: Response) {
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

      const supplier = await supplierService.getSupplierById(
        userId,
        supplierId,
      );

      return res.status(200).json({
        success: true,
        data: supplier,
      });
    } catch (error: any) {
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

  async updateSupplier(req: AuthenticatedRequest, res: Response) {
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

      const supplier = await supplierService.updateSupplier(
        userId,
        supplierId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Supplier updated successfully",
        data: supplier,
      });
    } catch (error: any) {
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

  async deleteSupplier(req: AuthenticatedRequest, res: Response) {
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

      const supplier = await supplierService.deactivateSupplier(
        userId,
        supplierId,
      );

      return res.status(200).json({
        success: true,
        message: "Supplier deactivated successfully",
        data: supplier,
      });
    } catch (error: any) {
      console.error("Deactivate supplier error:", error);

      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to deactivate supplier",
      });
    }
  }
}

export default new SupplierController();
