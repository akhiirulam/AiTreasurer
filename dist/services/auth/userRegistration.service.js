"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const userRegistration_repository_1 = __importDefault(require("../../repositories/auth/userRegistration.repository"));
class UserRegistrationService {
    async registerUser(userData) {
        const { fullName, email, mobileNumber, password, role } = userData;
        const normalizedEmail = email.toLowerCase().trim();
        // 1. Check email
        const existingEmail = await userRegistration_repository_1.default.findByEmail(normalizedEmail);
        if (existingEmail) {
            throw new Error("Email is already registered");
        }
        // 2. Check mobile number
        const existingMobile = await userRegistration_repository_1.default.findByMobileNumber(mobileNumber);
        if (existingMobile) {
            throw new Error("Mobile number is already registered");
        }
        // 3. Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        // 4. Create shopkeeper/user
        const user = await userRegistration_repository_1.default.create({
            fullName,
            email: normalizedEmail,
            mobileNumber,
            password: hashedPassword,
            authProvider: "local",
            role,
            isEmailVerified: false,
            isMobileVerified: false,
            accountStatus: "active",
        });
        return user;
    }
}
exports.default = new UserRegistrationService();
