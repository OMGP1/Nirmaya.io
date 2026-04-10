/**
 * Emergency Routes
 * 
 * SOS and proximity-based triage endpoints.
 * All routes require authentication.
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const emergencyController = require('../controllers/emergencyController');

// Find nearest doctors by GPS coordinates
router.post(
    '/nearest-doctors',
    authenticate,
    emergencyController.findNearestDoctors
);

// Trigger SOS emergency booking
router.post(
    '/sos',
    authenticate,
    emergencyController.triggerSOS
);

module.exports = router;
