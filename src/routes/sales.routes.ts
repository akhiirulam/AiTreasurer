import { Router } from "express";

import salesController from "../controllers/sales/sales.controller";

const salesRouter = Router();

salesRouter.get("/", salesController.getSales);

export default salesRouter;
