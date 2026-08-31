import { Router } from "express";

import profitLossController from "../controllers/profitLoss/profitLoss.controller";
import authenticate from "../middleware/auth.middleware";

const profitLossRouter = Router();

profitLossRouter.get("/", authenticate, profitLossController.getProfitLoss);

export default profitLossRouter;
