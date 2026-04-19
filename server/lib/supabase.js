import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required')
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required')
}

// Single shared Supabase client with service role key
// Import this EVERYWHERE instead of creating new clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default supabase
