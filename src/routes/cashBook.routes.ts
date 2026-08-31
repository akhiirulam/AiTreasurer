import { Router } from "express";

import cashBookController from "../controllers/cashBook/cashBook.controller";
import authenticate from "../middleware/auth.middleware";

const cashBookRouter = Router();

cashBookRouter.get("/", authenticate, cashBookController.getCashBook);

export default cashBookRouter;
