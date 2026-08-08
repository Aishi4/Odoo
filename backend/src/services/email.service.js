const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const createTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('Warning: GMAIL_USER or GMAIL_APP_PASSWORD environment variables are missing.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

const sendPasswordResetEmail = async (toEmail, resetToken, userName = 'User') => {
  const transporter = createTransporter();
  const resetUrl = `http://localhost:5000/api/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Rental Management System" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Password Reset Request — Rental Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Rental Management System</h2>
        <hr style="border: none; border-top: 1px solid #e2e8f0;" />
        <p>Hello <strong>${userName}</strong>,</p>
        <p>We received a request to reset your password. Use the password reset token below or click the button to reset your password:</p>
        
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 6px; font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #0f172a; margin: 20px 0;">
          ${resetToken}
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>

        <p style="color: #64748b; font-size: 14px;">This password reset token will expire in <strong>15 minutes</strong>.</p>
        <p style="color: #64748b; font-size: 14px;">If you did not request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; Rental Management System. All rights reserved.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
};
