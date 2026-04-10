/**
 * Seed test users into Supabase Auth + public.users
 * 
 * Creates: admin, doctor, patient accounts
 * Uses the Supabase service_role key to bypass RLS
 */

const SUPABASE_URL = 'https://ibzeknzhdemrxrwnrvdy.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemVrbnpoZGVtcnhyd25ydmR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc5OTMwNSwiZXhwIjoyMDkxMzc1MzA1fQ.rv6eFip2Gin9O4Ihp1tyLInG7NueXe-MSGDs1auvDQE';

const USERS = [
  {
    email: 'admin@healthbook.com',
    password: 'Password123!',
    role: 'admin',
    full_name: 'System Administrator',
    phone: '+1-555-0001',
  },
  {
    email: 'doctor@healthbook.com',
    password: 'Password123!',
    role: 'doctor',
    full_name: 'Dr. Demo Doctor',
    phone: '+1-555-0002',
  },
  {
    email: 'patient@healthbook.com',
    password: 'Password123!',
    role: 'patient',
    full_name: 'Test Patient',
    phone: '+1-555-0003',
  },
];

async function createAuthUser(user) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,           // auto-confirm email
      user_metadata: { full_name: user.full_name },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // If user already exists, that's fine — fetch their id instead
    if (data?.msg?.includes('already been registered') || data?.message?.includes('already been registered')) {
      console.log(`  ⚠️  ${user.email} already exists in auth — fetching ID...`);
      return await getExistingUserId(user.email);
    }
    console.error(`  ❌ Failed to create ${user.email}:`, data);
    return null;
  }

  console.log(`  ✅ Created auth user: ${user.email}  (id: ${data.id})`);
  return data.id;
}

async function getExistingUserId(email) {
  // List users and find the matching one
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  });
  const data = await res.json();
  const found = data.users?.find(u => u.email === email);
  if (found) {
    console.log(`  ✅ Found existing user: ${email}  (id: ${found.id})`);
    return found.id;
  }
  console.error(`  ❌ Could not find existing user: ${email}`);
  return null;
}

async function updatePublicUserRole(userId, user) {
  // First check if a public.users row exists (the trigger should have made one)
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`,
    {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Accept': 'application/json',
      },
    }
  );
  const existing = await checkRes.json();

  if (existing.length > 0) {
    // Row exists — update role, full_name, phone
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          role: user.role,
          full_name: user.full_name,
          phone: user.phone,
        }),
      }
    );
    if (patchRes.ok) {
      console.log(`  ✅ Updated public.users role → ${user.role}`);
    } else {
      console.error(`  ❌ Failed to update role:`, await patchRes.text());
    }
  } else {
    // No row yet — insert one
    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          id: userId,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          phone: user.phone,
        }),
      }
    );
    if (insertRes.ok) {
      console.log(`  ✅ Inserted public.users row with role → ${user.role}`);
    } else {
      console.error(`  ❌ Failed to insert public.users row:`, await insertRes.text());
    }
  }
}

// ── Main ──────────────────────────────────────────
async function main() {
  console.log('🔧 Seeding HealthBook test users into Supabase...\n');

  for (const user of USERS) {
    console.log(`📌 ${user.role.toUpperCase()} — ${user.email}`);

    const userId = await createAuthUser(user);
    if (!userId) {
      console.log('   Skipping role update.\n');
      continue;
    }

    await updatePublicUserRole(userId, user);
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Done! You can now log in with:');
  console.log('');
  console.log('   Admin:   admin@healthbook.com   / Password123!');
  console.log('   Doctor:  doctor@healthbook.com  / Password123!');
  console.log('   Patient: patient@healthbook.com / Password123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
