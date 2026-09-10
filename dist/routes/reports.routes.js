"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reports_controller_1 = __importDefault(require("../controllers/reports/reports.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const reportRouter = express_1.default.Router();
reportRouter.get("/", auth_middleware_1.default, reports_controller_1.default.getReport);
exports.default = reportRouter;
