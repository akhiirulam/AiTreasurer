"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sales_controller_1 = __importDefault(require("../controllers/sales/sales.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const salesRouter = (0, express_1.Router)();
salesRouter.get("/", auth_middleware_1.default, sales_controller_1.default.getSales);
exports.default = salesRouter;
