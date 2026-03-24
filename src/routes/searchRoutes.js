const express = require('express');
const router = express.Router();
const searchControllers = require('../controllers/searchControllers');
const { authenticateToken } = require('../middleware/auth');

// Search posts (public - no auth required for basic search)
router.get('/posts', searchControllers.searchPosts);

// Search users (requires authentication for privacy)
router.get('/users', authenticateToken, searchControllers.searchUsers);

// Get trending posts (public)
router.get('/trending', searchControllers.getTrendingPosts);

module.exports = router;