"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profitLoss_controller_1 = __importDefault(require("../controllers/profitLoss/profitLoss.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const profitLossRouter = (0, express_1.Router)();
profitLossRouter.get("/", auth_middleware_1.default, profitLoss_controller_1.default.getProfitLoss);
exports.default = profitLossRouter;
