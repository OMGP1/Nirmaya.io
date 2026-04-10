/**
 * Doctor Routes
 */
const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validate');
const doctorsController = require('../controllers/doctorsController');
const {
    idParamSchema,
    listQuerySchema,
    availabilityQuerySchema,
} = require('../schemas/doctors');

// List doctors (public)
router.get(
    '/',
    validate({ query: listQuerySchema }),
    doctorsController.getDoctors
);

// Get doctor by ID (public)
router.get(
    '/:id',
    validate({ params: idParamSchema }),
    doctorsController.getDoctorById
);

// Get doctor availability (public)
router.get(
    '/:id/availability',
    validate({ params: idParamSchema, query: availabilityQuerySchema }),
    doctorsController.getDoctorAvailability
);

module.exports = router;
