import { Request, Response } from "express";

import transactionService from "../../services/transacation/webTransaction.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

export const createWebTransaction = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { text } = req.body;
    const userId = req.userId;

    (console.log(text), userId);

    // Validate transaction text
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Transaction text is required",
      });
    }

    // Validate user
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Optional attachment
    const file = req.file;

    const transaction = await transactionService.createTransaction({
      userId,
      text: text.trim(),
      file,
    });

    console.log(transaction);

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create transaction",
    });
  }
};
