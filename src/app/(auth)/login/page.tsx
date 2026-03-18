'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ============================================================
// Halaman Login — Dashboard Desa Digital
// ============================================================
// Alur:
//  1. User mengisi email & password, lalu klik "Masuk".
//  2. Autentikasi dilakukan via Supabase Auth.
//  3. Setelah berhasil, role user di-fetch dari tabel `profiles`.
//  4. Role 'manager'  → redirect ke /dashboard
//     Role lainnya    → redirect ke /unauthorized
// ============================================================

export default function LoginPage() {
  const router = useRouter()

  // ---------- State form ----------
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ============================================================
  // Handler submit form login
  // ============================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    const supabase = createClient()

    // --- Langkah 1: Login dengan Supabase Auth ---
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      // Tampilkan pesan error yang ramah kepada pengguna
      setErrorMessage('Email atau password salah. Silakan coba lagi.')
      setIsLoading(false)
      return
    }

    // --- Langkah 2: Ambil role dari tabel profiles ---
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      // Profil tidak ditemukan — anggap bukan manager
      setErrorMessage('Akun tidak ditemukan atau belum dikonfigurasi. Hubungi administrator.')
      setIsLoading(false)
      return
    }

    // --- Langkah 3: Redirect berdasarkan role ---
    if (profile.role === 'manager') {
      router.push('/dashboard')
    } else {
      // Role selain manager tidak punya akses dashboard
      router.push('/unauthorized')
    }
  }

  // ============================================================
  // Render UI
  // ============================================================
  return (
    // --- Background abu muda, layout tengah layar ---
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      
      {/* Kartu form login */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* --- Header: Logo / Nama Aplikasi --- */}
        <div className="flex flex-col items-center mb-8">
          {/* Ikon peta / desa sederhana menggunakan emoji atau ganti dengan <Image /> */}
          <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center mb-3">
            <span className="text-white text-2xl">🏛️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Dashboard Desa Digital
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Silakan masuk untuk melanjutkan
          </p>
        </div>

        {/* --- Pesan error (muncul hanya bila ada error) --- */}
        {errorMessage && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* --- Form Login --- */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Field Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@desa.go.id"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
            />
          </div>

          {/* Field Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
            />
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={isLoading}
            // Warna hijau tua (#15803d) sesuai nuansa pemerintahan
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#15803d] hover:bg-green-800 active:bg-green-900 text-white font-semibold py-2.5 text-sm transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {/* Loading spinner — tampil saat proses login */}
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* --- Footer informatif --- */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Hanya petugas yang terdaftar yang dapat mengakses sistem ini.
        </p>
      </div>
    </main>
  )
}
