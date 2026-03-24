const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentControllers');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/auth');

// Comment routes
router.post('/api/comments', authenticateToken, requireUser, commentController.createComment);
router.get('/api/posts/:postId/comments', commentController.getCommentsByPost);
router.put('/api/comments/:id', authenticateToken, requireUser, commentController.updateComment);
router.delete('/api/comments/:id', authenticateToken, requireUser, commentController.deleteComment);

// Admin comment management routes
router.get('/api/admin/comments', authenticateToken, requireAdmin, commentController.getAllComments);
router.get('/api/admin/comments/stats', authenticateToken, requireAdmin, commentController.getCommentStats);

module.exports = router;