import express from "express";
import { createWebTransaction } from "../controllers/transaction/transaction.controller";
import upload from "../middleware/multer.middleware";
import authenticate from "../middleware/auth.middleware";

const transactionRouter = express.Router();

transactionRouter.use(
  "/createWebTransaction",
  upload.single("attachment"),
  authenticate,
  createWebTransaction,
);

export default transactionRouter;
