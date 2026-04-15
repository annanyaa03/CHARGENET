const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

async function checkProfiles() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('ADD_YOUR')) {
        console.log('Credentials not set');
        return;
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from('profiles').select('id, full_name').limit(5);
    if (error) {
        console.error('Error fetching profiles:', error.message);
    } else {
        console.log('Profiles found:', data);
    }
}

checkProfiles();
