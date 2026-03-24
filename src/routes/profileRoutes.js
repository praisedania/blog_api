const express = require('express');
const router = express.Router();
const profileControllers = require('../controllers/profileControllers');
const { authenticateToken } = require('../middleware/auth');

// Get user profile (public)
router.get('/users/:userId/profile', profileControllers.getUserProfile);

// Update user profile (requires authentication)
router.put('/users/:userId/profile', authenticateToken, profileControllers.updateUserProfile);

// Change password (requires authentication)
router.put('/users/:userId/password', authenticateToken, profileControllers.changePassword);

// Get user's posts (public)
router.get('/users/:userId/posts', profileControllers.getUserPosts);

module.exports = router;