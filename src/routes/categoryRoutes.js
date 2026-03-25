const express = require('express');
const router = express.Router();
const categoryControllers = require('../controllers/categoryControllers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', categoryControllers.getAllCategories);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, categoryControllers.createCategory);
router.put('/:id', authenticateToken, requireAdmin, categoryControllers.updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, categoryControllers.deleteCategory);

module.exports = router;
