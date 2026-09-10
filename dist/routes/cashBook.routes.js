"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cashBook_controller_1 = __importDefault(require("../controllers/cashBook/cashBook.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const cashBookRouter = (0, express_1.Router)();
cashBookRouter.get("/", auth_middleware_1.default, cashBook_controller_1.default.getCashBook);
exports.default = cashBookRouter;
