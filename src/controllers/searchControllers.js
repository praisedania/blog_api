const db = require('../../models');
const { Op } = require('sequelize');

// Search posts
const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const offset = (page - 1) * limit;

    // Search in title and content
    const { count, rows: posts } = await db.post.findAndCountAll({
      where: {
        [Op.and]: [
          {
            status: 'published' // Only search published posts
          },
          {
            [Op.or]: [
              { title: { [Op.like]: `%${q}%` } },
              { content: { [Op.like]: `%${q}%` } }
            ]
          }
        ]
      },
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      query: q,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      posts
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const offset = (page - 1) * limit;

    // Search in username and email
    const { count, rows: users } = await db.User.findAndCountAll({
      where: {
        [Op.and]: [
          { isSuspended: false }, // Only search active users
          {
            [Op.or]: [
              { username: { [Op.like]: `%${q}%` } },
              { email: { [Op.like]: `%${q}%` } }
            ]
          }
        ]
      },
      attributes: ['id', 'username', 'email', 'role', 'bio', 'avatar', 'website', 'location', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['username', 'ASC']]
    });

    res.json({
      query: q,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get trending posts (most liked in last 7 days)
const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get posts from last 7 days with like counts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await db.post.findAll({
      where: {
        status: 'published',
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: db.like,
          as: 'likes',
          attributes: []
        }
      ],
      attributes: {
        include: [
          [
            db.sequelize.fn('COUNT', db.sequelize.col('likes.id')),
            'likesCount'
          ]
        ]
      },
      group: ['post.id', 'user.id'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('likes.id')), 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      trending: posts
    });
  } catch (error) {
    console.error('Error getting trending posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  searchPosts,
  searchUsers,
  getTrendingPosts
};










