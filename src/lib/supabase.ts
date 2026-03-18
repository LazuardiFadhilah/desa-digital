/**
 * @deprecated File ini sudah dipecah menjadi:
 *   - lib/supabase/client.ts  → untuk Client Components
 *   - lib/supabase/server.ts  → untuk Server Components / Server Actions
 *   - lib/supabase/middleware.ts → untuk Middleware
 *
 * Re-export untuk backward compatibility (jika ada kode lama yang masih import dari sini)
 */
export { createClient } from './supabase/client'
export { createClient as createServerSupabaseClient } from './supabase/server'
