/**
 * Doctor Portal Routes
 * 
 * Routes for doctor-specific operations.
 * All routes require authentication and doctor role.
 */
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');

// All routes require doctor role
router.use(authenticate);
router.use(requireRole(['doctor', 'admin']));

// Profile
router.get('/profile', doctorController.getMyProfile);

// Dashboard
router.get('/dashboard/summary', doctorController.getTodaysSummary);

// Appointments
router.get('/appointments', doctorController.getMyAppointments);
router.get('/appointments/:id', doctorController.getAppointmentById);
router.patch('/appointments/:id/status', doctorController.updateAppointmentStatus);
router.patch('/appointments/:id/notes', doctorController.saveAppointmentNotes);

// Availability
router.get('/availability', doctorController.getAvailability);
router.patch('/availability', doctorController.updateAvailability);

module.exports = router;
