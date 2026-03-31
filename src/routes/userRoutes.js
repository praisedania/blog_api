const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const userSchemas = require('../utils/validation/userSchemas');

router.post('/signup', validate(userSchemas.signup), userController.createUser);
router.post('/signup-with-otp', validate(userSchemas.signup), userController.signupWithOtp);
router.post('/signup/verify', userController.verifySignupOtp);
router.post('/login', validate(userSchemas.login), userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Admin-only routes
router.post('/admin', authenticateToken, requireAdmin, validate(userSchemas.signup), userController.createUser);
router.get('/admin', authenticateToken, requireAdmin, userController.getAllUsers);
router.get('/admin/stats', authenticateToken, requireAdmin, userController.getUserStats);
router.put('/admin/:userId/role', authenticateToken, requireAdmin, userController.updateUserRole);
router.post('/admin/:userId/suspend', authenticateToken, requireAdmin, userController.suspendUser);
router.post('/admin/:userId/unsuspend', authenticateToken, requireAdmin, userController.unsuspendUser);

// Protected routes - require authentication
router.post('/become-author', authenticateToken, userController.upgradeToAuthor);
router.get('/', authenticateToken, userController.getAllUsersBasic);
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id', authenticateToken, userController.updateUser);
router.patch('/:id', authenticateToken, userController.patchUser);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

module.exports = router;
