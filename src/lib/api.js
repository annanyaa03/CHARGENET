// import { supabase } from './supabase'

/**
 * DEPRECATED: Express Backend (localhost:5000) is no longer used.
 * All services have been migrated to use direct Supabase queries.
 */

export async function apiRequest() {
  console.error('apiRequest is DEPRECATED. Please use direct Supabase methods in your service files.')
  throw new Error('Express Backend is disabled. Migration to Supabase complete.')
}
