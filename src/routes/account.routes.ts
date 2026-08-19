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

// accountRouter.post("/", authenticate, createAccount);
// accountRouter.post("/from-template", authenticate, createFromTemplate);
// accountRouter.get("/", authenticate, getAccounts);
// accountRouter.get("/search", authenticate, findByName);
// accountRouter.get("/:accountId", authenticate, getAccount);
// accountRouter.put("/:accountId", authenticate, updateAccount);
// accountRouter.delete("/:accountId", authenticate, deleteAccount);

accountRouter.post("/", createAccount);
accountRouter.post("/from-template", createFromTemplate);
accountRouter.get("/", getAccounts);
accountRouter.get("/search", findByName);
accountRouter.get("/:accountId", getAccount);
accountRouter.put("/:accountId", updateAccount);
accountRouter.delete("/:accountId", deleteAccount);

export default accountRouter;
