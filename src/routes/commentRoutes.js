const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentControllers');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/auth');

// Comment routes
router.post('/', authenticateToken, requireUser, commentController.createComment);
router.get('/post/:postId', commentController.getCommentsByPost);
router.put('/:id', authenticateToken, requireUser, commentController.updateComment);
router.delete('/:id', authenticateToken, requireUser, commentController.deleteComment);

// Admin comment management routes
router.get('/admin', authenticateToken, requireAdmin, commentController.getAllComments);
router.get('/admin/stats', authenticateToken, requireAdmin, commentController.getCommentStats);

module.exports = router;