/**
 * Backend API Integration Tests
 * 
 * Tests for appointment endpoints.
 */
const request = require('supertest');
const express = require('express');

// Mock Supabase Admin client
jest.mock('../config/supabaseAdmin', () => ({
    from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
}));

// Import routes after mocking
const appointmentRoutes = require('../routes/appointmentRoutes');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/appointments', appointmentRoutes);

describe('Appointment API', () => {
    describe('GET /api/appointments', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .get('/api/appointments')
                .expect(401);

            expect(res.body.error).toBeDefined();
        });
    });

    describe('POST /api/appointments', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .post('/api/appointments')
                .send({
                    doctor_id: '123',
                    appointment_time: '2026-02-01T09:00:00Z',
                    reason: 'Checkup',
                })
                .expect(401);

            expect(res.body.error).toBeDefined();
        });

        it('should validate required fields', async () => {
            // Note: This would need auth to work properly
            const res = await request(app)
                .post('/api/appointments')
                .set('Authorization', 'Bearer mock-token')
                .send({})
                .expect(400);

            // Validation should fail
            expect(res.body).toBeDefined();
        });
    });
});

describe('Validation Schemas', () => {
    const { appointmentSchemas } = require('../schemas/appointments');

    describe('createAppointmentSchema', () => {
        it('should validate correct appointment data', () => {
            const validData = {
                body: {
                    doctor_id: '550e8400-e29b-41d4-a716-446655440000',
                    appointment_time: '2026-02-01T09:00:00Z',
                    reason: 'Regular checkup',
                },
            };

            const result = appointmentSchemas.create.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject invalid UUID', () => {
            const invalidData = {
                body: {
                    doctor_id: 'not-a-uuid',
                    appointment_time: '2026-02-01T09:00:00Z',
                    reason: 'Regular checkup',
                },
            };

            const result = appointmentSchemas.create.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject empty reason', () => {
            const invalidData = {
                body: {
                    doctor_id: '550e8400-e29b-41d4-a716-446655440000',
                    appointment_time: '2026-02-01T09:00:00Z',
                    reason: '',
                },
            };

            const result = appointmentSchemas.create.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
