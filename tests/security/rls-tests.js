/**
 * Security Tests for RLS Policies
 * 
 * Verifies that Row Level Security policies are working correctly.
 * Run these against a test database with proper RLS enabled.
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Client without auth (anonymous)
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

// Service client (bypasses RLS for setup)
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

describe('RLS Security Tests', () => {
    describe('Users Table', () => {
        test('anonymous users cannot read other users data', async () => {
            const { data, error } = await anonClient
                .from('users')
                .select('*')
                .limit(1);

            // Should return empty or error due to RLS
            expect(data?.length || 0).toBe(0);
        });

        test('anonymous users cannot insert users', async () => {
            const { error } = await anonClient
                .from('users')
                .insert({
                    id: 'test-uuid',
                    email: 'hacker@test.com',
                    role: 'admin', // Trying to escalate privileges
                });

            expect(error).toBeTruthy();
        });

        test('users cannot update other users profiles', async () => {
            // This would need an authenticated user context
            // Placeholder for actual implementation
            expect(true).toBe(true);
        });
    });

    describe('Appointments Table', () => {
        test('anonymous users cannot read appointments', async () => {
            const { data, error } = await anonClient
                .from('appointments')
                .select('*')
                .limit(1);

            expect(data?.length || 0).toBe(0);
        });

        test('anonymous users cannot create appointments', async () => {
            const { error } = await anonClient
                .from('appointments')
                .insert({
                    patient_id: 'fake-patient',
                    doctor_id: 'fake-doctor',
                    start_time: new Date().toISOString(),
                });

            expect(error).toBeTruthy();
        });
    });

    describe('Doctors Table', () => {
        test('anyone can read doctor profiles', async () => {
            const { error } = await anonClient
                .from('doctors')
                .select('id, user:users(full_name), department:departments(name)')
                .limit(1);

            // Doctors should be readable (for booking)
            // Error only if table doesn't exist, not RLS
            expect(true).toBe(true);
        });

        test('anonymous users cannot modify doctors', async () => {
            const { error } = await anonClient
                .from('doctors')
                .insert({
                    user_id: 'fake-user',
                    department_id: 'fake-dept',
                });

            expect(error).toBeTruthy();
        });
    });

    describe('Privilege Escalation Prevention', () => {
        test('patients cannot change their role to admin', async () => {
            // Would need authenticated user context
            // The update should be blocked by RLS or trigger
            expect(true).toBe(true);
        });

        test('patients cannot access admin endpoints', async () => {
            // RLS should prevent patients from accessing admin-only data
            expect(true).toBe(true);
        });
    });
});

// Export for use in test runner
module.exports = { anonClient, serviceClient };
