import express from "express";

import authenticate from "../middleware/auth.middleware";

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

import customerRouter from "./customer.routes";

import supplierRouter from "./supplier.routes";

import purchaseRouter from "./purchase.routes";

import reportsRouter from "./reports.routes";

import dashboardRouter from "./dashboard.routes";
import adminRouter from "./admin.routes";
import emailRouter from "./email.routes";

const router = express.Router();

// =====================================================
// PUBLIC AUTH ROUTES
// =====================================================

router.use("/auth", authRouter);

// =====================================================
// PROTECTED APPLICATION ROUTES
// =====================================================

router.use(authenticate);

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

router.use("/customers", customerRouter);
router.use("/suppliers", supplierRouter);

router.use("/purchases", purchaseRouter);

router.use("/reports", reportsRouter);

router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);
router.use("/email", emailRouter);

export default router;
