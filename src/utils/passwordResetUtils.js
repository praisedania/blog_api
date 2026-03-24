const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Constants
const PASSWORD_RESET_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const PASSWORD_RESET_EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

/**
 * Generate a random password reset token
 * @returns {string} A random token string
 */
const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} resetToken - Password reset token
 * @param {string} resetLink - Full reset link to send to user
 */
const sendPasswordResetEmail = async (email, resetLink) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured; skipping password reset email send.');
    return;
  }

  try {
    const data = await resend.emails.send({
      from: PASSWORD_RESET_EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: `
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <p>
          <a href="${resetLink}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">This link will expire in 15 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
      `,
    });
    console.log('Password reset email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

/**
 * Calculate expiry time for reset token
 * @returns {Date} Expiry date
 */
const getResetTokenExpiry = () => {
  return new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY);
};

module.exports = {
  generatePasswordResetToken,
  sendPasswordResetEmail,
  getResetTokenExpiry,
  PASSWORD_RESET_TOKEN_EXPIRY,
  PASSWORD_RESET_EMAIL_FROM
};
