import express from "express";
import { createWebTransaction } from "../controllers/transaction/transaction.controller";
import upload from "../middleware/multer.middleware";

const transactionRouter = express.Router();

transactionRouter.use(
  "/createWebTransaction",
  upload.single("attachment"),
  createWebTransaction,
);

export default transactionRouter;
