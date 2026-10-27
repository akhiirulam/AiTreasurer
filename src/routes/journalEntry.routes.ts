import { Router } from "express";

import journalEntryController from "../controllers/journalEntry/journalEntry.controller";
import authenticate from "../middleware/auth.middleware";

const journalrouter = Router();

journalrouter.get(
  "/transaction/:transactionId", authenticate,
  journalEntryController.getByTransactionId,
);

export default journalrouter;
