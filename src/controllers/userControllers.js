const db = require('../../models');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');

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
exports.signup = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const newUser = await db.User.create({ userName, email, password });
    return res.status(201).json(newUser);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.signupWithOtp = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await db.User.create({
      userName,
      email,
      password,
      isVerified: false,
      otpCode: otp,
      otpExpires,
    });

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
      return res.status(400).json({ message: 'User already verified.' });
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

exports.loginUserWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
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
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({
      token,
      user: {
        email: user.email,
        userName: user.userName,
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.loginUserWithUsername = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await db.User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { userName: userName }
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
    const token = jwt.sign({ id: user.id, userName: user.userName }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({
      token,
      user: {
        email: user.email,
        userName: user.userName,
        id: user.id,
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

exports.getAllUsers = async (req, res) => {
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
