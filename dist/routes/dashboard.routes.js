"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_controller_1 = __importDefault(require("../controllers/dashboard/dashboard.controller"));
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const dashboardRouter = express_1.default.Router();
dashboardRouter.get("/", auth_middleware_1.default, dashboard_controller_1.default.getDashboard);
exports.default = dashboardRouter;
