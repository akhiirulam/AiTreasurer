"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountsPayable_controller_1 = __importDefault(require("../controllers/accountsPayable/accountsPayable.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const accountsPayableRouter = (0, express_1.Router)();
accountsPayableRouter.get("/", auth_middleware_1.default, accountsPayable_controller_1.default.getAccountsPayable);
exports.default = accountsPayableRouter;
