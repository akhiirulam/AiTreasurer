"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = require("../controllers/account/account.controller");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const accountRouter = (0, express_1.Router)();
accountRouter.post("/createAccount", auth_middleware_1.default, account_controller_1.createAccount);
accountRouter.post("/from-template", auth_middleware_1.default, account_controller_1.createFromTemplate);
accountRouter.get("/", auth_middleware_1.default, account_controller_1.getAccounts);
accountRouter.get("/search", auth_middleware_1.default, account_controller_1.findByName);
accountRouter.get("/:accountId", auth_middleware_1.default, account_controller_1.getAccount);
accountRouter.put("/:accountId", auth_middleware_1.default, account_controller_1.updateAccount);
accountRouter.delete("/:accountId", auth_middleware_1.default, account_controller_1.deleteAccount);
exports.default = accountRouter;
