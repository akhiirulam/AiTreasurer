import { Router } from "express";

import trialBalanceController from "../controllers/trialBalance/trialBalance.controller";

const trialBalanceRouter = Router();

trialBalanceRouter.get("/", trialBalanceController.getTrialBalance);

export default trialBalanceRouter;
