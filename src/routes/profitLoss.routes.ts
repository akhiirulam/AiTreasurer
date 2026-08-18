import { Router } from "express";

import profitLossController from "../controllers/profitLoss/profitLoss.controller";

const profitLossRouter = Router();

profitLossRouter.get("/", profitLossController.getProfitLoss);

export default profitLossRouter;
