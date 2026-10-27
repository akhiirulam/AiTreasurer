"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userRegistration_model_1 = __importDefault(require("../../models/userRegistration.model"));
class UserLogin {
    async findByEmail(email) {
        return await userRegistration_model_1.default.findOne({
            email: email.toLowerCase(),
        }).select("+password");
    }
}
exports.default = new UserLogin();
