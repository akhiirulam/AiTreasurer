import { Router } from "express";

import trialBalanceController from "../controllers/trialBalance/trialBalance.controller";
import authenticate from "../middleware/auth.middleware";

const trialBalanceRouter = Router();

trialBalanceRouter.get(
  "/",
  authenticate,
  trialBalanceController.getTrialBalance,
);

export default trialBalanceRouter;
