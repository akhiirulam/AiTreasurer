"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaction_controller_1 = require("../controllers/transaction/transaction.controller");
const multer_middleware_1 = __importDefault(require("../middleware/multer.middleware"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const transactionRouter = express_1.default.Router();
transactionRouter.use("/createWebTransaction", multer_middleware_1.default.single("attachment"), auth_middleware_1.default, transaction_controller_1.createWebTransaction);
exports.default = transactionRouter;
