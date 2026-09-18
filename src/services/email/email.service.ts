import dns from "node:dns";
import nodemailer from "nodemailer";

// Render may resolve smtp.gmail.com to IPv6.
// Prefer IPv4 for SMTP connections.
dns.setDefaultResultOrder("ipv4first");

const smtpPort = Number(process.env.SMTP_PORT || 587);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
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
