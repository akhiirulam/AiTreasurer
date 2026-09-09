import { Request, Response } from "express";

import adminService from "../../services/admin/admin.service";
import asyncHandler from "../../utils/asyncHandler";

// =====================================================
// ADMIN DASHBOARD
// =====================================================

export const getAdminDashboard = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await adminService.getDashboard();

    return res.status(200).json({
      success: true,
      message: "Admin dashboard fetched successfully",
      data,
    });
  },
);

// =====================================================
// GET ALL USERS
// =====================================================

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await adminService.getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  },
);

// =====================================================
// GET USER BY ID
// =====================================================

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (typeof userId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const user = await adminService.getUserById(userId);

  return res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

// =====================================================
// UPDATE USER STATUS
// =====================================================

export const updateUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const { accountStatus } = req.body;

    if (typeof userId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await adminService.updateUserStatus(userId, accountStatus);

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  },
);
