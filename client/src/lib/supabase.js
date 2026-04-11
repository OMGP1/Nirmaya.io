/**
 * Supabase Client Configuration
 * For frontend use with ANON key (public, RLS-restricted access)
 * 
 * This configuration includes a workaround for the AbortError issue
 * caused by navigator.locks in development environments.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY'
  );
}

/**
 * Custom lock implementation that never aborts
 * This prevents the AbortError caused by navigator.locks in dev
 */
const customLock = async (name, acquireTimeout, callback) => {
  // Simply execute the callback without using navigator.locks
  // This is safe for single-tab development
  return await callback();
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'niramaya-auth',
    flowType: 'implicit', // Changed from pkce to implicit for simpler flow
    // Custom lock to prevent AbortError
    lock: customLock,
    // Increase timeouts
    lockAcquireTimeout: 30000,
  },
  global: {
    headers: {
      'X-Client-Info': 'niramaya-client',
    },
  },
  db: {
    schema: 'public',
  },
});

// Log initialization in development
if (import.meta.env.DEV) {
  console.log('Supabase client initialized:', supabaseUrl);
}

export default supabase;
