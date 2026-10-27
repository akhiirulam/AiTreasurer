"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth/auth.controller");
const google_controller_1 = require("../controllers/auth/google.controller");
const authRouter = express_1.default.Router();
authRouter.post("/register", auth_controller_1.userRegistration);
authRouter.post("/login", auth_controller_1.userLogin);
authRouter.post("/google", google_controller_1.googleLogin);
authRouter.post("/refresh", auth_controller_1.refreshAccessToken);
authRouter.post("/logout", auth_controller_1.logout);
exports.default = authRouter;
