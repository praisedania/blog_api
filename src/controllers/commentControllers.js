const db = require('../../models');

/***** Comment Controllers *****/
exports.createComment = async (req, res) => {
  try {
    const { content, postId, parentId } = req.body;
    const userId = req.user.id;

    // Validate that the post exists and is published
    const post = await db.post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.status !== 'published') {
      return res.status(400).json({ message: 'Cannot comment on unpublished posts.' });
    }

    // If parentId is provided, validate that parent comment exists
    if (parentId) {
      const parentComment = await db.comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found.' });
      }
      // Ensure parent comment belongs to the same post
      if (parentComment.postId !== parseInt(postId)) {
        return res.status(400).json({ message: 'Parent comment must belong to the same post.' });
      }
    }

    const newComment = await db.comment.create({
      content,
      postId,
      userId,
      parentId: parentId || null
    });

    // Fetch the created comment with user information
    const commentWithUser = await db.comment.findByPk(newComment.id, {
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['userName', 'email']
      }]
    });

    return res.status(201).json(commentWithUser);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Validate that the post exists
    const post = await db.post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Only show comments on published posts
    if (post.status !== 'published') {
      return res.status(200).json([]);
    }

    const comments = await db.comment.findAll({
      where: { postId, parentId: null }, // Only top-level comments
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['userName', 'email']
        },
        {
          model: db.comment,
          as: 'replies',
          include: [{
            model: db.User,
            as: 'user',
            attributes: ['userName', 'email']
          }]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await db.comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Only comment author can update
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own comments.' });
    }

    await comment.update({ content });

    // Return updated comment with user info
    const updatedComment = await db.comment.findByPk(req.params.id, {
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['userName', 'email']
      }]
    });

    return res.json(updatedComment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await db.comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Check permissions: comment author or post author or admin can delete
    const post = await db.post.findByPk(comment.postId);
    const canDelete = comment.userId === req.user.id || // Comment author
                     post.userId === req.user.id || // Post author
                     req.user.role === 'admin'; // Admin

    if (!canDelete) {
      return res.status(403).json({ message: 'You do not have permission to delete this comment.' });
    }

    await comment.destroy();
    return res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/***** Admin Comment Management *****/
exports.getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 10, postId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = postId ? { postId } : {};

    const { count, rows: comments } = await db.comment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['userName', 'email', 'role']
        },
        {
          model: db.post,
          as: 'post',
          attributes: ['id', 'title', 'status']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      comments,
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

exports.getCommentStats = async (req, res) => {
  try {
    const totalComments = await db.comment.count();
    const commentsByPost = await db.comment.findAll({
      attributes: [
        'postId',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('postId')), 'count']
      ],
      include: [{
        model: db.post,
        as: 'post',
        attributes: ['title']
      }],
      group: ['postId'],
      order: [[db.Sequelize.fn('COUNT', db.Sequelize.col('postId')), 'DESC']],
      limit: 10
    });

    return res.status(200).json({
      totalComments,
      topCommentedPosts: commentsByPost
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};