import { Request, Response, NextFunction } from "express";

import salesService from "../../services/sales/sales.service";

class SalesController {
  async getSales(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, from, to } = req.query;

      // ==========================================
      // 1. VALIDATE USER ID
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
      // 2. VALIDATE DATE PARAMETERS
      // ==========================================

      if (Array.isArray(from) || Array.isArray(to)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date parameters",
        });
      }

      // ==========================================
      // 3. CONVERT DATES
      // ==========================================

      const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;

      const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined;

      // ==========================================
      // 4. VALIDATE DATES
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
      // 5. VALIDATE DATE RANGE
      // ==========================================

      if (fromDate && toDate && fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message: "From date cannot be later than to date",
        });
      }

      // ==========================================
      // 6. GET SALES REPORT
      // ==========================================

      const result = await salesService.getSales(userId, fromDate, toDate);

      // ==========================================
      // 7. RESPONSE
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

export default new SalesController();
