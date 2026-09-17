import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const smtpPort = Number(process.env.SMTP_PORT || 587);

console.log("SMTP CONFIG:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

class EmailService {
  async sendEmail(to: string, subject: string, html: string) {
    if (!process.env.SMTP_HOST) {
      throw new Error("SMTP_HOST is not configured");
    }

    if (!process.env.SMTP_USER) {
      throw new Error("SMTP_USER is not configured");
    }

    if (!process.env.SMTP_PASSWORD) {
      throw new Error("SMTP_PASSWORD is not configured");
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);

    return info;
  }
}

export default new EmailService();
