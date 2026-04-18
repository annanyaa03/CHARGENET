const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

const isPlaceholder = (val) => {
  if (!val || val.trim() === '' || val.startsWith('ADD_YOUR')) return true;
  // URLs usually start with http
  if (val.startsWith('http')) return false;
  // Supabase keys are JWTs and almost always start with 'ey' or 'sb_' for newer formats
  if (val.length > 20 && !val.startsWith('ey') && !val.startsWith('sb_')) return true;
  return false;
};

// Whether Supabase is properly configured
const supabaseEnabled = !isPlaceholder(SUPABASE_URL) && !isPlaceholder(SUPABASE_ANON_KEY);
const adminEnabled = supabaseEnabled && !isPlaceholder(SUPABASE_SERVICE_KEY);

if (!supabaseEnabled) {
  console.warn('[Supabase] CRITICAL WARNING: URL or Anon key is missing or invalid (must start with "ey"). Internal DB queries will be skipped.');
} else if (!adminEnabled) {
  console.warn('[Supabase] WARNING: Service role key missing or invalid — admin operations disabled.');
}

// Only create real clients when keys are valid
const supabase = supabaseEnabled ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const supabaseAdmin = adminEnabled ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : supabase;

module.exports = { 
  supabase, 
  supabaseAdmin, 
  supabaseEnabled, 
  adminEnabled,
  configStatus: {
    urlSet: !!SUPABASE_URL && !SUPABASE_URL.includes('ADD_YOUR'),
    anonKeyValid: supabaseEnabled,
    serviceKeyValid: adminEnabled
  }
};
