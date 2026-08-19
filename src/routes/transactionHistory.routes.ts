import { Router } from "express";

import transactionHistoryController from "../controllers/transactionHistory/transactionHistory.controller";

const transactionHistoryRouter = Router();

transactionHistoryRouter.get("/", transactionHistoryController.getTransactions);

export default transactionHistoryRouter;
