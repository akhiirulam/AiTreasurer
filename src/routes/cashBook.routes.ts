import { Router } from "express";

import cashBookController from "../controllers/cashBook/cashBook.controller";

const cashBookRouter = Router();

cashBookRouter.get("/", cashBookController.getCashBook);

export default cashBookRouter;
