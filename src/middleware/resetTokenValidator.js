const db = require('../../models');

/**
 * Middleware to validate password reset token
 * Checks if the token exists and hasn't expired
 * Attaches user to req.user if valid
 */
const validateResetToken = async (req, res, next) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        message: 'Email and reset token are required.'
      });
    }

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    // Check if reset token exists
    if (!user.resetPasswordToken) {
      return res.status(400).json({
        message: 'No password reset request found.'
      });
    }

    // Check if token matches
    if (user.resetPasswordToken !== token) {
      return res.status(401).json({
        message: 'Invalid reset token.'
      });
    }

    // Check if token has expired
    if (new Date() > user.resetPasswordExpires) {
      return res.status(401).json({
        message: 'Reset token has expired.'
      });
    }

    // Attach user to request for use in controller
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { validateResetToken };
