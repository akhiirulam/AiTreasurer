"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactionHistory_controller_1 = __importDefault(require("../controllers/transactionHistory/transactionHistory.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const transactionHistoryRouter = (0, express_1.Router)();
transactionHistoryRouter.get("/", auth_middleware_1.default, transactionHistory_controller_1.default.getTransactions);
exports.default = transactionHistoryRouter;
