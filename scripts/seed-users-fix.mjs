/**
 * Fix: Create admin in auth (handle existing public.users row),
 *      Create patient in auth (retry with longer timeout)
 */

const SUPABASE_URL = 'https://ibzeknzhdemrxrwnrvdy.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemVrbnpoZGVtcnhyd25ydmR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc5OTMwNSwiZXhwIjoyMDkxMzc1MzA1fQ.rv6eFip2Gin9O4Ihp1tyLInG7NueXe-MSGDs1auvDQE';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
};

async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  ⏳ Retrying (${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ── Step 1: Fix admin ──
// The admin row already exists in public.users (from seed migration 005)
// but NOT in auth.users. We need to:
//   a) Delete the orphan public.users row
//   b) Create the auth user (which triggers handle_new_user → re-creates public.users)
//   c) Update the role to 'admin'
async function fixAdmin() {
  console.log('📌 ADMIN — admin@healthbook.com');

  // a) Delete orphan public.users row
  console.log('  🗑️  Removing orphan public.users row...');
  const delRes = await withRetry(() =>
    fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.admin@healthbook.com`, {
      method: 'DELETE',
      headers: { ...headers, 'Prefer': 'return=minimal' },
    })
  );
  console.log(`  ${delRes.ok ? '✅' : '❌'} Delete result: ${delRes.status}`);

  // b) Create auth user
  console.log('  🔒 Creating auth user...');
  const createRes = await withRetry(() =>
    fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: 'admin@healthbook.com',
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { full_name: 'System Administrator' },
      }),
    })
  );
  const authData = await createRes.json();
  if (!createRes.ok) {
    console.error('  ❌ Auth create failed:', authData);
    return;
  }
  const userId = authData.id;
  console.log(`  ✅ Auth user created (id: ${userId})`);

  // c) Update public.users role to admin
  // Wait a moment for the trigger to fire
  await new Promise(r => setTimeout(r, 1000));
  console.log('  🔄 Updating role to admin...');
  const patchRes = await withRetry(() =>
    fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        role: 'admin',
        full_name: 'System Administrator',
        phone: '+1-555-0001',
      }),
    })
  );
  console.log(`  ${patchRes.ok ? '✅' : '❌'} Role update: ${patchRes.status}`);
  console.log('');
}

// ── Step 2: Create patient ──
async function createPatient() {
  console.log('📌 PATIENT — patient@healthbook.com');
  console.log('  🔒 Creating auth user...');
  const createRes = await withRetry(() =>
    fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: 'patient@healthbook.com',
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { full_name: 'Test Patient' },
      }),
    })
  );
  const authData = await createRes.json();
  if (!createRes.ok) {
    // If already exists, just find and update
    if (JSON.stringify(authData).includes('already')) {
      console.log('  ⚠️  Already exists — looking up...');
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, { headers });
      const listData = await listRes.json();
      const found = listData.users?.find(u => u.email === 'patient@healthbook.com');
      if (found) {
        console.log(`  ✅ Found (id: ${found.id})`);
      }
    } else {
      console.error('  ❌ Failed:', authData);
    }
    console.log('');
    return;
  }

  console.log(`  ✅ Auth user created (id: ${authData.id})`);

  // Update phone
  await new Promise(r => setTimeout(r, 1000));
  const patchRes = await withRetry(() =>
    fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${authData.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ phone: '+1-555-0003' }),
    })
  );
  console.log(`  ${patchRes.ok ? '✅' : '❌'} Phone update: ${patchRes.status}`);
  console.log('');
}

// ── Main ──
async function main() {
  console.log('🔧 Fixing remaining test accounts...\n');

  await fixAdmin();
  await createPatient();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All accounts ready! Login credentials:');
  console.log('');
  console.log('   Admin:   admin@healthbook.com   / Password123!');
  console.log('   Doctor:  doctor@healthbook.com  / Password123!');
  console.log('   Patient: patient@healthbook.com / Password123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
