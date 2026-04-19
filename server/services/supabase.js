/**
 * BACKWARDS COMPATIBILITY SHIM
 *
 * The Supabase client and all service logic has been split into
 * individual files for clarity and testability:
 *
 *   - Supabase client  →  ../lib/supabase.js
 *   - Station service  →  ./station.service.js
 *   - Booking service  →  ./booking.service.js
 *   - Charger service  →  ./charger.service.js
 *   - Review service   →  ./review.service.js
 *
 * This file re-exports everything so any legacy imports still work.
 */

export { default } from '../lib/supabase.js'
export { stationService } from './station.service.js'
export { bookingService } from './booking.service.js'
export { chargerService } from './charger.service.js'
export { reviewService } from './review.service.js'
