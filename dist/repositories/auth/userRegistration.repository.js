"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userRegistration_model_1 = __importDefault(require("../../models/userRegistration.model"));
class UserRegistrationRepository {
    async findByEmail(email) {
        return await userRegistration_model_1.default.findOne({
            email: email.toLowerCase(),
        });
    }
    async findByMobileNumber(mobileNumber) {
        return await userRegistration_model_1.default.findOne({
            mobileNumber,
        });
    }
    async create(userData) {
        const user = new userRegistration_model_1.default(userData);
        return await user.save();
    }
}
exports.default = new UserRegistrationRepository();
