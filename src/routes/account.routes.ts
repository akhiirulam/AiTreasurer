import { Router } from "express";

import {
  createAccount,
  createFromTemplate,
  getAccounts,
  getAccount,
  findByName,
  updateAccount,
  deleteAccount,
} from "../controllers/account/account.controller";
import authenticate from "../middleware/auth.middleware";

const accountRouter = Router();

accountRouter.post("/createAccount", authenticate, createAccount);
accountRouter.post("/from-template", authenticate, createFromTemplate);
accountRouter.get("/", authenticate, getAccounts);
accountRouter.get("/search", authenticate, findByName);
accountRouter.get("/:accountId", authenticate, getAccount);
accountRouter.put("/:accountId", authenticate, updateAccount);
accountRouter.delete("/:accountId", authenticate, deleteAccount);

export default accountRouter;
