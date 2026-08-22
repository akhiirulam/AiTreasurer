import { Request, Response, NextFunction } from "express";

import profitLossService from "../../services/profitLoss/profitLoss.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

class ProfitLossController {
  async getProfitLoss(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.userId;
      const { from, to } = req.query;

      // ==========================================
      // VALIDATE USER ID
      // ==========================================

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      if (Array.isArray(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // ==========================================
      // VALIDATE DATES
      // ==========================================

      if (Array.isArray(from) || Array.isArray(to)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date parameters",
        });
      }

      const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;

      const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined;

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
      // VALIDATE DATE RANGE
      // ==========================================

      if (fromDate && toDate && fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message: "From date cannot be later than to date",
        });
      }

      // ==========================================
      // GET PROFIT & LOSS
      // ==========================================

      const result = await profitLossService.getProfitLoss(
        userId,
        fromDate,
        toDate,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProfitLossController();
