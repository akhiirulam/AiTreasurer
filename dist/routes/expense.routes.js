"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_controller_1 = __importDefault(require("../controllers/expense/expense.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const expenseRouter = (0, express_1.Router)();
expenseRouter.get("/", auth_middleware_1.default, expense_controller_1.default.getExpenses);
exports.default = expenseRouter;
