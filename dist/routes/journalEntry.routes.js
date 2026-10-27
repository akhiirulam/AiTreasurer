"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const journalEntry_controller_1 = __importDefault(require("../controllers/journalEntry/journalEntry.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const journalrouter = (0, express_1.Router)();
journalrouter.get("/transaction/:transactionId", auth_middleware_1.default, journalEntry_controller_1.default.getByTransactionId);
exports.default = journalrouter;
