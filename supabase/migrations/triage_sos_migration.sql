-- =============================================================
-- Migration: Patient Triage & SOS System
-- Description: Enables PostGIS, adds severity tracking to
--   appointments, GPS location to users/doctors, and creates
--   the find_nearest_doctors RPC for proximity-based triage.
-- =============================================================

-- 1. Enable PostGIS extension for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create severity enum type (safe if already exists)
DO $$ BEGIN
  CREATE TYPE severity_level AS ENUM ('low', 'moderate', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Add severity and emergency tracking to appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS severity severity_level DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE;

-- 4. Add GPS location columns to users and doctors
-- geography(Point, 4326) stores standard GPS coordinates (Longitude, Latitude)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- 5. Create GIST index for fast spatial queries on doctors
CREATE INDEX IF NOT EXISTS idx_doctors_location
  ON public.doctors USING GIST (location);

-- 6. Create index for fast emergency appointment lookups
CREATE INDEX IF NOT EXISTS idx_appointments_emergency
  ON public.appointments (doctor_id, is_emergency)
  WHERE is_emergency = TRUE;

-- =============================================================
-- 7. RLS Policy Fix for Supabase Realtime
-- 
-- GOTCHA: Supabase Realtime broadcasts respect RLS.
-- Doctors must be able to SELECT emergency appointments
-- assigned to them, otherwise Realtime INSERT events
-- are silently filtered out.
-- =============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Doctors can view their emergency appointments'
  ) THEN
    CREATE POLICY "Doctors can view their emergency appointments"
      ON public.appointments FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.doctors
          WHERE id = appointments.doctor_id 
          AND user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- =============================================================
-- 8. RPC Function: find_nearest_doctors
--
-- Uses ST_DWithin for indexed filtering (fast) and
-- ST_Distance for exact sorting by proximity.
-- geography type ensures correct meters over earth curvature.
-- =============================================================

CREATE OR REPLACE FUNCTION find_nearest_doctors(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 50,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  doctor_id UUID,
  user_id UUID,
  full_name TEXT,
  specialization TEXT,
  department_name TEXT,
  distance_km DOUBLE PRECISION,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS doctor_id,
    d.user_id,
    u.full_name,
    d.specialization,
    dept.name AS department_name,
    ROUND((ST_Distance(
      d.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1000)::numeric, 2)::double precision AS distance_km,
    d.is_active
  FROM public.doctors d
  JOIN public.users u ON u.id = d.user_id
  LEFT JOIN public.departments dept ON dept.id = d.department_id
  WHERE d.is_active = TRUE
    AND d.location IS NOT NULL
    AND ST_DWithin(
      d.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_km * 1000  -- Convert km to meters
    )
  ORDER BY ST_Distance(
    d.location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================
-- 9. Seed Mock Doctor Locations
--
-- Uses Mumbai coordinates as the demo venue center (19.0760, 72.8777)
-- Spreads doctors at ~1km, ~5km, and ~15km for demo variety.
-- Only updates doctors that have NULL locations.
-- =============================================================

-- Doctor ~1km away (Bandra area)
UPDATE public.doctors
SET location = ST_SetSRID(ST_MakePoint(72.8350, 19.0596), 4326)::geography
WHERE location IS NULL
  AND id = (SELECT id FROM public.doctors WHERE location IS NULL ORDER BY created_at ASC LIMIT 1);

-- Doctor ~5km away (Andheri area)
UPDATE public.doctors
SET location = ST_SetSRID(ST_MakePoint(72.8697, 19.1136), 4326)::geography
WHERE location IS NULL
  AND id = (SELECT id FROM public.doctors WHERE location IS NULL ORDER BY created_at ASC LIMIT 1 OFFSET 1);

-- Doctor ~15km away (Thane area)
UPDATE public.doctors
SET location = ST_SetSRID(ST_MakePoint(72.9781, 19.2183), 4326)::geography
WHERE location IS NULL
  AND id = (SELECT id FROM public.doctors WHERE location IS NULL ORDER BY created_at ASC LIMIT 1 OFFSET 2);

-- Fallback: If additional doctors exist, give them random Mumbai-area locations
UPDATE public.doctors
SET location = ST_SetSRID(ST_MakePoint(
  72.8777 + (random() - 0.5) * 0.1,
  19.0760 + (random() - 0.5) * 0.1
), 4326)::geography
WHERE location IS NULL;
