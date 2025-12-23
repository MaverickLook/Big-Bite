import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM;

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const useSendgrid = process.env.NODE_ENV === "production" && !!SENDGRID_API_KEY;

if (useSendgrid) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("Email: using SendGrid in production");
}

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587", 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

let transporter = null;
let isEmailConfigured = false;

if (!useSendgrid && EMAIL_USER && EMAIL_PASSWORD) {
  try {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
    });
    isEmailConfigured = true;
    console.log("Email: local SMTP transporter created");
  } catch (err) {
    console.error("Email: failed to create local SMTP transporter:", err.message);
  }
}

console.log("\n=== EMAIL SERVICE CONFIGURATION ===");
console.log("NODE_ENV:", process.env.NODE_ENV || "undefined");
console.log("Using SendGrid:", useSendgrid ? "✓" : "✗");
console.log("EMAIL_USER:", EMAIL_USER ? "✓ Set" : "✗ Not set (used only locally)");
console.log("EMAIL_FROM:", EMAIL_FROM || EMAIL_USER || "Not set");
console.log("CLIENT_URL:", CLIENT_URL);
console.log("===================================\n");


export const sendPasswordResetEmail = async (
  email,
  resetToken,
  userName = "User"
) => {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;

  console.log("\n=== ATTEMPTING TO SEND PASSWORD RESET EMAIL ===");
  console.log("To:", email);
  console.log("User:", userName);
  console.log("Using SendGrid:", useSendgrid);
  console.log("SMTP configured:", isEmailConfigured);
  console.log("=============================================\n");

  const subject = "Reset Your Password - Big-Bite Restaurant";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .button:hover { background-color: #e55a28; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Big-Bite Restaurant</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Big-Bite Restaurant. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hello ${userName},

You requested to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

© ${new Date().getFullYear()} Big-Bite Restaurant. All rights reserved.
  `;

  const FROM_ADDRESS = EMAIL_FROM || EMAIL_USER;

  if (useSendgrid) {
    try {
      await sgMail.send({
        to: email,
        from: FROM_ADDRESS,
        subject,
        html,
        text,
      });
      console.log("✓ Password reset email sent via SendGrid\n");
      return;
    } catch (error) {
      console.error("✗ ERROR SENDING EMAIL VIA SENDGRID:", error.message);
      if (error.response) {
        console.error("SendGrid response:", error.response.body);
      }
      throw new Error(`Failed to send email via SendGrid: ${error.message}`);
    }
  }

  if (!transporter || !isEmailConfigured) {
    console.log("\n⚠️ EMAIL NOT CONFIGURED LOCALLY - RESET LINK (for testing):");
    console.log("Reset Link:", resetUrl);
    console.log("=============================================\n");
    return;
  }

  try {
    console.log("Sending email via local SMTP...");
    const info = await transporter.sendMail({
      from: `"Big-Bite Restaurant" <${FROM_ADDRESS}>`,
      to: email,
      subject,
      html,
      text,
    });
    console.log("✓ Email sent via SMTP. Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("✗ ERROR SENDING EMAIL VIA SMTP:", error.message);
    throw new Error(`Failed to send email via SMTP: ${error.message}`);
  }
};

export const verifyEmailConfig = async () => {
  if (useSendgrid) {
    return true;
  }
  if (!EMAIL_USER || !EMAIL_PASSWORD || !transporter) {
    console.warn("⚠️ Email service not configured for local SMTP.");
    return false;
  }
  try {
    await transporter.verify();
    console.log("✓ Local SMTP email service verified");
    return true;
  } catch (error) {
    console.error("✗ Local SMTP verification failed:", error.message);
    return false;
  }
};

export const getEmailConfigStatus = () => ({
  usingSendgrid: useSendgrid,
  configured: useSendgrid ? !!SENDGRID_API_KEY : isEmailConfigured,
  hasUser: !!EMAIL_USER,
  hasPassword: !!EMAIL_PASSWORD,
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  from: EMAIL_FROM,
  clientUrl: CLIENT_URL,
});
