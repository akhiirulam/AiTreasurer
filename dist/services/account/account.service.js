"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const account_repository_1 = __importDefault(require("../../repositories/account/account.repository"));
const accountTemplate_repository_1 = __importDefault(require("../../repositories/account/accountTemplate.repository"));
class AccountService {
    /**
     * Get or create a user-specific account
     * based on a GLOBAL account template.
     *
     * Flow:
     *
     * Account name
     *      ↓
     * Global AccountTemplate
     *      ↓
     * User Account
     */
    async getOrCreateAccount(userId, accountName, accountType, category, subCategory) {
        const normalizedName = accountName.trim();
        if (!normalizedName) {
            throw new Error("Account name is required");
        }
        // ==========================================
        // 1. FIND GLOBAL TEMPLATE
        // ==========================================
        let template = await accountTemplate_repository_1.default.findByName(normalizedName);
        // -----------------------------------------
        // 2. Template MUST exist
        // -----------------------------------------
        if (!template) {
            // AI must provide account type
            if (!accountType) {
                throw new Error(`Account template "${normalizedName}" not found and account type was not provided`);
            }
            if (!category || !subCategory) {
                throw new Error(`Account classification required to create template: ${normalizedName}`);
            }
            const code = await accountTemplate_repository_1.default.generateNextCode(accountType);
            // -----------------------------------------
            // 3. CREATE GLOBAL TEMPLATE
            // -----------------------------------------
            template = await accountTemplate_repository_1.default.create({
                code,
                name: normalizedName,
                type: accountType,
                category,
                subCategory,
                normalBalance: accountType === "asset" || accountType === "expense"
                    ? "debit"
                    : "credit",
                description: null,
                isSystem: true,
                isActive: true,
            });
        }
        // ==========================================
        // 4. TEMPLATE IS SOURCE OF TRUTH
        // ==========================================
        const resolvedAccountType = template.type;
        // -----------------------------------------
        // 5. Check user's existing account
        // -----------------------------------------
        let account = await account_repository_1.default.findByTemplate(userId, template._id.toString());
        if (account) {
            return account;
        }
        // -----------------------------------------
        // 6. Create user's account
        // -----------------------------------------
        account = await account_repository_1.default.create({
            userId,
            templateId: template._id.toString(),
            name: template.name,
            code: template.code,
            type: resolvedAccountType,
            category: template.category,
            subCategory: template.subCategory,
            normalBalance: template.normalBalance,
            description: template.description,
            isSystem: true,
        });
        return account;
    }
    async getOrCreateFromTemplate(userId, templateName) {
        return await this.getOrCreateAccount(userId, templateName);
    }
    /**
     * Create a custom user account manually.
     *
     * This account is NOT linked to a template.
     */
    async createAccount(userId, data) {
        const existing = await account_repository_1.default.findByName(userId, data.name);
        if (existing) {
            return existing;
        }
        const maxCode = await account_repository_1.default.findMaxCodeByType(userId, data.type);
        const nextCode = String(maxCode + 10);
        return await account_repository_1.default.create({
            userId,
            templateId: null,
            name: data.name,
            code: nextCode,
            type: data.type,
            category: null,
            subCategory: null,
            normalBalance: data.type === "asset" || data.type === "expense" ? "debit" : "credit",
            description: data.description ?? null,
            isSystem: false,
        });
    }
    async findByName(userId, name) {
        return await account_repository_1.default.findByName(userId, name);
    }
    async getAccounts(userId) {
        return await account_repository_1.default.findAllByUser(userId);
    }
    async getAccount(userId, accountId) {
        return await account_repository_1.default.findById(userId, accountId);
    }
    async updateAccount(userId, accountId, data) {
        return await account_repository_1.default.update(userId, accountId, data);
    }
    async deleteAccount(userId, accountId) {
        const account = await account_repository_1.default.findById(userId, accountId);
        if (!account) {
            throw new Error("Account not found");
        }
        if (account.isSystem) {
            throw new Error("System accounts cannot be deleted");
        }
        return await account_repository_1.default.delete(userId, accountId);
    }
}
exports.default = new AccountService();
