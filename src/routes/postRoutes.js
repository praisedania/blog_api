const express = require('express');
const router = express.Router();
const postController = require('../controllers/postControllers');
const { authenticateToken } = require('../middleware/auth');

router.post('/api/posts', authenticateToken, postController.createPost);
router.get('/api/posts', postController.getAllPosts);
router.get('/api/posts/:id', authenticateToken, postController.getPostById);
router.put('/api/posts/:id', authenticateToken, postController.updatePost);
router.patch('/api/posts/:id', authenticateToken, postController.patchPost);
router.delete('/api/posts/:id', authenticateToken, postController.deletePost);

module.exports = router;