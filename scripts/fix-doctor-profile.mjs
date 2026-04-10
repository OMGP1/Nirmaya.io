/**
 * Fix: Insert missing doctor profile for "Dr. Demo Doctor"
 * Uses Supabase REST API with service_role key to bypass RLS.
 */

const SUPABASE_URL = 'https://ibzeknzhdemrxrwnrvdy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemVrbnpoZGVtcnhyd25ydmR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc5OTMwNSwiZXhwIjoyMDkxMzc1MzA1fQ.rv6eFip2Gin9O4Ihp1tyLInG7NueXe-MSGDs1auvDQE';
const DOCTOR_USER_ID = '5f768f35-fbdd-448a-a845-5c0b4386854c';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function main() {
  // 1. Check if doctor profile already exists
  console.log('🔍 Checking if doctor profile exists...');
  let res = await fetch(
    `${SUPABASE_URL}/rest/v1/doctors?user_id=eq.${DOCTOR_USER_ID}&select=id,user_id`,
    { headers }
  );
  const existing = await res.json();

  if (existing && existing.length > 0) {
    console.log('✅ Doctor profile already exists:', existing[0].id);
    console.log('   No action needed.');
    return;
  }

  // 2. Get a department ID (General Medicine preferred)
  console.log('🏥 Fetching departments...');
  res = await fetch(
    `${SUPABASE_URL}/rest/v1/departments?select=id,name&is_active=eq.true&order=display_order`,
    { headers }
  );
  const departments = await res.json();

  if (!departments || departments.length === 0) {
    console.error('❌ No departments found! Please seed departments first.');
    process.exit(1);
  }

  // Prefer "General Medicine", fallback to first department
  const dept = departments.find(d => d.name === 'General Medicine') || departments[0];
  console.log(`   Using department: ${dept.name} (${dept.id})`);

  // 3. Insert the doctor profile
  console.log('💉 Inserting doctor profile...');
  res = await fetch(`${SUPABASE_URL}/rest/v1/doctors`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      user_id: DOCTOR_USER_ID,
      department_id: dept.id,
      specialization: 'General Medicine',
      qualifications: ['MD', 'MBBS'],
      experience: 5,
      license_number: 'MED-DEMO-001',
      bio: 'Demo doctor profile for development and testing.',
      consultation_fee: 100.00,
      is_active: true,
      rating_average: 4.5,
      rating_count: 0,
      availability: [
        { dayOfWeek: 1, slots: [{ startTime: '09:00', endTime: '13:00', slotDuration: 30 }] },
        { dayOfWeek: 3, slots: [{ startTime: '09:00', endTime: '13:00', slotDuration: 30 }] },
        { dayOfWeek: 5, slots: [{ startTime: '14:00', endTime: '18:00', slotDuration: 30 }] },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`❌ Failed to insert doctor (${res.status}):`, errText);
    process.exit(1);
  }

  const inserted = await res.json();
  console.log('✅ Doctor profile created successfully!');
  console.log('   Doctor ID:', inserted[0]?.id);
  console.log('   User ID:', inserted[0]?.user_id);
  console.log('   Department:', dept.name);
  console.log('\n🎉 Dashboard should now load without errors.');
}

main().catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
