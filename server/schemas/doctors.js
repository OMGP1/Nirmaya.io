/**
 * Doctor Validation Schemas
 */
const { z } = require('zod');

// ID param
const idParamSchema = z.object({
    id: z.string().uuid('Invalid doctor ID'),
});

// Query params for listing
const listQuerySchema = z.object({
    department_id: z.string().uuid().optional(),
    search: z.string().max(100).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

// Availability query
const availabilityQuerySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

module.exports = {
    idParamSchema,
    listQuerySchema,
    availabilityQuerySchema,
};
