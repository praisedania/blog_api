const express = require('express');
const router = express.Router();
const profileControllers = require('../controllers/profileControllers');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const userSchemas = require('../utils/validation/userSchemas');

// Get user profile (public)
router.get('/:userId', profileControllers.getUserProfile);

// Update user profile (requires authentication)
router.put('/:userId', authenticateToken, validate(userSchemas.updateProfile), profileControllers.updateUserProfile);

// Change password (requires authentication)
router.put('/:userId/password', authenticateToken, profileControllers.changePassword);

// Get user's posts (public)
router.get('/:userId/posts', profileControllers.getUserPosts);

module.exports = router;