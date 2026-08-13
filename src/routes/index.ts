import express from "express";
import authRouter from "./auth.routes";
import transactionRouter from "./transaction";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/transaction", transactionRouter);

export default router;
