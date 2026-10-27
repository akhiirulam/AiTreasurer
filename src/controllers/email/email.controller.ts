import type { Request, Response } from "express";

import emailService from "../../services/email/email.service";

export const testEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });

      return;
    }

    await emailService.sendEmail(
      email,
      "AiTreasurer SMTP Test",
      `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #173f35;">
            AiTreasurer
          </h2>

          <p>
            This is a test email from AiTreasurer.
          </p>

          <p>
            Your SMTP configuration is working correctly.
          </p>
        </div>
      `,
    );

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("SMTP test failed:", error);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
    });
  }
};
