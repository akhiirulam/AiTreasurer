import { Router } from "express";

import salesController from "../controllers/sales/sales.controller";
import authenticate from "../middleware/auth.middleware";

const salesRouter = Router();

salesRouter.get("/",authenticate, salesController.getSales);

export default salesRouter;
