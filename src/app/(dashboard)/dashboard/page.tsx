import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Home, HandHeart, Calendar, FileText, Wallet } from 'lucide-react'
import Greeting from './greeting'

// ==========================================
// 1. SKELETON COMPONENT (Loading State)
// ==========================================
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 5 Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 h-28">
            <div className="flex justify-between items-start mb-2">
              <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
              <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
            </div>
            <div className="w-12 h-6 bg-gray-200 rounded mt-4"></div>
          </div>
        ))}
      </div>

      {/* 2 Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-64">
            <div className="w-1/3 h-5 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// 2. ASYNC DATA FETCHER COMPONENT
// ==========================================
async function DashboardData() {
  const supabase = await createClient()

  // Ambil tanggal rentang bulan ini
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  const today = now.toISOString().split('T')[0]

  // Jalankan semua query secara paralel untuk unjuk kerja optimal
  const [
    { count: countKeluarga },
    { count: countBansos },
    { count: countKegiatan },
    { count: countSurat },
    { count: countRetribusi },
    { data: suratTerbaru },
    { data: kegiatanMendatang }
  ] = await Promise.all([
    supabase.from('keluarga').select('*', { count: 'exact', head: true }),
    supabase.from('bansos').select('*', { count: 'exact', head: true }).eq('status', 'tersalurkan'),
    supabase.from('kegiatan').select('*', { count: 'exact', head: true }).gte('tanggal', firstDay).lte('tanggal', lastDay),
    supabase.from('surat').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('retribusi').select('*', { count: 'exact', head: true }).eq('status', 'belum_bayar'),
    // Fetch surat terbaru + relasi profil nama
    supabase.from('surat').select('*, profiles(nama)').order('created_at', { ascending: false }).limit(5),
    // Fetch kegiatan yang akan datang
    supabase.from('kegiatan').select('*').gte('tanggal', today).order('tanggal', { ascending: true }).limit(3)
  ])

  // Helper render badge untuk status surat
  const getBadgeSurat = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'diproses': return 'bg-blue-100 text-blue-700'
      case 'selesai': return 'bg-green-100 text-green-700'
      case 'ditolak': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      
      {/* 5 CARDS SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total KK */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden group hover:border-blue-200 transition">
           <div className="absolute top-4 right-4 w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Home size={20} strokeWidth={2.5} />
           </div>
           <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">Total KK Terdaftar</p>
           <h3 className="text-3xl font-extrabold text-gray-800">{countKeluarga || 0}</h3>
        </div>

        {/* Card 2: Bansos Aktif */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden group hover:border-green-200 transition">
           <div className="absolute top-4 right-4 w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <HandHeart size={20} strokeWidth={2.5} />
           </div>
           <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">Penerima Bansos Aktif</p>
           <h3 className="text-3xl font-extrabold text-gray-800">{countBansos || 0}</h3>
        </div>

        {/* Card 3: Kegiatan Bulan Ini */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden group hover:border-purple-200 transition">
           <div className="absolute top-4 right-4 w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Calendar size={20} strokeWidth={2.5} />
           </div>
           <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">Kegiatan Bulan Ini</p>
           <h3 className="text-3xl font-extrabold text-gray-800">{countKegiatan || 0}</h3>
        </div>

        {/* Card 4: Surat Pending */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden group hover:border-orange-200 transition">
           <div className="absolute top-4 right-4 w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <FileText size={20} strokeWidth={2.5} />
           </div>
           <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">Surat Pending</p>
           <h3 className="text-3xl font-extrabold text-gray-800">{countSurat || 0}</h3>
        </div>

        {/* Card 5: Retribusi Belum Lunas */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 relative overflow-hidden group hover:border-red-200 transition">
           <div className="absolute top-4 right-4 w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Wallet size={20} strokeWidth={2.5} />
           </div>
           <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">Retribusi Blm Lunas</p>
           <h3 className="text-3xl font-extrabold text-gray-800">{countRetribusi || 0}</h3>
        </div>

      </div>

      {/* 2 TABLES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table 1: Surat Terbaru */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-800">Surat Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Pemohon</th>
                  <th className="px-5 py-3 font-semibold">Jenis Surat</th>
                  <th className="px-5 py-3 font-semibold">Tanggal</th>
                  <th className="px-5 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {suratTerbaru && suratTerbaru.length > 0 ? suratTerbaru.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5 font-medium text-gray-700">
                      {/* Pastikan join satu-ke-satu / one-to-many di handle dengan aman */}
                      {Array.isArray(s.profiles) ? s.profiles[0]?.nama : s.profiles?.nama || 'Tanpa Nama'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 capitalize">{s.jenis_surat?.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${getBadgeSurat(s.status)}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">Belum ada data surat.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Kegiatan Mendatang */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-800">Kegiatan Mendatang</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Judul</th>
                  <th className="px-5 py-3 font-semibold">Tanggal</th>
                  <th className="px-5 py-3 font-semibold">Lokasi</th>
                  <th className="px-5 py-3 font-semibold text-center">Kuota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {kegiatanMendatang && kegiatanMendatang.length > 0 ? kegiatanMendatang.map((k: any) => (
                  <tr key={k.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5 font-medium text-gray-700">{k.judul}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {new Date(k.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 line-clamp-1">{k.lokasi}</td>
                    <td className="px-5 py-3.5 text-center text-gray-500">
                      {k.kuota ? (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">{k.kuota} org</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">Tidak ada jadwal kegiatan terdekat.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================
export default async function DashboardOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userName = 'Bapak/Ibu'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('nama').eq('id', user.id).single()
    if (profile?.nama) userName = profile.nama
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <Greeting userName={userName} />
      </div>

      {/* Boundary Suspense untuk loading skeleton sementara data dari Supabase di-fetch */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  )
}
