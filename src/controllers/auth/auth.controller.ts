import { Request, Response } from "express";

import userRegistrationService from "../../services/auth/userRegistration.service";
import asyncHandler from "../../utils/asyncHandler";

export const userRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userRegistrationService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  },
);
