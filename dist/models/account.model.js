"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const accountSchema = new mongoose_1.Schema({
    /**
     * Shopkeeper who owns this account.
     */
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "UserRegistration",
        required: true,
        index: true,
    },
    /**
     * Global AccountTemplate reference.
     *
     * Example:
     *
     * AccountTemplate._id
     *          ↓
     * Account.templateId
     */
    templateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "AccountTemplate",
        default: null,
        index: true,
    },
    /**
     * Actual account name for this shopkeeper.
     */
    name: {
        type: String,
        required: true,
        trim: true,
    },
    /**
     * Actual accounting code.
     */
    code: {
        type: String,
        required: true,
        trim: true,
    },
    /**
     * Accounting classification.
     */
    type: {
        type: String,
        enum: ["asset", "liability", "equity", "income", "expense"],
        required: true,
    },
    description: {
        type: String,
        default: null,
    },
    /**
     * true:
     *     Created automatically from a global template.
     *
     * false:
     *     Custom account.
     */
    isSystem: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    category: {
        type: String,
        default: null,
    },
    subCategory: {
        type: String,
        default: null,
    },
    normalBalance: {
        type: String,
        enum: ["debit", "credit"],
        default: null,
    },
}, {
    timestamps: true,
});
/**
 * A shopkeeper cannot have two accounts
 * with the same name.
 */
accountSchema.index({
    userId: 1,
    name: 1,
}, {
    unique: true,
});
/**
 * A shopkeeper cannot have two accounts
 * with the same code.
 */
accountSchema.index({
    userId: 1,
    code: 1,
}, {
    unique: true,
});
/**
 * A shopkeeper can create only ONE account
 * from a particular template.
 *
 * Example:
 *
 * USER_A + CashTemplate
 *     -> one Account
 *
 * USER_A + CashTemplate
 *     -> cannot create another one
 *
 * USER_B + CashTemplate
 *     -> allowed
 */
accountSchema.index({
    userId: 1,
    templateId: 1,
}, {
    unique: true,
    partialFilterExpression: {
        templateId: {
            $type: "objectId",
        },
    },
});
const Account = mongoose_1.default.model("Account", accountSchema);
exports.default = Account;
