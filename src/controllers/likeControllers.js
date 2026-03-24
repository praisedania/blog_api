const db = require('../../models');

// Like a post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const postExists = await db.post.findByPk(postId);
    if (!postExists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const existingLike = await db.like.findOne({
      where: { userId, postId }
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    // Create like
    const newLike = await db.like.create({ userId, postId });

    res.status(201).json({
      message: 'Post liked successfully',
      like: newLike
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unlike a post
const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Find and delete the like
    const deletedLike = await db.like.destroy({
      where: { userId, postId }
    });

    if (deletedLike === 0) {
      return res.status(404).json({ message: 'Like not found' });
    }

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get likes for a post
const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const postExists = await db.post.findByPk(postId);
    if (!postExists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get likes count
    const likesCount = await db.like.count({
      where: { postId }
    });

    // Get likes with user details (optional, for displaying who liked)
    const likes = await db.like.findAll({
      where: { postId },
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });

    res.json({
      postId,
      likesCount,
      likes
    });
  } catch (error) {
    console.error('Error getting post likes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if user liked a post
const checkUserLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const userLike = await like.findOne({
      where: { userId, postId }
    });

    res.json({
      postId,
      userId,
      isLiked: !!userLike
    });
  } catch (error) {
    console.error('Error checking user like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  checkUserLike
};