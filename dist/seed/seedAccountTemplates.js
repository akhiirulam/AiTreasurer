"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const accountTemplate_model_1 = __importDefault(require("../models/accountTemplate.model"));
const accountTemplates_seed_1 = require("./accountTemplates.seed");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const seedAccountTemplates = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
        for (const template of accountTemplates_seed_1.accountTemplates) {
            await accountTemplate_model_1.default.updateOne({
                code: template.code,
            }, {
                $set: template,
            }, {
                upsert: true,
            });
        }
        console.log(`${accountTemplates_seed_1.accountTemplates.length} account templates seeded successfully`);
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error("Failed to seed account templates:", error);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
};
seedAccountTemplates();
