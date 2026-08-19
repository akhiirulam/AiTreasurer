import express from "express";
import authRouter from "./auth.routes";
import transactionRouter from "./transaction";
import accountRouter from "./account.routes";
import journalrouter from "./journalEntry.routes";
import ledgerRouter from "./ledger.routes";
import trialBalanceRouter from "./trialBalance.routes";
import profitLossRouter from "./profitLoss.routes";
import accountTemplateRouter from "./accountTemplate.routes";
import balanceSheetRouter from "./balanceSheet.routes";
import cashBookRouter from "./cashBook.routes";
import accountsReceivableRouter from "./accountsReceivable.routes";
import accountsPayableRouter from "./accountsPayable.routes";
import salesRouter from "./sales.routes";
import expenseRouter from "./expense.routes";
import transactionHistoryRouter from "./transactionHistory.routes";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/transaction", transactionRouter);
router.use("/accounts", accountRouter);
router.use("/accountTemplate", accountTemplateRouter);
router.use("/journal", journalrouter);
router.use("/ledger", ledgerRouter);
router.use("/trial-balance", trialBalanceRouter);
router.use("/profit-loss", profitLossRouter);
router.use("/balance-sheet", balanceSheetRouter);
router.use("/cash-book", cashBookRouter);
router.use("/accounts-receivable", accountsReceivableRouter);
router.use("/accounts-payable", accountsPayableRouter);
router.use("/sales", salesRouter);
router.use("/expenses", expenseRouter);
router.use("/transactions/history", transactionHistoryRouter);

export default router;
