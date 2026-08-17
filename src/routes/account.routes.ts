import { Router } from "express";

import {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/account/accountTemplate.controller";

const accoutRouter = Router();

accoutRouter.post("/", createTemplate);

accoutRouter.get("/", getTemplates);

accoutRouter.get("/:id", getTemplate);

accoutRouter.put("/:id", updateTemplate);

accoutRouter.delete("/:id", deleteTemplate);

export default accoutRouter;
