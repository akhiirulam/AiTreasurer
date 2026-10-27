"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trialBalance_controller_1 = __importDefault(require("../controllers/trialBalance/trialBalance.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const trialBalanceRouter = (0, express_1.Router)();
trialBalanceRouter.get("/", auth_middleware_1.default, trialBalance_controller_1.default.getTrialBalance);
exports.default = trialBalanceRouter;
