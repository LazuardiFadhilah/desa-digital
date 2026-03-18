'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client untuk Client Components ('use client').
 *
 * Gunakan di: form interaktif, auth listener, real-time subscription.
 *
 * Contoh:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('kegiatan').select()
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
