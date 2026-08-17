import express from "express";
import authRouter from "./auth.routes";
import transactionRouter from "./transaction";
import accountRouter from "./account.routes";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/transaction", transactionRouter);
router.use("/accounts", accountRouter);

export default router;
