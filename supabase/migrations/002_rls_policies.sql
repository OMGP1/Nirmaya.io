-- =============================================
-- HealthBook Database Schema
-- Migration: 002_rls_policies.sql
-- Description: Row Level Security policies
-- =============================================

-- =============================================
-- Enable RLS on all tables
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: Users Table
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" 
  ON public.users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all users
CREATE POLICY "Admins can manage all users" 
  ON public.users FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- RLS POLICIES: Departments Table
-- =============================================

-- Anyone can view active departments (public read)
CREATE POLICY "Anyone can view active departments" 
  ON public.departments FOR SELECT 
  USING (is_active = TRUE);

-- Admins can manage departments (full CRUD)
CREATE POLICY "Admins can manage departments" 
  ON public.departments FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- RLS POLICIES: Doctors Table
-- =============================================

-- Anyone can view active doctors (public read)
CREATE POLICY "Anyone can view active doctors" 
  ON public.doctors FOR SELECT 
  USING (is_active = TRUE);

-- Doctors can update their own profile
CREATE POLICY "Doctors can update own profile" 
  ON public.doctors FOR UPDATE 
  USING (auth.uid() = user_id);

-- Admins can manage all doctors
CREATE POLICY "Admins can manage doctors" 
  ON public.doctors FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- RLS POLICIES: Appointments Table
-- =============================================

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments" 
  ON public.appointments FOR SELECT 
  USING (auth.uid() = patient_id);

-- Patients can create their own appointments
CREATE POLICY "Patients can create own appointments" 
  ON public.appointments FOR INSERT 
  WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own pending/confirmed appointments
CREATE POLICY "Patients can update own pending appointments" 
  ON public.appointments FOR UPDATE 
  USING (
    auth.uid() = patient_id AND 
    status IN ('pending', 'confirmed')
  );

-- Doctors can view appointments assigned to them
CREATE POLICY "Doctors can view their appointments" 
  ON public.appointments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = appointments.doctor_id AND user_id = auth.uid()
    )
  );

-- Doctors can update their appointments (confirm, complete, add notes)
CREATE POLICY "Doctors can update their appointments" 
  ON public.appointments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = appointments.doctor_id AND user_id = auth.uid()
    )
  );

-- Admins can view all appointments
CREATE POLICY "Admins can view all appointments" 
  ON public.appointments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all appointments
CREATE POLICY "Admins can manage all appointments" 
  ON public.appointments FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- RLS POLICIES: Time Blocks Table
-- =============================================

-- Anyone can view time blocks (needed for availability checking)
CREATE POLICY "Anyone can view time blocks" 
  ON public.time_blocks FOR SELECT 
  USING (TRUE);

-- Doctors can manage their own time blocks
CREATE POLICY "Doctors can manage own time blocks" 
  ON public.time_blocks FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = time_blocks.doctor_id AND user_id = auth.uid()
    )
  );

-- Admins can manage all time blocks
CREATE POLICY "Admins can manage time blocks" 
  ON public.time_blocks FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
