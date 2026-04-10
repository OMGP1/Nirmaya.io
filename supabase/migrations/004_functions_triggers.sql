-- =============================================
-- HealthBook Database Schema
-- Migration: 004_functions_triggers.sql
-- Description: Helper functions and triggers
-- =============================================

-- =============================================
-- FUNCTION: Generate Patient ID
-- Auto-generates unique patient ID (PT-YYYY-XXXX)
-- =============================================
CREATE OR REPLACE FUNCTION generate_patient_id()
RETURNS TRIGGER AS $$
DECLARE
  new_id TEXT;
  current_year TEXT;
  random_num TEXT;
BEGIN
  -- Only generate for patients without existing patient_id
  IF NEW.role = 'patient' AND NEW.patient_id IS NULL THEN
    current_year := TO_CHAR(NOW(), 'YYYY');
    random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    new_id := 'PT-' || current_year || '-' || random_num;
    
    -- Ensure uniqueness by checking existing IDs
    WHILE EXISTS (SELECT 1 FROM public.users WHERE patient_id = new_id) LOOP
      random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
      new_id := 'PT-' || current_year || '-' || random_num;
    END LOOP;
    
    NEW.patient_id := new_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate patient ID on insert
CREATE TRIGGER auto_generate_patient_id
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION generate_patient_id();

-- =============================================
-- FUNCTION: Check Appointment Overlap
-- Prevents double booking for doctors
-- =============================================
CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlapping appointments (excluding cancelled ones)
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE doctor_id = NEW.doctor_id
    AND status NOT IN ('cancelled')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      -- New appointment starts during existing appointment
      (NEW.start_time >= start_time AND NEW.start_time < end_time)
      -- New appointment ends during existing appointment
      OR (NEW.end_time > start_time AND NEW.end_time <= end_time)
      -- New appointment completely contains existing appointment
      OR (NEW.start_time <= start_time AND NEW.end_time >= end_time)
    )
  ) THEN
    RAISE EXCEPTION 'Appointment time slot overlaps with existing appointment';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Prevent double booking
CREATE TRIGGER prevent_appointment_overlap
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION check_appointment_overlap();

-- =============================================
-- FUNCTION: Check Time Block Conflicts
-- Prevents scheduling during blocked times
-- =============================================
CREATE OR REPLACE FUNCTION check_time_block_conflict()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if appointment conflicts with a time block
  IF EXISTS (
    SELECT 1 FROM public.time_blocks
    WHERE doctor_id = NEW.doctor_id
    AND (
      (NEW.start_time >= start_time AND NEW.start_time < end_time)
      OR (NEW.end_time > start_time AND NEW.end_time <= end_time)
      OR (NEW.start_time <= start_time AND NEW.end_time >= end_time)
    )
  ) THEN
    RAISE EXCEPTION 'Appointment conflicts with doctor unavailability';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Check time block conflicts
CREATE TRIGGER check_appointment_time_block
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION check_time_block_conflict();

-- =============================================
-- FUNCTION: Update Appointment Status Timestamps
-- Auto-sets timestamp fields based on status changes
-- =============================================
CREATE OR REPLACE FUNCTION update_appointment_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Track status change timestamps
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.confirmed_at := NOW();
  END IF;
  
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at := NOW();
  END IF;
  
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update status timestamps
CREATE TRIGGER update_appointment_timestamps
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointment_status_timestamps();

-- =============================================
-- FUNCTION: Sync User Role with Doctor Profile
-- When a doctor record is created, update user role
-- =============================================
CREATE OR REPLACE FUNCTION sync_doctor_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user role to 'doctor' when doctor profile is created
  UPDATE public.users 
  SET role = 'doctor' 
  WHERE id = NEW.user_id AND role != 'admin';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Sync doctor role on insert
CREATE TRIGGER sync_doctor_user_role
  AFTER INSERT ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION sync_doctor_role();

-- =============================================
-- FUNCTION: Handle New User (Auth Sync)
-- Creates public.users profile when user signs up via Supabase Auth
-- CRITICAL: Without this, auth.users won't sync to public.users!
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    'patient'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
