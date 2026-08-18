import express from "express";
import authRouter from "./auth.routes";
import transactionRouter from "./transaction";
import accountRouter from "./account.routes";
import journalrouter from "./journalEntry.routes";
import ledgerRouter from "./ledger.routes";
import trialBalanceRouter from "./trialBalance.routes";
import profitLossRouter from "./profitLoss.routes";
import accountTemplateRouter from "./accountTemplate.routes";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/transaction", transactionRouter);
router.use("/accounts", accountRouter);
router.use("/accounts", accountTemplateRouter);

router.use("/journal", journalrouter);
router.use("/ledger", ledgerRouter);
router.use("/trial-balance", trialBalanceRouter);
router.use("/profit-loss", profitLossRouter);

export default router;
