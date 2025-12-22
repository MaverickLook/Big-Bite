import nodemailer from 'nodemailer';

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Log email configuration status on module load
console.log('\n=== EMAIL SERVICE CONFIGURATION ===');
console.log('EMAIL_HOST:', EMAIL_HOST);
console.log('EMAIL_PORT:', EMAIL_PORT);
console.log('EMAIL_USER:', EMAIL_USER ? '✓ Set' : '✗ Not set');
console.log('EMAIL_PASSWORD:', EMAIL_PASSWORD ? '✓ Set' : '✗ Not set');
console.log('EMAIL_FROM:', EMAIL_FROM || 'Not set');
console.log('CLIENT_URL:', CLIENT_URL);
console.log('===================================\n');

// Create transporter (only if credentials are provided)
let transporter = null;
let isEmailConfigured = false;

if (EMAIL_USER && EMAIL_PASSWORD) {
  try {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST || 'smtp.gmail.com',
      port: EMAIL_PORT || 587,
      secure: (EMAIL_PORT || 587) === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
      connectionTimeout: 5000, // 5 seconds
      socketTimeout: 5000, // 5 seconds
    });
    isEmailConfigured = true;
    console.log('✓ Email transporter created successfully');
  } catch (error) {
    console.error('✗ Failed to create email transporter:', error.message);
  }
} else {
  console.warn('⚠️  Email credentials not configured. Password reset emails will be logged to console only.');
}

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (email, resetToken, userName = 'User') => {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;

  console.log('\n=== ATTEMPTING TO SEND PASSWORD RESET EMAIL ===');
  console.log('To:', email);
  console.log('User:', userName);
  console.log('Email configured:', isEmailConfigured);
  console.log('Transporter available:', transporter !== null);

  if (!transporter || !isEmailConfigured) {
    // Email not configured, just log to console
    console.log('\n⚠️  EMAIL NOT CONFIGURED - RESET LINK (for testing):');
    console.log('Reset Link:', resetUrl);
    console.log('=============================================\n');
    return;
  }

  const mailOptions = {
    from: `"Big-Bite Restaurant" <${EMAIL_FROM || EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Big-Bite Restaurant',
    html: `
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
    `,
    text: `
      Hello ${userName},

      You requested to reset your password. Click the link below to create a new password:

      ${resetUrl}

      This link will expire in 1 hour.

      If you didn't request this password reset, please ignore this email.

      © ${new Date().getFullYear()} Big-Bite Restaurant. All rights reserved.
    `,
  };

  try {
    console.log('Sending email via SMTP...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response || 'No response');
    console.log('=============================================\n');
    return info;
  } catch (error) {
    console.error('✗ ERROR SENDING EMAIL:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Command:', error.command);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    console.error('=============================================\n');
    
    // Log helpful troubleshooting info for timeout errors
    if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  TROUBLESHOOTING ETIMEDOUT:');
      console.error('1. Verify Gmail credentials in .env file');
      console.error('2. Generate a new app password: https://myaccount.google.com/apppasswords');
      console.error('3. Make sure you have 2FA enabled on your Gmail account');
      console.error('4. Check if Gmail is blocking this connection');
      console.error('5. Try using your email password instead of app password\n');
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Verify email service configuration
 */
export const verifyEmailConfig = async () => {
  if (!EMAIL_USER || !EMAIL_PASSWORD || !transporter) {
    console.warn('⚠️  Email service not configured. Password reset emails will be logged to console only.');
    console.warn('   Set EMAIL_USER, EMAIL_PASSWORD, and EMAIL_HOST in your .env file to enable email sending.');
    return false;
  }

  try {
    console.log('Verifying email service connection...');
    await transporter.verify();
    console.log('✓ Email service verified and ready');
    return true;
  } catch (error) {
    console.error('✗ Email service verification failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    return false;
  }
};

// Export configuration status
export const getEmailConfigStatus = () => ({
  configured: isEmailConfigured,
  hasUser: !!EMAIL_USER,
  hasPassword: !!EMAIL_PASSWORD,
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  from: EMAIL_FROM,
  clientUrl: CLIENT_URL,
});

