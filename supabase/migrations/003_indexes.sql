-- =============================================
-- HealthBook Database Schema
-- Migration: 003_indexes.sql
-- Description: Performance indexes for queries
-- =============================================

-- =============================================
-- INDEXES: Users Table
-- =============================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_patient_id ON public.users(patient_id) WHERE patient_id IS NOT NULL;
CREATE INDEX idx_users_active ON public.users(is_active) WHERE is_active = TRUE;

-- =============================================
-- INDEXES: Departments Table
-- =============================================
CREATE INDEX idx_departments_active ON public.departments(is_active);
CREATE INDEX idx_departments_order ON public.departments(display_order);
CREATE INDEX idx_departments_name ON public.departments(name);

-- =============================================
-- INDEXES: Doctors Table
-- =============================================
CREATE INDEX idx_doctors_user ON public.doctors(user_id);
CREATE INDEX idx_doctors_department ON public.doctors(department_id);
CREATE INDEX idx_doctors_active ON public.doctors(is_active);
CREATE INDEX idx_doctors_rating ON public.doctors(rating_average DESC);
CREATE INDEX idx_doctors_fee ON public.doctors(consultation_fee);

-- Composite index for common doctor listing queries
CREATE INDEX idx_doctors_dept_active ON public.doctors(department_id, is_active) 
  WHERE is_active = TRUE;

-- =============================================
-- INDEXES: Appointments Table
-- =============================================

-- Patient appointment lookups
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id, start_time DESC);

-- Doctor schedule lookups
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id, start_time);

-- Department statistics
CREATE INDEX idx_appointments_department ON public.appointments(department_id, start_time DESC);

-- Status filtering
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Date-based queries
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_date ON public.appointments((CAST(start_time AT TIME ZONE 'UTC' AS DATE)));

-- Active appointments for double-booking prevention
CREATE INDEX idx_appointments_active ON public.appointments(doctor_id, start_time) 
  WHERE status NOT IN ('cancelled');

-- Upcoming appointments for reminders
CREATE INDEX idx_appointments_upcoming ON public.appointments(start_time, reminder_sent) 
  WHERE status IN ('pending', 'confirmed') AND reminder_sent = FALSE;

-- =============================================
-- INDEXES: Time Blocks Table
-- =============================================
CREATE INDEX idx_time_blocks_doctor ON public.time_blocks(doctor_id, start_time);
CREATE INDEX idx_time_blocks_range ON public.time_blocks(doctor_id, start_time, end_time);
