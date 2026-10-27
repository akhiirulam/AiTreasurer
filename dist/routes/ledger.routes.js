"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ledger_controller_1 = __importDefault(require("../controllers/ledger/ledger.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const ledgerRouter = (0, express_1.Router)();
ledgerRouter.get("/account", auth_middleware_1.default, ledger_controller_1.default.getAccountLedger);
exports.default = ledgerRouter;
