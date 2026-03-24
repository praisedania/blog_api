const express = require('express');
const router = express.Router();
const likeControllers = require('../controllers/likeControllers');
const { authenticateToken } = require('../middleware/auth');

// All like routes require authentication
router.use(authenticateToken);

// Like a post
router.post('/:postId/like', likeControllers.likePost);

// Unlike a post
router.delete('/:postId/like', likeControllers.unlikePost);

// Get likes for a post
router.get('/:postId/likes', likeControllers.getPostLikes);

// Check if user liked a post
router.get('/:postId/like-status', likeControllers.checkUserLike);

module.exports = router;