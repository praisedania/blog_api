const db = require('../../models');
const { Op } = require('sequelize');

// Search posts
const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10, categoryId, author, status } = req.query;

    const offset = (page - 1) * limit;

    const whereConditions = [];

    // Base condition for regular search
    let searchStatus = 'published';
    if (status && ['published', 'draft', 'pending', 'rejected'].includes(status)) {
      searchStatus = status;
    }
    whereConditions.push({ status: searchStatus });

    // Optional text query
    if (q && q.trim().length > 0) {
      whereConditions.push({
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { content: { [Op.like]: `%${q}%` } }
        ]
      });
    }

    if (categoryId) {
      whereConditions.push({ categoryId: categoryId });
    }

    if (author) {
      whereConditions.push({ author: { [Op.like]: `%${author}%` } });
    }

    // You must provide at least one search mechanic
    if (whereConditions.length === 1 && !categoryId && !author) {
       return res.status(400).json({ message: 'At least one search parameter (q, categoryId, or author) is required' });
    }

    // Search in title and content
    const { count, rows: posts } = await db.post.findAndCountAll({
      where: {
        [Op.and]: whereConditions
      },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'userName', 'email']
        },
        {
          model: db.Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
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
    const { q, page = 1, limit = 10, categoryId } = req.query;

    if (!q && !categoryId) {
      return res.status(400).json({ message: 'Search query or categoryId is required' });
    }

    const offset = (page - 1) * limit;

    const userConditions = [{ isSuspended: false }];
    
    if (q && q.trim().length > 0) {
      userConditions.push({
        [Op.or]: [
          { userName: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      });
    }

    if (categoryId) {
      userConditions.push({
        '$preferredCategories.id$': categoryId
      });
    }

    const { count, rows: users } = await db.User.findAndCountAll({
      where: {
        [Op.and]: userConditions
      },
      attributes: ['id', 'userName', 'email', 'role', 'bio', 'avatar', 'website', 'location', 'createdAt'],
      include: [{
        model: db.Category,
        as: 'preferredCategories',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['userName', 'ASC']]
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
          attributes: ['id', 'userName', 'email']
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

// Redundant local getCategories removed in favor of categoryControllers.js


module.exports = {
  searchPosts,
  searchUsers,
  getTrendingPosts
};










