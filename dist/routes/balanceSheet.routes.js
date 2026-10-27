"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const balanceSheet_controller_1 = __importDefault(require("../controllers/balanceSheet/balanceSheet.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const balanceSheetRouter = (0, express_1.Router)();
balanceSheetRouter.get("/", auth_middleware_1.default, balanceSheet_controller_1.default.getBalanceSheet);
exports.default = balanceSheetRouter;
