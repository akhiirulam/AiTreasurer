import { Response } from "express";

import customerLedgerService from "../../services/customer/customerLedger.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

class CustomerLedgerController {
  // =====================================================
  // GET CUSTOMER LEDGER
  // =====================================================

  async getCustomerLedger(req: AuthenticatedRequest, res: Response) {
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
      // 2. GET CUSTOMER ID
      // ==================================================

      const customerId = String(req.params.customerId);

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: "Customer ID is required",
        });
      }

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
      // 6. VALIDATE FROM DATE
      // ==================================================

      if (fromDate && isNaN(fromDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid from date",
        });
      }

      // ==================================================
      // 7. VALIDATE TO DATE
      // ==================================================

      if (toDate && isNaN(toDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid to date",
        });
      }

      // ==================================================
      // 8. VALIDATE DATE RANGE
      // ==================================================

      if (fromDate && toDate && fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message: "From date cannot be later than to date",
        });
      }

      // ==================================================
      // 9. GET CUSTOMER LEDGER
      // ==================================================

      const result = await customerLedgerService.getCustomerLedger(
        userId,
        customerId,
        fromDate,
        toDate,
      );

      // ==================================================
      // 10. RESPONSE
      // ==================================================

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Get customer ledger error:", error);

      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to fetch customer ledger",
      });
    }
  }
}

export default new CustomerLedgerController();
