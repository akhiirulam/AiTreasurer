"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const account_model_1 = __importDefault(require("../../models/account.model"));
class AccountRepository {
    async create(data) {
        return await account_model_1.default.create({
            userId: new mongoose_1.default.Types.ObjectId(data.userId),
            templateId: data.templateId
                ? new mongoose_1.default.Types.ObjectId(data.templateId)
                : null,
            name: data.name.trim(),
            code: data.code.trim(),
            type: data.type,
            category: data.category ?? null,
            subCategory: data.subCategory ?? null,
            normalBalance: data.normalBalance ?? null,
            description: data.description ?? null,
            isSystem: data.isSystem ?? false,
        });
    }
    async findByTemplate(userId, templateId) {
        return await account_model_1.default.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            templateId: new mongoose_1.default.Types.ObjectId(templateId),
        });
    }
    async findByName(userId, name) {
        return await account_model_1.default.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            name: name.trim(),
        });
    }
    async findById(userId, accountId) {
        return await account_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(accountId),
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
    }
    async findAllByUser(userId) {
        const objectId = new mongoose_1.default.Types.ObjectId(userId);
        const accounts = await account_model_1.default.find({
            userId: objectId,
        }).sort({
            code: 1,
        });
        return accounts;
    }
    async findByType(userId, type) {
        return await account_model_1.default.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            type,
        }).sort({
            code: 1,
        });
    }
    async findMaxCodeByType(userId, type) {
        const accounts = await this.findByType(userId, type);
        const codes = accounts
            .map((account) => Number(account.code))
            .filter((code) => !Number.isNaN(code));
        if (codes.length === 0) {
            return this.getBaseCode(type);
        }
        return Math.max(...codes);
    }
    async update(userId, accountId, data) {
        if (data.name) {
            data.name = data.name.trim();
        }
        return await account_model_1.default.findOneAndUpdate({
            _id: new mongoose_1.default.Types.ObjectId(accountId),
            userId: new mongoose_1.default.Types.ObjectId(userId),
        }, data, {
            new: true,
            runValidators: true,
        });
    }
    async delete(userId, accountId) {
        return await account_model_1.default.findOneAndDelete({
            _id: new mongoose_1.default.Types.ObjectId(accountId),
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
    }
    getBaseCode(type) {
        switch (type) {
            case "asset":
                return 1000;
            case "liability":
                return 2000;
            case "equity":
                return 3000;
            case "income":
                return 4000;
            case "expense":
                return 6000;
            default:
                return 9000;
        }
    }
}
exports.default = new AccountRepository();
