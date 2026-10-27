import { Router } from "express";

import expenseController from "../controllers/expense/expense.controller";
import authenticate from "../middleware/auth.middleware";

const expenseRouter = Router();

expenseRouter.get("/", authenticate, expenseController.getExpenses);

export default expenseRouter;
