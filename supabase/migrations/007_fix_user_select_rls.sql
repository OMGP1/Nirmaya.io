-- =============================================
-- FIX USER SELECT RLS POLICY RECURSION
-- The issue: "Admins can view all users" policy checks users table
-- to verify if current user is admin, causing infinite recursion.
-- 
-- Solution: Users should ALWAYS be able to read their OWN row,
-- regardless of role. Use auth.uid() = id directly.
-- =============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Public can read user basic info" ON public.users;

-- Create a simple, non-recursive policy for self-access
-- This is the critical fix: users can ALWAYS read their own profile
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins can view all users - use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Now create admin policy using the security definer function
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Also allow reading doctor user info for doctor listings (non-sensitive)
CREATE POLICY "Anyone can view doctor users"
ON public.users
FOR SELECT
TO anon, authenticated
USING (role = 'doctor');

-- Verify policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';
