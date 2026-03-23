const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const {
  getSupabaseServerUrl,
  getSupabaseServiceRoleKey,
} = require('../lib/supabaseServerEnv');

const supabaseUrl = getSupabaseServerUrl();
const supabaseKey = getSupabaseServiceRoleKey();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase URL and service key are required (SUPABASE_URL / REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / SUPABASE_KEY / REACT_APP_SUPABASE_KEY)'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabase };
