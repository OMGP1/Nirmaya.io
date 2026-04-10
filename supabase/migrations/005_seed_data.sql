-- =============================================
-- HealthBook Database Schema
-- Migration: 005_seed_data.sql
-- Description: Initial seed data for development
-- =============================================

-- =============================================
-- SEED: Departments
-- =============================================
INSERT INTO public.departments (name, description, icon, color, display_order) VALUES
  ('Cardiology', 'Heart and cardiovascular care including ECG, stress tests, and cardiac rehabilitation', '❤️', '#e74c3c', 1),
  ('Orthopedics', 'Bone, joint, and musculoskeletal specialists for injuries and conditions', '🦴', '#3498db', 2),
  ('Dermatology', 'Skin care, treatment, and cosmetic procedures', '🩺', '#2ecc71', 3),
  ('Neurology', 'Brain, spine, and nervous system disorders', '🧠', '#9b59b6', 4),
  ('Pediatrics', 'Comprehensive child healthcare from infancy to adolescence', '👶', '#f39c12', 5),
  ('Ophthalmology', 'Eye care, vision correction, and ocular disease treatment', '👁️', '#1abc9c', 6),
  ('General Medicine', 'Primary care and general health consultations', '🏥', '#667EEA', 7),
  ('Gynecology', 'Women''s reproductive health and prenatal care', '🌸', '#ff69b4', 8);

-- =============================================
-- SEED: Admin User
-- NOTE: In production, create via Supabase Auth
-- This is for development/testing only
-- =============================================
INSERT INTO public.users (id, email, role, full_name, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@healthbook.com', 'admin', 'System Administrator', '+1-555-0001');

-- =============================================
-- SEED: Test Patients
-- =============================================
INSERT INTO public.users (id, email, role, full_name, phone, date_of_birth, blood_type, address, emergency_contact) VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    'john.doe@example.com',
    'patient',
    'John Doe',
    '+1-555-0100',
    '1985-03-15',
    'A+',
    '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}'::jsonb,
    '{"name": "Jane Doe", "relationship": "Spouse", "phone": "+1-555-0101"}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'jane.smith@example.com',
    'patient',
    'Jane Smith',
    '+1-555-0200',
    '1990-07-22',
    'B+',
    '{"street": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zip": "90001", "country": "USA"}'::jsonb,
    '{"name": "Bob Smith", "relationship": "Father", "phone": "+1-555-0201"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'mike.johnson@example.com',
    'patient',
    'Mike Johnson',
    '+1-555-0300',
    '1978-11-08',
    'O-',
    '{"street": "789 Pine Rd", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}'::jsonb,
    '{"name": "Sarah Johnson", "relationship": "Wife", "phone": "+1-555-0301"}'::jsonb
  );

-- =============================================
-- SEED: Doctor Users
-- =============================================
INSERT INTO public.users (id, email, role, full_name, phone) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.chen@healthbook.com', 'doctor', 'Dr. Michael Chen', '+1-555-1001'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dr.patel@healthbook.com', 'doctor', 'Dr. Priya Patel', '+1-555-1002'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dr.williams@healthbook.com', 'doctor', 'Dr. James Williams', '+1-555-1003');

-- =============================================
-- SEED: Doctor Profiles
-- =============================================
INSERT INTO public.doctors (user_id, department_id, specialization, qualifications, experience, license_number, bio, consultation_fee, availability, rating_average, rating_count)
SELECT 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  d.id,
  'Interventional Cardiology',
  ARRAY['MD', 'FACC', 'FSCAI'],
  12,
  'MED-CARD-001',
  'Dr. Michael Chen is a board-certified cardiologist specializing in complex coronary interventions. With over 12 years of experience, he has performed thousands of successful procedures and is known for his patient-centered approach.',
  150.00,
  '[
    {"dayOfWeek": 1, "slots": [{"startTime": "09:00", "endTime": "12:00", "slotDuration": 30}]},
    {"dayOfWeek": 3, "slots": [{"startTime": "09:00", "endTime": "12:00", "slotDuration": 30}]},
    {"dayOfWeek": 5, "slots": [{"startTime": "14:00", "endTime": "17:00", "slotDuration": 30}]}
  ]'::jsonb,
  4.8,
  156
FROM public.departments d
WHERE d.name = 'Cardiology';

INSERT INTO public.doctors (user_id, department_id, specialization, qualifications, experience, license_number, bio, consultation_fee, availability, rating_average, rating_count)
SELECT 
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  d.id,
  'Pediatric Neurology',
  ARRAY['MD', 'PhD', 'FAAP'],
  8,
  'MED-NEURO-002',
  'Dr. Priya Patel is a renowned neurologist with special expertise in pediatric neurology and developmental disorders. She combines cutting-edge treatment with compassionate care.',
  120.00,
  '[
    {"dayOfWeek": 2, "slots": [{"startTime": "10:00", "endTime": "13:00", "slotDuration": 45}]},
    {"dayOfWeek": 4, "slots": [{"startTime": "10:00", "endTime": "13:00", "slotDuration": 45}]},
    {"dayOfWeek": 6, "slots": [{"startTime": "09:00", "endTime": "12:00", "slotDuration": 45}]}
  ]'::jsonb,
  4.9,
  203
FROM public.departments d
WHERE d.name = 'Neurology';

INSERT INTO public.doctors (user_id, department_id, specialization, qualifications, experience, license_number, bio, consultation_fee, availability, rating_average, rating_count)
SELECT 
  'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  d.id,
  'Sports Medicine & Joint Replacement',
  ARRAY['MD', 'MS Ortho', 'FICS'],
  15,
  'MED-ORTHO-003',
  'Dr. James Williams is an orthopedic surgeon with 15 years of experience in sports medicine and joint replacement surgery. He has worked with professional athletes and is a pioneer in minimally invasive techniques.',
  175.00,
  '[
    {"dayOfWeek": 1, "slots": [{"startTime": "14:00", "endTime": "18:00", "slotDuration": 30}]},
    {"dayOfWeek": 3, "slots": [{"startTime": "14:00", "endTime": "18:00", "slotDuration": 30}]},
    {"dayOfWeek": 5, "slots": [{"startTime": "09:00", "endTime": "13:00", "slotDuration": 30}]}
  ]'::jsonb,
  4.7,
  189
FROM public.departments d
WHERE d.name = 'Orthopedics';

-- =============================================
-- SEED: Sample Time Block (Doctor Vacation)
-- =============================================
INSERT INTO public.time_blocks (doctor_id, start_time, end_time, reason, notes, created_by)
SELECT 
  doc.id,
  '2026-02-15 00:00:00+00'::timestamptz,
  '2026-02-22 23:59:59+00'::timestamptz,
  'vacation',
  'Annual leave - Dr. Chen will be out of office',
  '11111111-1111-1111-1111-111111111111'::uuid
FROM public.doctors doc
JOIN public.users u ON doc.user_id = u.id
WHERE u.email = 'dr.chen@healthbook.com';
