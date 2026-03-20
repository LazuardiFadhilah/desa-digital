import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Helper untuk me-refresh Supabase session di middleware Next.js.
 *
 * Middleware berjalan sebelum setiap request — ini adalah satu-satunya
 * tempat yang tepat untuk menulis cookie baru (refresh token) di server side.
 *
 * Cara pakai di middleware.ts (root project):
 *
 *   import { updateSession } from '@/lib/supabase/middleware'
 *
 *   export async function middleware(request: NextRequest) {
 *     return await updateSession(request)
 *   }
 *
 *   export const config = {
 *     matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
 *   }
 */
export async function updateSession(request: NextRequest) {
  // Buat response dulu — akan dimodifikasi jika ada cookie yang perlu di-set
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookie di request (untuk dibaca Server Components sesudahnya)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Buat ulang response agar cookie baru ikut dikirim ke browser
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // PENTING: Panggil getUser() untuk memvalidasi & me-refresh token.
  // Jangan hapus baris ini — tanpanya session tidak akan pernah diperbarui.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/unauthorized')

  // 1. Jika belum login dan coba akses halaman selain auth -> lempar ke login
  if (!user && !isAuthRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // 2. Jika sudah login dan coba akses /login -> otomatis lempar ke dashboard (root)
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/'
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}
