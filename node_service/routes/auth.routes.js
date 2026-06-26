const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login 
router.post('/login', authController.login);

// GET /api/auth/me 
router.get('/me', authenticate, authController.me);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/verify-reset-otp
router.post('/verify-reset-otp', authController.verifyResetOtp);

// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
