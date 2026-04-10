/**
 * Appointment Routes
 */
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const appointmentsController = require('../controllers/appointmentsController');
const {
    createAppointmentSchema,
    rescheduleSchema,
    cancelSchema,
    listQuerySchema,
    idParamSchema,
} = require('../schemas/appointments');

// Create appointment (patient only)
router.post(
    '/',
    authenticate,
    validate({ body: createAppointmentSchema }),
    appointmentsController.createAppointment
);

// Get my appointments
router.get(
    '/',
    authenticate,
    validate({ query: listQuerySchema }),
    appointmentsController.getMyAppointments
);

// Get appointment by ID
router.get(
    '/:id',
    authenticate,
    validate({ params: idParamSchema }),
    appointmentsController.getAppointmentById
);

// Reschedule appointment
router.put(
    '/:id/reschedule',
    authenticate,
    validate({ params: idParamSchema, body: rescheduleSchema }),
    appointmentsController.rescheduleAppointment
);

// Cancel appointment
router.put(
    '/:id/cancel',
    authenticate,
    validate({ params: idParamSchema, body: cancelSchema }),
    appointmentsController.cancelAppointment
);

// Confirm appointment (doctor/admin)
router.put(
    '/:id/confirm',
    authenticate,
    requireRole(['doctor', 'admin']),
    validate({ params: idParamSchema }),
    appointmentsController.confirmAppointment
);

module.exports = router;
