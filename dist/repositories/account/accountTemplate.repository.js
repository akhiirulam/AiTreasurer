"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const accountTemplate_model_1 = __importDefault(require("../../models/accountTemplate.model"));
class AccountTemplateRepository {
    /**
     * Create one global account template.
     *
     * Templates are shared by all shopkeepers.
     */
    async create(data) {
        const template = await accountTemplate_model_1.default.create({
            name: data.name.trim(),
            code: data.code,
            type: data.type,
            category: data.category,
            subCategory: data.subCategory,
            normalBalance: data.normalBalance,
            description: data.description ?? null,
            isSystem: data.isSystem ?? true,
            isActive: data.isActive ?? true,
        });
        return template.toObject();
    }
    /**
     * Create multiple global account templates.
     */
    async createMany(data) {
        const templates = await accountTemplate_model_1.default.insertMany(data);
        return templates.map((template) => template.toObject());
    }
    /**
     * Find a global template by ID.
     */
    async findById(id) {
        return await accountTemplate_model_1.default.findById(id).lean();
    }
    /**
     * Find a global template by code.
     */
    async findByCode(code) {
        return await accountTemplate_model_1.default.findOne({
            code: code.trim(),
            isActive: true,
        }).lean();
    }
    /**
     * Find a global template by name.
     *
     * Case-insensitive exact match.
     */
    async findByName(name) {
        const normalizedName = name.trim();
        const result = await accountTemplate_model_1.default.findOne({
            name: {
                $regex: `^${this.escapeRegex(normalizedName)}$`,
                $options: "i",
            },
            isActive: true,
        }).lean();
        console.log("result", result);
        return result;
    }
    /**
     * Get all active global templates.
     */
    async findAll() {
        return await accountTemplate_model_1.default.find({
            isActive: true,
        })
            .sort({ code: 1 })
            .lean();
    }
    /**
     * Get templates by account type.
     */
    async findByType(type) {
        return await accountTemplate_model_1.default.find({
            type,
            isActive: true,
        })
            .sort({ code: 1 })
            .lean();
    }
    /**
     * Get templates by category.
     */
    async findByCategory(category) {
        return await accountTemplate_model_1.default.find({
            category: category.trim(),
            isActive: true,
        })
            .sort({ code: 1 })
            .lean();
    }
    /**
     * Update a global template.
     */
    async update(id, data) {
        const updateData = {
            ...data,
            ...(data.name ? { name: data.name.trim() } : {}),
        };
        return await accountTemplate_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).lean();
    }
    /**
     * Soft delete a template.
     *
     * We don't actually remove the template because
     * existing user accounts may reference it.
     */
    async delete(id) {
        return await accountTemplate_model_1.default.findByIdAndUpdate(id, {
            isActive: false,
        }, {
            new: true,
            runValidators: true,
        }).lean();
    }
    /**
     * Check whether a template code already exists.
     */
    async existsByCode(code) {
        const template = await accountTemplate_model_1.default.exists({
            code: code.trim(),
            isActive: true,
        });
        return !!template;
    }
    /**
     * Check whether a template name already exists.
     */
    async existsByName(name) {
        const normalizedName = name.trim();
        const template = await accountTemplate_model_1.default.exists({
            name: {
                $regex: `^${this.escapeRegex(normalizedName)}$`,
                $options: "i",
            },
            isActive: true,
        });
        return !!template;
    }
    /**
     * Generate the next global template code.
     */
    async generateNextCode(type) {
        const prefixMap = {
            asset: "AST",
            liability: "LIA",
            equity: "EQT",
            income: "INC",
            expense: "EXP",
        };
        const prefix = prefixMap[type];
        const templates = await accountTemplate_model_1.default.find({
            type,
            isActive: true,
            code: {
                $regex: `^${prefix}-\\d+$`,
            },
        })
            .sort({ code: -1 })
            .limit(1)
            .lean();
        // No existing template for this type
        if (!templates.length) {
            return `${prefix}-001`;
        }
        const lastCode = templates[0].code;
        const match = lastCode.match(new RegExp(`^${prefix}-(\\d+)$`));
        if (!match) {
            throw new Error(`Invalid account template code: ${lastCode}`);
        }
        const nextNumber = Number(match[1]) + 1;
        return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
    }
    /**
     * Escape special regex characters.
     */
    escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    async createFromAccountName(name, type) {
        const normalizedName = name.trim();
        const existing = await this.findByName(normalizedName);
        if (existing) {
            return existing;
        }
        const code = await this.generateNextCode(type);
        const normalBalance = type === "asset" || type === "expense" ? "debit" : "credit";
        const category = this.getDefaultCategory(type);
        const subCategory = this.getDefaultSubCategory(type);
        return await this.create({
            code,
            name: normalizedName,
            type,
            category,
            subCategory,
            normalBalance,
            description: `${normalizedName} account`,
            isSystem: true,
            isActive: true,
        });
    }
    getDefaultCategory(type) {
        switch (type) {
            case "asset":
                return "current_asset";
            case "liability":
                return "current_liability";
            case "equity":
                return "owner_equity";
            case "income":
                return "operating_income";
            case "expense":
                return "operating_expense";
        }
    }
    getDefaultSubCategory(type) {
        switch (type) {
            case "asset":
                return "other_assets";
            case "liability":
                return "other_liabilities";
            case "equity":
                return "other_equity";
            case "income":
                return "other";
            case "expense":
                return "miscellaneous";
        }
    }
}
exports.default = new AccountTemplateRepository();
