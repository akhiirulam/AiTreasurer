"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.getTemplate = exports.getTemplates = exports.createTemplate = void 0;
const accountTemplate_service_1 = __importDefault(require("../../services/account/accountTemplate.service"));
/**
 * Create a single account template
 * POST /api/account-templates
 */
const createTemplate = async (req, res) => {
    try {
        const template = await accountTemplate_service_1.default.createTemplate(req.body);
        res.status(201).json({
            success: true,
            message: "Account template created successfully",
            data: template,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to create account template",
        });
    }
};
exports.createTemplate = createTemplate;
/**
 * Get all account templates
 *
 * GET /api/account-templates
 * GET /api/account-templates?type=expense
 * GET /api/account-templates?category=operating_expense
 */
const getTemplates = async (req, res) => {
    try {
        const { type, category } = req.query;
        let templates;
        if (type) {
            templates = await accountTemplate_service_1.default.getTemplatesByType(String(type));
        }
        else if (category) {
            templates = await accountTemplate_service_1.default.getTemplatesByCategory(String(category));
        }
        else {
            templates = await accountTemplate_service_1.default.getAllTemplates();
        }
        res.status(200).json({
            success: true,
            count: templates.length,
            data: templates,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to fetch account templates",
        });
    }
};
exports.getTemplates = getTemplates;
/**
 * Get one account template
 * GET /api/account-templates/:id
 */
const getTemplate = async (req, res) => {
    try {
        const template = await accountTemplate_service_1.default.getTemplate(req.params.id);
        res.status(200).json({
            success: true,
            data: template,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error instanceof Error ? error.message : "Account template not found",
        });
    }
};
exports.getTemplate = getTemplate;
/**
 * Update account template
 * PUT /api/account-templates/:id
 */
const updateTemplate = async (req, res) => {
    try {
        const template = await accountTemplate_service_1.default.updateTemplate(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Account template updated successfully",
            data: template,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to update account template",
        });
    }
};
exports.updateTemplate = updateTemplate;
/**
 * Deactivate account template
 * DELETE /api/account-templates/:id
 */
const deleteTemplate = async (req, res) => {
    try {
        const template = await accountTemplate_service_1.default.deleteTemplate(req.params.id);
        res.status(200).json({
            success: true,
            message: "Account template deactivated successfully",
            data: template,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error instanceof Error ? error.message : "Account template not found",
        });
    }
};
exports.deleteTemplate = deleteTemplate;
