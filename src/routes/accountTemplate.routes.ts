import { Router } from "express";

import {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/account/accountTemplate.controller";
import authenticate from "../middleware/auth.middleware";

const accountTemplateRouter = Router();
accountTemplateRouter.post("/", authenticate, createTemplate);

accountTemplateRouter.get("/", authenticate, getTemplates);

accountTemplateRouter.get("/:id", authenticate, getTemplate);

accountTemplateRouter.put("/:id", authenticate, updateTemplate);

accountTemplateRouter.delete("/:id", authenticate, deleteTemplate);

export default accountTemplateRouter;
