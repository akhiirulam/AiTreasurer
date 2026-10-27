import { Request, Response } from "express";
import accountTemplateService from "../../services/account/accountTemplate.service";

/**
 * Create a single account template
 * POST /api/account-templates
 */
export const createTemplate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const template = await accountTemplateService.createTemplate(req.body);

    res.status(201).json({
      success: true,
      message: "Account template created successfully",
      data: template,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create account template",
    });
  }
};

/**
 * Get all account templates
 *
 * GET /api/account-templates
 * GET /api/account-templates?type=expense
 * GET /api/account-templates?category=operating_expense
 */
export const getTemplates = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { type, category } = req.query;

    let templates;

    if (type) {
      templates = await accountTemplateService.getTemplatesByType(String(type));
    } else if (category) {
      templates = await accountTemplateService.getTemplatesByCategory(
        String(category),
      );
    } else {
      templates = await accountTemplateService.getAllTemplates();
    }

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch account templates",
    });
  }
};

/**
 * Get one account template
 * GET /api/account-templates/:id
 */
export const getTemplate = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const template = await accountTemplateService.getTemplate(req.params.id);

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Account template not found",
    });
  }
};

/**
 * Update account template
 * PUT /api/account-templates/:id
 */
export const updateTemplate = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const template = await accountTemplateService.updateTemplate(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Account template updated successfully",
      data: template,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update account template",
    });
  }
};

/**
 * Deactivate account template
 * DELETE /api/account-templates/:id
 */
export const deleteTemplate = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const template = await accountTemplateService.deleteTemplate(req.params.id);

    res.status(200).json({
      success: true,
      message: "Account template deactivated successfully",
      data: template,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Account template not found",
    });
  }
};
