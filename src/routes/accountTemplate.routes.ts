import { Router } from "express";

import {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/account/accountTemplate.controller";

const accountTemplateRouter = Router();
accountTemplateRouter.post("/", createTemplate);

accountTemplateRouter.get("/", getTemplates);

accountTemplateRouter.get("/:id", getTemplate);

accountTemplateRouter.put("/:id", updateTemplate);

accountTemplateRouter.delete("/:id", deleteTemplate);

export default accountTemplateRouter;
