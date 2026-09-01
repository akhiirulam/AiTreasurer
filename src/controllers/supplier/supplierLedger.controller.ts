import { Request, Response } from "express";

import supplierLedgerService from "../../services/supplier/supplierLedger.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

class SupplierLedgerController {
  // =====================================================
  // GET SUPPLIER LEDGER
  // =====================================================

  async getSupplierLedger(req: AuthenticatedRequest, res: Response) {
    try {
      // ==================================================
      // 1. GET LOGGED-IN USER
      // ==================================================

      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // ==================================================
      // 2. GET SUPPLIER ID
      // ==================================================

      const supplierId = String(req.params.supplierId);

      // ==================================================
      // 3. GET DATE PARAMETERS
      // ==================================================

      const { from, to } = req.query;

      // ==================================================
      // 4. VALIDATE QUERY PARAMETERS
      // ==================================================

      if (Array.isArray(from) || Array.isArray(to)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date parameters",
        });
      }

      // ==================================================
      // 5. CONVERT DATES
      // ==================================================

      const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;

      const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined;

      // ==================================================
      // 6. VALIDATE DATES
      // ==================================================

      if (fromDate && isNaN(fromDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid from date",
        });
      }

      if (toDate && isNaN(toDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid to date",
        });
      }

      // ==================================================
      // 7. VALIDATE DATE RANGE
      // ==================================================

      if (fromDate && toDate && fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message: "From date cannot be later than to date",
        });
      }

      // ==================================================
      // 8. GET LEDGER
      // ==================================================

      const result = await supplierLedgerService.getSupplierLedger(
        userId,
        supplierId,
        fromDate,
        toDate,
      );

      // ==================================================
      // 9. RESPONSE
      // ==================================================

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Get supplier ledger error:", error);

      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to fetch supplier ledger",
      });
    }
  }
}

export default new SupplierLedgerController();
