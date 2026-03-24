const db = require('../../models');
const userController = require('../controllers/userControllers');


/***** Post Controllers *****/
exports.createPost = async (req, res) => {
  try {
    const { title, content, status = 'published' } = req.body;
    const author = req.user.userName || req.user.email;
    const userId = req.user.id;

    // Validate status for different roles
    const validStatuses = req.user.role === 'admin' ? ['draft', 'pending', 'published', 'rejected'] :
                         req.user.role === 'author' ? ['draft', 'published'] :
                         ['published']; // regular users can only create published posts

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed statuses: ${validStatuses.join(', ')}`
      });
    }

    const newPost = await db.post.create({ title, content, author, userId, status });
    return res.status(201).json(newPost);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    let whereClause = {};

    // Regular users only see published posts
    if (!req.user || req.user.role === 'user') {
      whereClause.status = 'published';
    }
    // Authors and admins see all posts except rejected ones (unless they're the author)
    else if (req.user.role === 'author' || req.user.role === 'admin') {
      // Authors see their own posts + all published posts
      // Admins see all posts
      if (req.user.role === 'author') {
        whereClause = {
          [db.Sequelize.Op.or]: [
            { status: 'published' },
            { userId: req.user.id }
          ]
        };
      }
      // Admins see everything
    }

    const posts = await db.post.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await db.post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check permissions
    if (post.status !== 'published') {
      // Only published posts are visible to non-authenticated users
      if (!req.user) {
        return res.status(404).json({ message: 'Post not found.' });
      }

      // Authors can see their own posts, admins can see all posts
      if (req.user.role === 'user' ||
          (req.user.role === 'author' && post.userId !== req.user.id)) {
        return res.status(404).json({ message: 'Post not found.' });
      }
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await db.post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check ownership permissions
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own posts.' });
    }

    // Validate status updates for authors
    if (req.body.status && req.user.role === 'author') {
      const allowedStatuses = ['draft', 'published'];
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: 'Authors can only set status to draft or published.'
        });
      }
    }

    await post.update(req.body);
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.patchPost = async (req, res) => {
  try {
    const post = await db.post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check ownership permissions
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own posts.' });
    }

    // Validate status updates for authors
    if (req.body.status && req.user.role === 'author') {
      const allowedStatuses = ['draft', 'published'];
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: 'Authors can only set status to draft or published.'
        });
      }
    }

    await post.update(req.body);
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await db.post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check ownership permissions - only post owners can delete
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await post.destroy();
    return res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/***** Admin Post Management *****/
exports.getAllPostsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, author } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (author) whereClause.author = { [db.Sequelize.Op.like]: `%${author}%` };

    const { count, rows: posts } = await db.post.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['userName', 'email', 'role']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      posts,
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

exports.approvePost = async (req, res) => {
  try {
    const post = await db.post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    await post.update({
      status: 'published',
      moderationReason: null
    });

    return res.status(200).json({
      message: 'Post approved successfully.',
      post
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;

    const post = await db.post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    await post.update({
      status: 'rejected',
      moderationReason: reason
    });

    return res.status(200).json({
      message: 'Post rejected.',
      post
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getPostStats = async (req, res) => {
  try {
    const totalPosts = await db.post.count();
    const publishedPosts = await db.post.count({ where: { status: 'published' } });
    const pendingPosts = await db.post.count({ where: { status: 'pending' } });
    const rejectedPosts = await db.post.count({ where: { status: 'rejected' } });
    const draftPosts = await db.post.count({ where: { status: 'draft' } });

    const statusStats = await db.post.findAll({
      attributes: [
        'status',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    return res.status(200).json({
      totalPosts,
      publishedPosts,
      pendingPosts,
      rejectedPosts,
      draftPosts,
      statusBreakdown: statusStats
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

