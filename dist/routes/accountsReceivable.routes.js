"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountsReceivable_controller_1 = __importDefault(require("../controllers/accountsReceivable/accountsReceivable.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const accountsReceivableRouter = (0, express_1.Router)();
accountsReceivableRouter.get("/", auth_middleware_1.default, accountsReceivable_controller_1.default.getAccountsReceivable);
exports.default = accountsReceivableRouter;
