import { Router } from "express";

import accountsReceivableController from "../controllers/accountsReceivable/accountsReceivable.controller";
import authenticate from "../middleware/auth.middleware";

const accountsReceivableRouter = Router();

accountsReceivableRouter.get(
  "/",
  authenticate,
  accountsReceivableController.getAccountsReceivable,
);

export default accountsReceivableRouter;
