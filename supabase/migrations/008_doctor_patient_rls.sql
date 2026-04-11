-- =============================================
-- FIX: Allow doctors to read patient names
-- 
-- Problem: RLS on public.users blocks doctors from
-- seeing patient profiles when joining appointments.
-- Only self-read and admin-read policies existed.
--
-- Solution: Allow doctors to SELECT patient user rows
-- for patients they have appointments with.
-- =============================================

-- Helper: check if current user is a doctor
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'doctor'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_doctor() TO authenticated;

-- Doctors can view patient users they have appointments with
CREATE POLICY "Doctors can view their patients"
ON public.users
FOR SELECT
TO authenticated
USING (
  public.is_doctor()
  AND role = 'patient'
  AND id IN (
    SELECT a.patient_id 
    FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE d.user_id = auth.uid()
  )
);
