"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountTemplate_controller_1 = require("../controllers/account/accountTemplate.controller");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const accountTemplateRouter = (0, express_1.Router)();
accountTemplateRouter.post("/", auth_middleware_1.default, accountTemplate_controller_1.createTemplate);
accountTemplateRouter.get("/", auth_middleware_1.default, accountTemplate_controller_1.getTemplates);
accountTemplateRouter.get("/:id", auth_middleware_1.default, accountTemplate_controller_1.getTemplate);
accountTemplateRouter.put("/:id", auth_middleware_1.default, accountTemplate_controller_1.updateTemplate);
accountTemplateRouter.delete("/:id", auth_middleware_1.default, accountTemplate_controller_1.deleteTemplate);
exports.default = accountTemplateRouter;
