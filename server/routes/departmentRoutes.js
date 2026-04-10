/**
 * Department Routes
 */
const express = require('express');
const router = express.Router();
const departmentsController = require('../controllers/departmentsController');
const { z } = require('zod');
const { validate } = require('../middleware/validate');

const idParamSchema = z.object({
    id: z.string().uuid('Invalid department ID'),
});

// List departments (public)
router.get('/', departmentsController.getDepartments);

// Get department by ID (public)
router.get(
    '/:id',
    validate({ params: idParamSchema }),
    departmentsController.getDepartmentById
);

module.exports = router;
