import { Response, NextFunction } from "express";

import transactionHistoryService from "../../services/transactionHistory/transactionHistory.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

class TransactionHistoryController {
  async getTransactions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // ==========================================
      // 1. AUTHENTICATED USER
      // ==========================================

      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // ==========================================
      // 2. QUERY PARAMETERS
      // ==========================================

      const { search, type, paymentStatus, from, to, page, limit } = req.query;

      // ==========================================
      // 3. VALIDATE QUERY PARAMETERS
      // ==========================================

      if (
        (search !== undefined && typeof search !== "string") ||
        (type !== undefined && typeof type !== "string") ||
        (paymentStatus !== undefined && typeof paymentStatus !== "string") ||
        (from !== undefined && typeof from !== "string") ||
        (to !== undefined && typeof to !== "string") ||
        (page !== undefined && typeof page !== "string") ||
        (limit !== undefined && typeof limit !== "string")
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
        });
      }

      // ==========================================
      // 4. DATE CONVERSION
      // ==========================================

      const fromDate =
        from !== undefined ? new Date(`${from}T00:00:00.000Z`) : undefined;

      const toDate =
        to !== undefined ? new Date(`${to}T23:59:59.999Z`) : undefined;

      // ==========================================
      // 5. DATE VALIDATION
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
      // 6. DATE RANGE
      // ==========================================

      if (fromDate && toDate && fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message: "From date cannot be later than to date",
        });
      }

      if (fromDate && toDate && fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message: "From date cannot be later than to date",
        });
      }

      // ==========================================
      // 7. PAGINATION
      // ==========================================

      const pageNumber = page !== undefined ? Number(page) : undefined;

      const limitNumber = limit !== undefined ? Number(limit) : undefined;

      // ==========================================
      // 8. VALIDATE PAGE
      // ==========================================

      if (
        pageNumber !== undefined &&
        (!Number.isInteger(pageNumber) || pageNumber < 1)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid page",
        });
      }

      // ==========================================
      // 9. VALIDATE LIMIT
      // ==========================================

      if (
        limitNumber !== undefined &&
        (!Number.isInteger(limitNumber) || limitNumber < 1)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid limit",
        });
      }

      // ==========================================
      // 10. GET TRANSACTIONS
      // ==========================================

      const result = await transactionHistoryService.getTransactions(userId, {
        search,
        type,
        paymentStatus,
        from: fromDate,
        to: toDate,
        page: pageNumber,
        limit: limitNumber,
      });

      // ==========================================
      // 11. RESPONSE
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

export default new TransactionHistoryController();
