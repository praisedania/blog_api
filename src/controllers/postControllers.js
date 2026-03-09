const db = require('../../models');

exports.createPost = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const newPost = await db.post.create({ title, content, author });
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
    const post = await db.post.update(req.body, {
      where: { id: req.params.id }
    });
    if (post[0] === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.patchPost = async (req, res) => {
  try {
    const post = await db.post.update(req.body, {
      where: { id: req.params.id }
    });
    if (post[0] === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const deleted = await db.post.destroy({
      where: { id: req.params.id }
    });
    if (deleted === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    return res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
