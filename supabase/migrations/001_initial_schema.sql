-- =============================================
-- HealthBook Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Core tables and base functions
-- =============================================

-- =============================================
-- HELPER FUNCTION: Auto-update updated_at column
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABLE: Users (public.users)
-- Stores all user types: patients, doctors, admins
-- =============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin', 'doctor')),
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  patient_id TEXT UNIQUE,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  address JSONB,
  emergency_contact JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.users IS 'Stores all user profiles including patients, doctors, and admins';
COMMENT ON COLUMN public.users.patient_id IS 'Auto-generated unique patient identifier (PT-YYYY-XXXX)';
COMMENT ON COLUMN public.users.address IS 'JSON structure: {street, city, state, zip, country}';
COMMENT ON COLUMN public.users.emergency_contact IS 'JSON structure: {name, relationship, phone}';

-- =============================================
-- TABLE: Departments (public.departments)
-- Medical departments/specialties
-- =============================================
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏥',
  color TEXT DEFAULT '#667EEA',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.departments IS 'Medical departments and specialties';
COMMENT ON COLUMN public.departments.icon IS 'Emoji or icon identifier for UI display';
COMMENT ON COLUMN public.departments.color IS 'Hex color code for UI theming';

-- =============================================
-- TABLE: Doctors (public.doctors)
-- Doctor profiles linked to users and departments
-- =============================================
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  specialization TEXT,
  qualifications TEXT[],
  experience INTEGER CHECK (experience >= 0),
  license_number TEXT UNIQUE,
  bio TEXT,
  consultation_fee DECIMAL(10,2) DEFAULT 0 CHECK (consultation_fee >= 0),
  availability JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  rating_average DECIMAL(3,2) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.doctors IS 'Doctor professional profiles and availability';
COMMENT ON COLUMN public.doctors.availability IS 'JSON array: [{dayOfWeek: 1-7, slots: [{startTime, endTime, slotDuration}]}]';
COMMENT ON COLUMN public.doctors.qualifications IS 'Array of qualifications like MD, FACC, etc.';

-- =============================================
-- TABLE: Appointments (public.appointments)
-- Patient-doctor appointments
-- =============================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  reason TEXT NOT NULL,
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.users(id),
  cancelled_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT no_overlap UNIQUE (doctor_id, start_time)
);

COMMENT ON TABLE public.appointments IS 'Patient appointments with doctors';
COMMENT ON COLUMN public.appointments.status IS 'Appointment lifecycle: pending -> confirmed -> completed/cancelled/no_show';

-- =============================================
-- TABLE: Time Blocks (public.time_blocks)
-- Doctor unavailability periods
-- =============================================
CREATE TABLE public.time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT DEFAULT 'unavailable' CHECK (reason IN ('vacation', 'conference', 'emergency', 'personal', 'unavailable')),
  notes TEXT,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_block_time CHECK (end_time > start_time)
);

COMMENT ON TABLE public.time_blocks IS 'Doctor unavailability periods for blocking appointments';

-- =============================================
-- TRIGGERS: Auto-update updated_at timestamps
-- =============================================
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
