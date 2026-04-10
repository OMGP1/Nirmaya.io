/**
 * Direct PostgreSQL Migration Runner for Triage & SOS System
 * Connects directly to Supabase PostgreSQL and runs DDL statements.
 */
const { Client } = require('pg');

// Supabase PostgreSQL connection string (direct connection)
// Format: postgresql://postgres.[ref]:[password]@[host]:5432/postgres
const DATABASE_URL = `postgresql://postgres.ibzeknzhdemrxrwnrvdy:${process.env.DB_PASSWORD}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

const MIGRATION_STEPS = [
    {
        name: '1. Enable PostGIS extension',
        sql: `CREATE EXTENSION IF NOT EXISTS postgis;`,
    },
    {
        name: '2. Create severity_level enum',
        sql: `DO $$ BEGIN CREATE TYPE severity_level AS ENUM ('low', 'moderate', 'high'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    },
    {
        name: '3a. Add severity column to appointments',
        sql: `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS severity severity_level DEFAULT 'low';`,
    },
    {
        name: '3b. Add is_emergency column to appointments',
        sql: `ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE;`,
    },
    {
        name: '4a. Add location column to users',
        sql: `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location geography(Point, 4326);`,
    },
    {
        name: '4b. Add location column to doctors',
        sql: `ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS location geography(Point, 4326);`,
    },
    {
        name: '5. Create GIST index on doctors location',
        sql: `CREATE INDEX IF NOT EXISTS idx_doctors_location ON public.doctors USING GIST (location);`,
    },
    {
        name: '6. Create emergency appointments index',
        sql: `CREATE INDEX IF NOT EXISTS idx_appointments_emergency ON public.appointments (doctor_id, is_emergency) WHERE is_emergency = TRUE;`,
    },
    {
        name: '7. RLS Policy for doctor Realtime access',
        sql: `
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
END $$;`,
    },
    {
        name: '8. Create find_nearest_doctors RPC function',
        sql: `
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
    ROUND((ST_Distance(d.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) / 1000)::numeric, 2)::double precision AS distance_km,
    d.is_active
  FROM public.doctors d
  JOIN public.users u ON u.id = d.user_id
  LEFT JOIN public.departments dept ON dept.id = d.department_id
  WHERE d.is_active = TRUE
    AND d.location IS NOT NULL
    AND ST_DWithin(d.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_km * 1000)
  ORDER BY ST_Distance(d.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;`,
    },
    {
        name: '9a. Seed doctor location ~1km (Bandra)',
        sql: `UPDATE public.doctors SET location = ST_SetSRID(ST_MakePoint(72.8350, 19.0596), 4326)::geography WHERE location IS NULL AND id = (SELECT id FROM public.doctors WHERE location IS NULL ORDER BY created_at ASC LIMIT 1);`,
    },
    {
        name: '9b. Seed doctor location ~5km (Andheri)',
        sql: `UPDATE public.doctors SET location = ST_SetSRID(ST_MakePoint(72.8697, 19.1136), 4326)::geography WHERE location IS NULL AND id = (SELECT id FROM public.doctors WHERE location IS NULL ORDER BY created_at ASC LIMIT 1);`,
    },
    {
        name: '9c. Seed doctor location ~15km (Thane)',
        sql: `UPDATE public.doctors SET location = ST_SetSRID(ST_MakePoint(72.9781, 19.2183), 4326)::geography WHERE location IS NULL AND id = (SELECT id FROM public.doctors WHERE location IS NULL ORDER BY created_at ASC LIMIT 1);`,
    },
    {
        name: '9d. Seed remaining doctors with random Mumbai locations',
        sql: `UPDATE public.doctors SET location = ST_SetSRID(ST_MakePoint(72.8777 + (random() - 0.5) * 0.1, 19.0760 + (random() - 0.5) * 0.1), 4326)::geography WHERE location IS NULL;`,
    },
];

async function run() {
    if (!process.env.DB_PASSWORD) {
        console.error('❌ DB_PASSWORD environment variable is required');
        console.error('Usage: DB_PASSWORD=your_db_password node scripts/run-pg-migration.js');
        process.exit(1);
    }

    const client = new Client({ connectionString: DATABASE_URL });

    try {
        console.log('🔌 Connecting to Supabase PostgreSQL...');
        await client.connect();
        console.log('✅ Connected!\n');

        for (const step of MIGRATION_STEPS) {
            process.stdout.write(`⏳ ${step.name}... `);
            try {
                const result = await client.query(step.sql);
                console.log(`✅ (${result.command || 'OK'}${result.rowCount != null ? ', ' + result.rowCount + ' rows' : ''})`);
            } catch (err) {
                console.log(`❌ ${err.message}`);
            }
        }

        // Verify
        console.log('\n🔍 Verification...');
        
        const postgis = await client.query("SELECT PostGIS_Version() as v;").catch(() => null);
        console.log(`PostGIS: ${postgis?.rows?.[0]?.v || 'NOT INSTALLED'}`);
        
        const cols = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'appointments' AND column_name IN ('severity', 'is_emergency')
            ORDER BY column_name;
        `);
        console.log(`Appointments columns: ${cols.rows.map(r => r.column_name).join(', ') || 'MISSING'}`);
        
        const docLoc = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'doctors' AND column_name = 'location';
        `);
        console.log(`Doctors location: ${docLoc.rows.length > 0 ? 'EXISTS' : 'MISSING'}`);
        
        const rpc = await client.query(`SELECT * FROM find_nearest_doctors(19.076, 72.877, 50, 5);`).catch(() => null);
        console.log(`RPC: ${rpc ? rpc.rows.length + ' doctors found' : 'FAILED'}`);
        if (rpc?.rows?.length > 0) {
            rpc.rows.forEach(d => console.log(`  → Dr. ${d.full_name} (${d.specialization}) — ${d.distance_km}km`));
        }

        console.log('\n✅ Migration complete!');
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

run();
