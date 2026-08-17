import { Router } from "express";

import ledgerController from "../controllers/ledger/ledger.controller";
import authenticate from "../middleware/auth.middleware";

const ledgerRouter = Router();

ledgerRouter.get(
  "/account/:accountId",
  //   authenticate,
  ledgerController.getAccountLedger,
);

export default ledgerRouter;
