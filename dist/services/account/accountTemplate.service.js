"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const accountTemplate_repository_1 = __importDefault(require("../../repositories/account/accountTemplate.repository"));
class AccountTemplateService {
    validTypes = [
        "asset",
        "liability",
        "equity",
        "income",
        "expense",
    ];
    async createTemplate(data) {
        if (!data.name) {
            throw new Error("Template name is required");
        }
        if (!data.code) {
            throw new Error("Template code is required");
        }
        const existingCode = await accountTemplate_repository_1.default.existsByCode(data.code);
        if (existingCode) {
            throw new Error(`Template with code ${data.code} already exists`);
        }
        const existingName = await accountTemplate_repository_1.default.existsByName(data.name);
        if (existingName) {
            throw new Error(`Template with name "${data.name}" already exists`);
        }
        return await accountTemplate_repository_1.default.create(data);
    }
    async createTemplates(data) {
        return await accountTemplate_repository_1.default.createMany(data);
    }
    async getTemplate(id) {
        const template = await accountTemplate_repository_1.default.findById(id);
        if (!template) {
            throw new Error("Account template not found");
        }
        return template;
    }
    async getAllTemplates() {
        return await accountTemplate_repository_1.default.findAll();
    }
    async getTemplatesByType(type) {
        if (!this.validTypes.includes(type)) {
            throw new Error(`Invalid account template type: ${type}`);
        }
        return await accountTemplate_repository_1.default.findByType(type);
    }
    async getTemplatesByCategory(category) {
        return await accountTemplate_repository_1.default.findByCategory(category);
    }
    async updateTemplate(id, data) {
        const template = await accountTemplate_repository_1.default.update(id, data);
        if (!template) {
            throw new Error("Account template not found");
        }
        return template;
    }
    async deleteTemplate(id) {
        const template = await accountTemplate_repository_1.default.delete(id);
        if (!template) {
            throw new Error("Account template not found");
        }
        return template;
    }
    async findTemplateByName(name) {
        const template = await accountTemplate_repository_1.default.findByName(name);
        if (!template) {
            throw new Error(`Account template "${name}" not found`);
        }
        return template;
    }
}
exports.default = new AccountTemplateService();
