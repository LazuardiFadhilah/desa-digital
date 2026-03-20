import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Ikon / Ilustrasi */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-red-600 text-3xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Akses Terbatas
          </h1>
        </div>

        {/* Pesan */}
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Maaf, halaman ini hanya dapat diakses oleh petugas desa yang berwenang. Hubungi administrator untuk informasi lebih lanjut.
        </p>

        {/* Tombol Kembali ke Login */}
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#15803d] hover:bg-green-800 active:bg-green-900 text-white font-semibold py-2.5 text-sm transition"
        >
          Kembali ke Login
        </Link>
      </div>
    </main>
  )
}
