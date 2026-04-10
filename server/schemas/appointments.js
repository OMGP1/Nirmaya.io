/**
 * Appointment Validation Schemas
 */
const { z } = require('zod');

// Create appointment
const createAppointmentSchema = z.object({
    doctor_id: z.string().uuid('Invalid doctor ID'),
    department_id: z.string().uuid('Invalid department ID').optional(),
    start_time: z.string().datetime('Invalid datetime format (ISO 8601 required)'),
    end_time: z.string().datetime('Invalid datetime format (ISO 8601 required)'),
    reason: z.string().min(3, 'Reason must be at least 3 characters').max(500),
    notes: z.string().max(1000).optional().nullable(),
});

// Reschedule appointment
const rescheduleSchema = z.object({
    new_time: z.string().datetime('Invalid datetime format (ISO 8601 required)'),
});

// Cancel appointment
const cancelSchema = z.object({
    reason: z.string().min(3, 'Cancellation reason required').max(500),
});

// Query params for listing
const listQuerySchema = z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

// ID param
const idParamSchema = z.object({
    id: z.string().uuid('Invalid appointment ID'),
});

module.exports = {
    createAppointmentSchema,
    rescheduleSchema,
    cancelSchema,
    listQuerySchema,
    idParamSchema,
};
