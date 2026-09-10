"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const purchase_controller_1 = __importDefault(require("../controllers/purchase/purchase.controller"));
const purchaseRouter = express_1.default.Router();
// =====================================================
// PURCHASE ROUTES
// =====================================================
purchaseRouter.get("/", auth_middleware_1.default, purchase_controller_1.default.getPurchases);
exports.default = purchaseRouter;
