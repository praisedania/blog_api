const express = require('express');
const router = express.Router();
const postController = require('../controllers/postControllers');
const { authenticateToken, requireAdmin, requireAuthor } = require('../middleware/auth');

router.post('/api/posts', authenticateToken, requireAuthor, postController.createPost);
router.get('/api/posts', postController.getAllPosts);
router.get('/api/posts/:id', authenticateToken, postController.getPostById);
router.put('/api/posts/:id', authenticateToken, postController.updatePost);
router.patch('/api/posts/:id', authenticateToken, postController.patchPost);
router.delete('/api/posts/:id', authenticateToken, postController.deletePost);

// Admin-only post management routes
router.get('/api/admin/posts', authenticateToken, requireAdmin, postController.getAllPostsAdmin);
router.post('/api/admin/posts/:id/approve', authenticateToken, requireAdmin, postController.approvePost);
router.post('/api/admin/posts/:id/reject', authenticateToken, requireAdmin, postController.rejectPost);
router.get('/api/admin/posts/stats', authenticateToken, requireAdmin, postController.getPostStats);

module.exports = router;