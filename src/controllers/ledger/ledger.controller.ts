import { Request, Response, NextFunction } from "express";

import ledgerService from "../../services/ledger/ledger.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

class LedgerController {
  async getAccountLedger(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const userId = req.userId;
    try {
      const { accountId, from, to } = req.query;

      // ==========================================
      // 1. USER ID
      // ==========================================

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // ==========================================
      // 2. ACCOUNT ID
      // ==========================================

      if (typeof accountId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Account ID is required",
        });
      }

      // ==========================================
      // 3. DATE PARAMETERS
      // ==========================================

      if (Array.isArray(from) || Array.isArray(to)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date parameters",
        });
      }

      // ==========================================
      // 4. CONVERT DATES
      // ==========================================

      const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;

      const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined;

      // ==========================================
      // 5. VALIDATE DATES
      // ==========================================

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

      // ==========================================
      // 6. VALIDATE DATE RANGE
      // ==========================================

      if (fromDate && toDate && fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message: "From date cannot be later than to date",
        });
      }

      // ==========================================
      // 7. GET LEDGER
      // ==========================================

      const result = await ledgerService.getAccountLedger(
        userId,
        accountId,
        fromDate,
        toDate,
      );

      // ==========================================
      // 8. RESPONSE
      // ==========================================

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LedgerController();
