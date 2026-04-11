/**
 * Apply RLS migration: Allow doctors to see patient names
 */
const SUPABASE_URL = 'https://ibzeknzhdemrxrwnrvdy.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemVrbnpoZGVtcnhyd25ydmR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc5OTMwNSwiZXhwIjoyMDkxMzc1MzA1fQ.rv6eFip2Gin9O4Ihp1tyLInG7NueXe-MSGDs1auvDQE';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer': 'return=minimal',
};

async function runSQL(sql, label) {
  console.log(`⏳ ${label}...`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) {
    const text = await res.text();
    // If exec_sql doesn't exist, we need another approach
    console.log(`   ⚠️  RPC not available: ${text}`);
    return false;
  }
  console.log(`   ✅ Done`);
  return true;
}

async function main() {
  console.log('🔧 Applying doctor-patient RLS migration...\n');

  // First, try to create the is_doctor function via a workaround:
  // Create a temporary function that takes SQL and executes it
  
  // Step 1: Create the is_doctor helper function
  const createFn = await runSQL(`
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
  `, 'Creating is_doctor() function');

  if (!createFn) {
    // Fallback: need to run via SQL Editor
    console.log('\n⚠️  Cannot run SQL via REST API.');
    console.log('Please run the following SQL in the Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/ibzeknzhdemrxrwnrvdy/sql\n');
    console.log(`
--- COPY FROM HERE ---

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

DROP POLICY IF EXISTS "Doctors can view their patients" ON public.users;

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

--- END ---
    `);
  }
}

main().catch(console.error);
