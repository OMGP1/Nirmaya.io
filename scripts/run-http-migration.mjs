/**
 * Execute Triage & SOS Migration via Supabase HTTP SQL API
 * 
 * Uses the Supabase /pg/query endpoint that's available with the service role key.
 * This endpoint allows raw SQL execution on newer Supabase projects.
 */

const SUPABASE_URL = 'https://ibzeknzhdemrxrwnrvdy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemVrbnpoZGVtcnhyd25ydmR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc5OTMwNSwiZXhwIjoyMDkxMzc1MzA1fQ.rv6eFip2Gin9O4Ihp1tyLInG7NueXe-MSGDs1auvDQE';

const MIGRATION_SQL = `
-- 1. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create severity enum
DO $$ BEGIN CREATE TYPE severity_level AS ENUM ('low', 'moderate', 'high'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Add columns to appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS severity severity_level DEFAULT 'low';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE;

-- 4. Add location columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_doctors_location ON public.doctors USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_appointments_emergency ON public.appointments (doctor_id, is_emergency) WHERE is_emergency = TRUE;

-- 7. RLS Policy
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Doctors can view their emergency appointments') THEN
    CREATE POLICY "Doctors can view their emergency appointments" ON public.appointments FOR SELECT USING (EXISTS (SELECT 1 FROM public.doctors WHERE id = appointments.doctor_id AND user_id = auth.uid()));
  END IF;
END $$;

-- 8. RPC Function
CREATE OR REPLACE FUNCTION find_nearest_doctors(lat DOUBLE PRECISION, lng DOUBLE PRECISION, radius_km DOUBLE PRECISION DEFAULT 50, max_results INTEGER DEFAULT 10)
RETURNS TABLE (doctor_id UUID, user_id UUID, full_name TEXT, specialization TEXT, department_name TEXT, distance_km DOUBLE PRECISION, is_active BOOLEAN) AS $$
BEGIN
  RETURN QUERY SELECT d.id, d.user_id, u.full_name, d.specialization, dept.name, ROUND((ST_Distance(d.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) / 1000)::numeric, 2)::double precision, d.is_active FROM public.doctors d JOIN public.users u ON u.id = d.user_id LEFT JOIN public.departments dept ON dept.id = d.department_id WHERE d.is_active = TRUE AND d.location IS NOT NULL AND ST_DWithin(d.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_km * 1000) ORDER BY ST_Distance(d.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) ASC LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- 9. Seed locations
UPDATE public.doctors SET location = ST_SetSRID(ST_MakePoint(72.8350, 19.0596), 4326)::geography WHERE location IS NULL AND id = (SELECT id FROM public.doctors WHERE location IS NULL ORDER BY created_at ASC LIMIT 1);
UPDATE public.doctors SET location = ST_SetSRID(ST_MakePoint(72.8697, 19.1136), 4326)::geography WHERE location IS NULL AND id = (SELECT id FROM public.doctors WHERE location IS NULL ORDER BY created_at ASC LIMIT 1);
UPDATE public.doctors SET location = ST_SetSRID(ST_MakePoint(72.9781, 19.2183), 4326)::geography WHERE location IS NULL AND id = (SELECT id FROM public.doctors WHERE location IS NULL ORDER BY created_at ASC LIMIT 1);
UPDATE public.doctors SET location = ST_SetSRID(ST_MakePoint(72.8777 + (random() - 0.5) * 0.1, 19.0760 + (random() - 0.5) * 0.1), 4326)::geography WHERE location IS NULL;
`;

async function runMigration() {
    console.log('🚀 Running Triage & SOS Migration...\n');

    // Try multiple Supabase SQL endpoints
    const endpoints = [
        '/pg/query',           // v2 SQL endpoint  
        '/rest/v1/rpc/exec_sql', // Custom RPC if exists
    ];

    for (const endpoint of endpoints) {
        console.log(`Trying endpoint: ${endpoint}...`);
        try {
            const resp = await fetch(`${SUPABASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'apikey': SERVICE_KEY,
                    'Authorization': `Bearer ${SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation',
                },
                body: JSON.stringify({ query: MIGRATION_SQL }),
            });
            
            const text = await resp.text();
            console.log(`Status: ${resp.status}`);
            console.log(`Response: ${text.substring(0, 500)}`);
            
            if (resp.ok) {
                console.log('\n✅ Migration executed successfully!');
                return true;
            }
        } catch (err) {
            console.log(`Error: ${err.message}`);
        }
    }

    return false;
}

runMigration().then(success => {
    if (!success) {
        console.log('\n⚠️  Could not execute SQL via HTTP endpoints.');
        console.log('The SQL migration file is ready at: supabase/migrations/triage_sos_migration.sql');
        console.log('Please run it manually in the Supabase SQL Editor:');
        console.log(`→ https://supabase.com/dashboard/project/ibzeknzhdemrxrwnrvdy/sql/new`);
    }
});
