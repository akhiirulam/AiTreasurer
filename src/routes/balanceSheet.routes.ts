import { Router } from "express";

import balanceSheetController from "../controllers/balanceSheet/balanceSheet.controller";
import authenticate from "../middleware/auth.middleware";

const balanceSheetRouter = Router();

balanceSheetRouter.get(
  "/",
  authenticate,
  balanceSheetController.getBalanceSheet,
);

export default balanceSheetRouter;
