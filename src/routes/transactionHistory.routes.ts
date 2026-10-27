import { Router } from "express";

import TransactionHistoryController from "../controllers/transactionHistory/transactionHistory.controller";
import authenticate from "../middleware/auth.middleware";

const transactionHistoryRouter = Router();

transactionHistoryRouter.get(
  "/",
  authenticate,
  TransactionHistoryController.getTransactions,
);

export default transactionHistoryRouter;
