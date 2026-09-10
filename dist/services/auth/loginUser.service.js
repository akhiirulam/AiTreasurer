"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const userLogin_repository_1 = __importDefault(require("../../repositories/auth/userLogin.repository"));
const token_1 = require("../../utils/token/token");
class UserLoginService {
    async loginUser(userData) {
        const { email, password } = userData;
        const user = await userLogin_repository_1.default.findByEmail(email);
        if (!user || !user.password) {
            throw new Error("Invalid email or password");
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }
        const accessToken = (0, token_1.generateAccessToken)(user._id.toString(), user.role);
        const refreshToken = (0, token_1.generateRefreshToken)(user._id.toString(), user.role);
        return { user, accessToken, refreshToken };
    }
}
exports.default = new UserLoginService();
