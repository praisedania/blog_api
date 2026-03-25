const db = require('../../models');
const bcrypt = require('bcrypt');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.User.findByPk(userId, {
      attributes: ['id', 'userName', 'email', 'role', 'bio', 'avatar', 'website', 'location', 'createdAt', 'updatedAt'],
      include: [{
        model: db.Category,
        as: 'preferredCategories',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's post count
    const postsCount = await db.post.count({
      where: { userId, status: 'published' }
    });

    // Get user's likes count
    const likesCount = await db.like.count({
      where: { userId }
    });

    res.json({
      user,
      stats: {
        postsCount,
        likesCount
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdFromToken = req.user.id;

    // Users can only update their own profile
    if (parseInt(userId) !== userIdFromToken) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const { bio, avatar, website, location, categoryIds } = req.body;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'author' && categoryIds) {
      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({ message: 'categoryIds must be an array' });
      }
      const categories = await db.Category.findAll({
        where: { id: categoryIds }
      });
      if (categories.length !== categoryIds.length) {
        return res.status(400).json({ message: 'One or more category IDs are invalid.' });
      }
      await user.setPreferredCategories(categories);
    }

    // Update profile fields
    await user.update({
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar !== undefined ? avatar : user.avatar,
      website: website !== undefined ? website : user.website,
      location: location !== undefined ? location : user.location
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        website: user.website,
        location: user.location,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdFromToken = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Users can only change their own password
    if (parseInt(userId) !== userIdFromToken) {
      return res.status(403).json({ message: 'You can only change your own password' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's published posts
    const { count, rows: posts } = await db.post.findAndCountAll({
      where: {
        userId,
        status: 'published'
      },
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'userName', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      user: {
        id: user.id,
        userName: user.userName
      },
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      posts
    });
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserPosts
};