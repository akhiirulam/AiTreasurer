import { Response } from "express";

import accountService from "../../services/account/account.service";

import { AuthenticatedRequest } from "../../middleware/auth.middleware";

/**
 * Create an account manually for the authenticated user.
 */
export const createAccount = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    console.log(userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, type, description } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Account name and type are required",
      });
    }

    const account = await accountService.createAccount(userId, {
      name,
      type,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: account,
    });
  } catch (error) {
    console.error("Create account error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create account",
    });
  }
};

/**
 * Create/get a user's account from a GLOBAL account template.
 */
export const createFromTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { templateName } = req.body;

    if (!templateName) {
      return res.status(400).json({
        success: false,
        message: "Template name is required",
      });
    }

    const account = await accountService.getOrCreateFromTemplate(
      userId,
      templateName,
    );

    return res.status(201).json({
      success: true,
      message: "Account created from template successfully",
      data: account,
    });
  } catch (error) {
    console.error("Create account from template error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create account from template";

    if (message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

/**
 * Get all accounts belonging to the authenticated user.
 */
export const getAccounts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const accounts = await accountService.getAccounts(userId);

    return res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Get accounts error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get accounts",
    });
  }
};

/**
 * Get one account belonging to the authenticated user.
 */
export const getAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: "Account ID is required",
      });
    }

    const account = await accountService.getAccount(userId, accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Get account error:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get account",
    });
  }
};

/**
 * Find an account by name for the authenticated user.
 */
export const findByName = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name } = req.query;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Account name is required",
      });
    }

    const account = await accountService.findByName(userId, name.trim());

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Find account by name error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to find account",
    });
  }
};

/**
 * Update an account belonging to the authenticated user.
 */
export const updateAccount = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: "Account ID is required",
      });
    }

    const { name, description, isActive } = req.body;

    const account = await accountService.updateAccount(userId, accountId, {
      name,
      description,
      isActive,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: account,
    });
  } catch (error) {
    console.error("Update account error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update account",
    });
  }
};

/**
 * Delete an account belonging to the authenticated user.
 */
export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: "Account ID is required",
      });
    }

    const account = await accountService.deleteAccount(userId, accountId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: account,
    });
  } catch (error) {
    console.error("Delete account error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to delete account";

    if (message === "Account not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (message === "System accounts cannot be deleted") {
      return res.status(403).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message,
    });
  }
};
