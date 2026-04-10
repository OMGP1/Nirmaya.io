-- =============================================
-- FIX RLS POLICIES FOR PUBLIC DATA ACCESS
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Enable RLS on tables (if not already)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting policies  
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
DROP POLICY IF EXISTS "Anyone can view active doctors" ON public.doctors;
DROP POLICY IF EXISTS "Doctors are viewable by everyone" ON public.doctors;

-- 3. Allow ANYONE (including anonymous) to read departments
CREATE POLICY "Anyone can view departments"
ON public.departments
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Allow ANYONE to read ACTIVE doctors
CREATE POLICY "Anyone can view active doctors"  
ON public.doctors
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- 5. Fix the users table policy - allow reading basic user info for doctors
DROP POLICY IF EXISTS "Public can read user basic info" ON public.users;
CREATE POLICY "Public can read user basic info"
ON public.users
FOR SELECT
TO anon, authenticated
USING (
    -- Allow if user is viewing their own profile
    auth.uid() = id
    OR
    -- Allow if the user is a doctor (for doctor listings)
    role = 'doctor'
);

-- Verify the policies were created
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('departments', 'doctors', 'users');
