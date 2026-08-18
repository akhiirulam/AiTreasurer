import { Router } from "express";

import ledgerController from "../controllers/ledger/ledger.controller";

const ledgerRouter = Router();

ledgerRouter.get("/account", ledgerController.getAccountLedger);

export default ledgerRouter;
