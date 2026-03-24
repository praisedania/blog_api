const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/api/users/signup', userController.createUser);
router.post('/api/users/signup-with-otp', userController.signupWithOtp);
router.post('/api/users/signup/verify', userController.verifySignupOtp);
router.post('/api/users/emaillogin', userController.loginUserWithEmail);
router.post('/api/users/usernamelogin', userController.loginUserWithUsername);
router.post('/api/users/forgot-password', userController.forgotPassword);
router.post('/api/users/reset-password', userController.resetPassword);

// Protected routes - require authentication
router.get('/api/users', authenticateToken, userController.getAllUsersBasic);
router.get('/api/users/:id', authenticateToken, userController.getUserById);
router.put('/api/users/:id', authenticateToken, userController.updateUser);
router.patch('/api/users/:id', authenticateToken, userController.patchUser);
router.delete('/api/users/:id', authenticateToken, requireAdmin, userController.deleteUser);

// Admin-only routes
router.post('/api/admin/users', authenticateToken, requireAdmin, userController.createUser);
router.get('/api/admin/users', authenticateToken, requireAdmin, userController.getAllUsers);
router.put('/api/admin/users/:userId/role', authenticateToken, requireAdmin, userController.updateUserRole);
router.post('/api/admin/users/:userId/suspend', authenticateToken, requireAdmin, userController.suspendUser);
router.post('/api/admin/users/:userId/unsuspend', authenticateToken, requireAdmin, userController.unsuspendUser);
router.get('/api/admin/stats', authenticateToken, requireAdmin, userController.getUserStats);

module.exports = router;
