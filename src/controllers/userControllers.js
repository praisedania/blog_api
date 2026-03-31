const db = require('../../models');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');
const { generatePasswordResetToken, sendPasswordResetEmail, getResetTokenExpiry } = require('../utils/passwordResetUtils');

const resend = new Resend(process.env.RESEND_API_KEY);

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpEmail = async (to, otp) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured; skipping OTP email send.');
    return;
  }

  const from = process.env.EMAIL_FROM || 'noreply@yourdomain.com'; // Update to your verified domain
  try {
    const data = await resend.emails.send({
      from: from,
      to: to,
      subject: 'Your verification code',
      text: `Your verification code is: ${otp}`,
      html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
    });
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

/***** User Controllers *****/
exports.createUser = async (req, res) => {
  try {
    const { userName, email, password, role = 'user', categoryIds } = req.body;

    let categories = [];
    if (role === 'author' && categoryIds) {
      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({ message: 'categoryIds must be an array of IDs' });
      }
      categories = await db.Category.findAll({
        where: { id: categoryIds }
      });
      if (categories.length !== categoryIds.length) {
        return res.status(400).json({ message: 'One or more category IDs are invalid.' });
      }
    }

    const newUser = await db.User.create({ userName, email, password, role });
    
    if (categories.length > 0) {
      await newUser.setPreferredCategories(categories);
    }

    return res.status(201).json({
      id: newUser.id,
      userName: newUser.userName,
      email: newUser.email,
      role: newUser.role,
      categories: categories.map(c => ({ id: c.id, name: c.name })),
      createdAt: newUser.createdAt
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.signupWithOtp = async (req, res) => {
  try {
    const { userName, email, password, role = 'user', categoryIds } = req.body;

    // Only admins can create users with roles other than 'user'
    if (role !== 'user' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Only admins can assign roles' });
    }

    let categories = [];
    if (role === 'author' && categoryIds) {
      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({ message: 'categoryIds must be an array of IDs' });
      }
      categories = await db.Category.findAll({
        where: { id: categoryIds }
      });
      if (categories.length !== categoryIds.length) {
        return res.status(400).json({ message: 'One or more category IDs are invalid.' });
      }
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await db.User.create({
      userName,
      email,
      password,
      role,
      isVerified: false,
      otpCode: otp,
      otpExpires,
    });

    if (categories.length > 0) {
      await newUser.setPreferredCategories(categories);
    }

    // Send OTP email (best-effort; errors are logged but do not fail signup)
    try {
      await sendOtpEmail(email, otp);
    } catch (mailErr) {
      console.warn('Failed to send verification email:', mailErr.message);
    }

    return res.status(201).json({
      message: 'User created. A verification code was sent to your email.',
      userId: newUser.id,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email verified.' });
    }

    if (!user.otpCode || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP pending verification.' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new code.' });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    return res.json({ message: 'User verified successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, userName, password } = req.body;
    
    // Find user by email or userName
    const user = await db.User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          email ? { email: email } : null,
          userName ? { userName: userName } : null
        ].filter(Boolean)
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Create a payload for the JWT
    const payload = { 
      id: user.id, 
      email: user.email, 
      userName: user.userName, 
      role: user.role 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.json({
      token,
      user: {
        email: user.email,
        userName: user.userName,
        id: user.id,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getUser= async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const user = await db.User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { userName: userName },
          { email: email }
        ]
      }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllUsersBasic = async (req, res) => {
  try {
    const users = await db.User.findAll();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await db.User.update(req.body, {
      where: { id: req.params.id }
    });
    if (user[0] === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.patchUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    await user.update(req.body);
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await db.User.destroy({
      where: { id: req.params.id }
    });
    if (user === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/***** Password Reset Controllers *****/
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        message: "A password reset link has been sent."
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    const resetTokenExpiry = getResetTokenExpiry();

    // Save token to database
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    });

    // Build reset link - adjust the URL based on your frontend
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;

    // Send email
    try {
      await sendPasswordResetEmail(email, resetLink);
    } catch (mailErr) {
      console.warn('Failed to send password reset email:', mailErr.message);
      // Still return success to avoid revealing whether email was sent
    }

    return res.status(200).json({
      message: 'A password reset link has been sent.'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;

    if (!email || !token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'Email, token, and new password are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.'
      });
    }

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify token exists and hasn't expired
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({
        message: 'No password reset request found. Please request a new password reset.'
      });
    }

    if (user.resetPasswordToken !== token) {
      return res.status(400).json({
        message: 'Invalid reset token.'
      });
    }

    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({
        message: 'Reset token has expired. Please request a new password reset.'
      });
    }

    // Update password and clear reset token
    await user.update({
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return res.status(200).json({
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



exports.upgradeToAuthor = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryIds } = req.body;

    const user = await db.User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin users cannot change their role via this endpoint.' });
    }

    if (user.role === 'author') {
      return res.status(400).json({ message: 'User is already an author.' });
    }

    let categories = [];
    if (categoryIds) {
      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({ message: 'categoryIds must be an array of IDs' });
      }
      categories = await db.Category.findAll({
        where: { id: categoryIds }
      });
      if (categories.length !== categoryIds.length) {
        return res.status(400).json({ message: 'One or more category IDs are invalid.' });
      }
    }

    await user.update({ role: 'author' });

    if (categories.length > 0) {
      await user.setPreferredCategories(categories);
    }

    return res.status(200).json({
      message: 'Successfully upgraded to author.',
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        categories: categories.map(c => ({ id: c.id, name: c.name }))
      }
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/***** Role Management Controllers (Admin Only) *****/
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'author', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be one of: user, author, admin'
      });
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent admin from demoting themselves
    if (userId == req.user.id && role !== 'admin') {
      return res.status(400).json({
        message: 'Cannot change your own admin role.'
      });
    }

    await user.update({ role });

    return res.status(200).json({
      message: 'User role updated successfully.',
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = role ? { role } : {};

    const { count, rows: users } = await db.User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'userName', 'email', 'role', 'isVerified', 'createdAt', 'updatedAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await db.User.count();
    const verifiedUsers = await db.User.count({ where: { isVerified: true } });
    const suspendedUsers = await db.User.count({ where: { isSuspended: true } });
    const roleStats = await db.User.findAll({
      attributes: [
        'role',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('role')), 'count']
      ],
      group: ['role']
    });

    return res.status(200).json({
      totalUsers,
      verifiedUsers,
      suspendedUsers,
      activeUsers: totalUsers - suspendedUsers,
      roleBreakdown: roleStats
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/***** User Suspension Management (Admin Only) *****/
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent suspending admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend admin users.' });
    }

    // Prevent self-suspension
    if (userId == req.user.id) {
      return res.status(400).json({ message: 'Cannot suspend yourself.' });
    }

    await user.update({ isSuspended: true });

    return res.status(200).json({
      message: 'User suspended successfully.',
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        isSuspended: user.isSuspended,
        suspendedReason: reason || null
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await user.update({ isSuspended: false });

    return res.status(200).json({
      message: 'User unsuspended successfully.',
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        isSuspended: user.isSuspended
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
