import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

import journalEntryService from "../../services/journalEntry/journalEntry.service";

class JournalEntryController {
  async getByTransactionId(
    req: Request<{ transactionId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: "Transaction ID is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction ID",
        });
      }

      const result = await journalEntryService.getByTransactionId(
        new mongoose.Types.ObjectId(transactionId),
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Journal entry not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new JournalEntryController();
