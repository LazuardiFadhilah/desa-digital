import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client untuk Server Components, Server Actions, dan Route Handlers.
 *
 * Membaca & menulis cookie session secara otomatis sehingga user session
 * selalu tersedia di server side.
 *
 * PENTING: Fungsi ini async karena cookies() di Next.js 15 adalah async.
 *
 * Contoh di Server Component:
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *
 * Contoh di Server Action:
 *   'use server'
 *   const supabase = await createClient()
 *   await supabase.from('surat').insert({ ... })
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Dipanggil dari Server Component (read-only context) — aman diabaikan.
            // Middleware akan menangani refresh session sebelum request berikutnya.
          }
        },
      },
    }
  )
}
