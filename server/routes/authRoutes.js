/**
 * Auth Routes
 * 
 * Profile-related endpoints.
 * Note: Signup/Login/Logout handled by Supabase on frontend.
 */
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Get current user's profile
router.get('/profile', authenticate, authController.getProfile);

// Update current user's profile
router.put('/profile', authenticate, authController.updateProfile);

// Admin routes
router.get('/users', authenticate, requireRole('admin'), authController.listUsers);
router.get('/users/:id', authenticate, requireRole('admin'), authController.getUserById);

module.exports = router;
