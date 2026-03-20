import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Gunakan helper dari supabase untuk mengelola session dan route protection awal
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Semua route akan melalui middleware ini KECUALI yang diawali dengan:
     * - _next/static (file statis nextjs)
     * - _next/image (optimasi gambar)
     * - favicon.ico
     * - file dengan ekstensi statis murni (svg, png, jpg, dll)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
