import { Request, Response, NextFunction } from "express";

import ledgerService from "../../services/ledger/ledger.service";

class LedgerController {
  async getAccountLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;

      // Make sure accountId is a single string
      if (typeof accountId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid account ID",
        });
      }

      const userId = "6a7c5f6cf96020b9a1fcf7df";

      const result = await ledgerService.getAccountLedger(userId, accountId);

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
