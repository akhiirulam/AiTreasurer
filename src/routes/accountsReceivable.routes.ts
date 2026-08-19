import { Router } from "express";

import accountsReceivableController from "../controllers/accountsReceivable/accountsReceivable.controller";

const accountsReceivableRouter = Router();

accountsReceivableRouter.get(
  "/",
  accountsReceivableController.getAccountsReceivable,
);

export default accountsReceivableRouter;
