import { Router } from "express";

import accountsPayableController from "../controllers/accountsPayable/accountsPayable.controller";

const accountsPayableRouter = Router();

accountsPayableRouter.get("/", accountsPayableController.getAccountsPayable);

export default accountsPayableRouter;
