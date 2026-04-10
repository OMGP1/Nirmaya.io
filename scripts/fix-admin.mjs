/**
 * Fix admin account:
 * 1. Delete time_blocks referencing the orphan admin user
 * 2. Delete the orphan public.users row
 * 3. Create admin in auth.users (trigger recreates public.users)
 * 4. Update role to admin
 */

const SUPABASE_URL = 'https://ibzeknzhdemrxrwnrvdy.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemVrbnpoZGVtcnhyd25ydmR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc5OTMwNSwiZXhwIjoyMDkxMzc1MzA1fQ.rv6eFip2Gin9O4Ihp1tyLInG7NueXe-MSGDs1auvDQE';

const ADMIN_ID = '11111111-1111-1111-1111-111111111111';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
};

async function main() {
  console.log('🔧 Fixing admin account...\n');

  // Step 1: Delete time_blocks that reference this admin as created_by
  console.log('1️⃣  Deleting time_blocks referencing admin...');
  let res = await fetch(`${SUPABASE_URL}/rest/v1/time_blocks?created_by=eq.${ADMIN_ID}`, {
    method: 'DELETE',
    headers: { ...headers, 'Prefer': 'return=minimal' },
  });
  console.log(`   Result: ${res.status} ${res.ok ? '✅' : '❌'}`);
  if (!res.ok) console.log('   Body:', await res.text());

  // Step 2: Delete the orphan public.users row
  console.log('2️⃣  Deleting orphan public.users row...');
  res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${ADMIN_ID}`, {
    method: 'DELETE',
    headers: { ...headers, 'Prefer': 'return=minimal' },
  });
  console.log(`   Result: ${res.status} ${res.ok ? '✅' : '❌'}`);
  if (!res.ok) console.log('   Body:', await res.text());

  // Step 3: Create admin in auth.users
  console.log('3️⃣  Creating admin in auth...');
  res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: 'admin@healthbook.com',
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: 'System Administrator' },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.log(`   ❌ Failed:`, data);
    return;
  }
  console.log(`   ✅ Created (id: ${data.id})`);

  // Step 4: Wait for trigger, then update role
  await new Promise(r => setTimeout(r, 1500));
  console.log('4️⃣  Updating role to admin...');
  res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${data.id}`, {
    method: 'PATCH',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      role: 'admin',
      full_name: 'System Administrator',
      phone: '+1-555-0001',
    }),
  });
  console.log(`   Result: ${res.status} ${res.ok ? '✅' : '❌'}`);

  console.log('\n✅ Admin account ready: admin@healthbook.com / Password123!');
}

main().catch(console.error);
