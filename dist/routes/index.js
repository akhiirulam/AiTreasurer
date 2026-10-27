"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const transaction_1 = __importDefault(require("./transaction"));
const account_routes_1 = __importDefault(require("./account.routes"));
const journalEntry_routes_1 = __importDefault(require("./journalEntry.routes"));
const ledger_routes_1 = __importDefault(require("./ledger.routes"));
const trialBalance_routes_1 = __importDefault(require("./trialBalance.routes"));
const profitLoss_routes_1 = __importDefault(require("./profitLoss.routes"));
const accountTemplate_routes_1 = __importDefault(require("./accountTemplate.routes"));
const balanceSheet_routes_1 = __importDefault(require("./balanceSheet.routes"));
const cashBook_routes_1 = __importDefault(require("./cashBook.routes"));
const accountsReceivable_routes_1 = __importDefault(require("./accountsReceivable.routes"));
const accountsPayable_routes_1 = __importDefault(require("./accountsPayable.routes"));
const sales_routes_1 = __importDefault(require("./sales.routes"));
const expense_routes_1 = __importDefault(require("./expense.routes"));
const transactionHistory_routes_1 = __importDefault(require("./transactionHistory.routes"));
const customer_routes_1 = __importDefault(require("./customer.routes"));
const supplier_routes_1 = __importDefault(require("./supplier.routes"));
const purchase_routes_1 = __importDefault(require("./purchase.routes"));
const reports_routes_1 = __importDefault(require("./reports.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const router = express_1.default.Router();
// =====================================================
// PUBLIC AUTH ROUTES
// =====================================================
router.use("/auth", auth_routes_1.default);
// =====================================================
// PROTECTED APPLICATION ROUTES
// =====================================================
router.use(auth_middleware_1.default);
router.use("/transaction", transaction_1.default);
router.use("/accounts", account_routes_1.default);
router.use("/accountTemplate", accountTemplate_routes_1.default);
router.use("/journal", journalEntry_routes_1.default);
router.use("/ledger", ledger_routes_1.default);
router.use("/trial-balance", trialBalance_routes_1.default);
router.use("/profit-loss", profitLoss_routes_1.default);
router.use("/balance-sheet", balanceSheet_routes_1.default);
router.use("/cash-book", cashBook_routes_1.default);
router.use("/accounts-receivable", accountsReceivable_routes_1.default);
router.use("/accounts-payable", accountsPayable_routes_1.default);
router.use("/sales", sales_routes_1.default);
router.use("/expenses", expense_routes_1.default);
router.use("/transactions/history", transactionHistory_routes_1.default);
router.use("/customers", customer_routes_1.default);
router.use("/suppliers", supplier_routes_1.default);
router.use("/purchases", purchase_routes_1.default);
router.use("/reports", reports_routes_1.default);
router.use("/dashboard", dashboard_routes_1.default);
router.use("/admin", admin_routes_1.default);
exports.default = router;
