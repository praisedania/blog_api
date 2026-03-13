const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

router.post('/api/users/signup', userController.signup);
router.post('/api/users/signup-with-otp', userController.signupWithOtp);
router.post('/api/users/signup/verify', userController.verifySignupOtp);
router.post('/api/users/emaillogin', userController.loginUserWithEmail);
router.post('/api/users/usernamelogin', userController.loginUserWithUsername);
router.get('/api/users', userController.getUser);
router.get('/api/users', userController.getAllUsers);
router.get('/api/users/:id', userController.getUserById);
router.put('/api/users/:id', userController.updateUser);
router.patch('/api/users/:id', userController.patchUser);
router.delete('/api/users/:id', userController.deleteUser);

module.exports = router;
