import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

/**
 * Middleware Next.js — menjalankan updateSession di setiap request.
 *
 * updateSession bertugas:
 * 1. Me-refresh Supabase auth token (access + refresh token via cookie)
 * 2. Redirect ke /login jika user belum login dan mengakses halaman protected
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware di semua route KECUALI:
     * - _next/static  (file statis Next.js)
     * - _next/image   (optimisasi gambar Next.js)
     * - favicon.ico   (ikon browser)
     * - File dengan ekstensi (.svg, .png, .jpg, dll)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
