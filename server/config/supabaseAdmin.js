/**
 * Supabase Admin Client
 * 
 * Uses SERVICE_ROLE_KEY for backend operations.
 * NEVER expose this client or key to the frontend!
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env file:\n' +
        '- SUPABASE_URL\n' +
        '- SUPABASE_SERVICE_KEY'
    );
}

// Admin client - bypasses RLS (use with caution)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

module.exports = { supabaseAdmin };
