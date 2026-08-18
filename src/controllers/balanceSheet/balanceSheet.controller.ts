import { Request, Response, NextFunction } from "express";

import balanceSheetService from "../../services/balanceSheet/balanceSheet.service";

class BalanceSheetController {
  async getBalanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, to } = req.query;

      // ----------------------------------------------
      // Validate userId
      // ----------------------------------------------

      if (!userId || Array.isArray(userId)) {
        return res.status(400).json({
          success: false,
          message: "Valid user ID is required",
        });
      }

      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // ----------------------------------------------
      // Validate date
      // ----------------------------------------------

      let toDate: Date | undefined;

      if (to !== undefined) {
        if (Array.isArray(to)) {
          return res.status(400).json({
            success: false,
            message: "Invalid to date",
          });
        }

        toDate = new Date(`${to}T23:59:59.999Z`);

        if (isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid to date",
          });
        }
      }

      // ----------------------------------------------
      // Get Balance Sheet
      // ----------------------------------------------

      const result = await balanceSheetService.getBalanceSheet(userId, toDate);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BalanceSheetController();
