import { Router } from "express";

import accountsPayableController from "../controllers/accountsPayable/accountsPayable.controller";
import authenticate from "../middleware/auth.middleware";

const accountsPayableRouter = Router();

accountsPayableRouter.get(
  "/",
  authenticate,
  accountsPayableController.getAccountsPayable,
);

export default accountsPayableRouter;
