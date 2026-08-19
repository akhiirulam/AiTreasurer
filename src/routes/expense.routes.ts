import { Router } from "express";

import expenseController from "../controllers/expense/expense.controller";

const expenseRouter = Router();

expenseRouter.get("/", expenseController.getExpenses);

export default expenseRouter;
