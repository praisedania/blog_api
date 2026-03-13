const db = require('../../models');
const userController = require('../controllers/userControllers');


/***** Post Controllers *****/
exports.createPost = async (req, res) => {
  
  try {
    const { title, content } = req.body;
    const author = req.user.userName || req.user.email; // Use authenticated user's info
    const userId = req.user.id;
    const newPost = await db.post.create({ title, content, author, userId });
    return res.status(201).json(newPost);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await db.post.findAll();
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
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own posts.' });
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
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own posts.' });
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
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }
    await post.destroy();
    return res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


