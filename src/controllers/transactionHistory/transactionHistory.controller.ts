import { Request, Response, NextFunction } from "express";

import transactionHistoryService from "../../services/transactionHistory/transactionHistory.service";

class TransactionHistoryController {
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, search, type, paymentStatus, from, to, page, limit } =
        req.query;

      // ==========================================
      // 1. USER ID
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
      // 2. ARRAY VALIDATION
      // ==========================================

      if (
        Array.isArray(search) ||
        Array.isArray(type) ||
        Array.isArray(paymentStatus) ||
        Array.isArray(from) ||
        Array.isArray(to) ||
        Array.isArray(page) ||
        Array.isArray(limit)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
        });
      }

      // ==========================================
      // 3. DATE CONVERSION
      // ==========================================

      const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;

      const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined;

      // ==========================================
      // 4. DATE VALIDATION
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

      if (fromDate && toDate && fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message: "From date cannot be later than to date",
        });
      }

      // ==========================================
      // 5. GET TRANSACTIONS
      // ==========================================

      const result = await transactionHistoryService.getTransactions(userId, {
        search,
        type,
        paymentStatus,
        from: fromDate,
        to: toDate,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      // ==========================================
      // 6. RESPONSE
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
