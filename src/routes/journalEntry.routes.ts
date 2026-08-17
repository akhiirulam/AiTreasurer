import { Router } from "express";

import journalEntryController from "../controllers/journalEntry/journalEntry.controller";

const journalrouter = Router();

journalrouter.get(
  "/transaction/:transactionId",
  journalEntryController.getByTransactionId,
);

export default journalrouter;
