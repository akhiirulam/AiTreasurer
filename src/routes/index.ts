import express from "express";
import authRouter from "./auth.routes";
import transactionRouter from "./transaction";
import accountRouter from "./account.routes";
import journalrouter from "./journalEntry.routes";
import ledgerRouter from "./ledger.routes";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/transaction", transactionRouter);
router.use("/accounts", accountRouter);
router.use("/journal", journalrouter);
router.use("/ledger", ledgerRouter);

export default router;
