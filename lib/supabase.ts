import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ================================================================
// BROWSER CLIENT
// Dipakai di: Client Components (file dengan 'use client')
// Contoh: form interaktif, auth listener, real-time subscription
// ================================================================
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ================================================================
// SERVER CLIENT
// Dipakai di: Server Components, Server Actions, Route Handlers
// Bisa membaca session user via cookie (auth-aware)
// ================================================================
export async function createServerSupabaseClient() {
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
            // setAll dipanggil dari Server Component — bisa diabaikan
            // jika ada middleware yang me-refresh sesi
          }
        },
      },
    }
  )
}
