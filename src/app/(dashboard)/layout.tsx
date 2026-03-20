'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  House,
  Users,
  HandHeart,
  Calendar,
  FileText,
  Wallet,
  Menu,
  LogOut,
  X
} from 'lucide-react'

// Konfigurasi daftar menu sidebar
const MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: House },
  { name: 'Data Keluarga', path: '/dashboard/keluarga', icon: Users },
  { name: 'Bantuan Sosial', path: '/dashboard/bansos', icon: HandHeart },
  { name: 'Kegiatan Desa', path: '/dashboard/kegiatan', icon: Calendar },
  { name: 'Surat & Izin', path: '/dashboard/surat', icon: FileText },
  { name: 'Retribusi', path: '/dashboard/retribusi', icon: Wallet },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userName, setUserName] = useState<string>('Memuat...')

  // Fetch profile user dari Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Lempar ke login jika tidak terautentikasi
        router.push('/login')
        return
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('nama')
        .eq('id', user.id)
        .single()
        
      if (profile) {
        setUserName(profile.nama)
      } else {
        setUserName('Pengguna Desa')
      }
    }
    fetchProfile()
  }, [supabase, router])

  // Handler logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Deteksi halaman aktif untuk judul header
  // Jika pathname sangat persis dengan /dashboard, jadikan ia aktif.
  // Jika ada subpath (ex: /dashboard/keluarga/detail), cek dengan startsWith
  const activeMenuObj = MENU_ITEMS.find(item => item.path === pathname) 
    || MENU_ITEMS.find(item => pathname.startsWith(item.path) && item.path !== '/dashboard')
  
  const activePageName = activeMenuObj?.name || 'Dashboard'

  return (
    // Wrapper full viewport dengan height fixed h-screen.
    <div className="flex bg-[#f9fafb] h-screen overflow-hidden text-gray-900 font-sans">
      
      {/* =========================================
          MOBILE OVERLAY
          (Background gelap di balik drawer)
          ========================================= */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* =========================================
          SIDEBAR
          ========================================= */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full w-[240px] bg-[#14532d] text-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Logo */}
        <div className="flex h-[64px] items-center px-6 border-b border-white/10 relative shrink-0">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
            <span className="text-xl">🏛️</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">Desa Digital</h1>
          
          {/* Tombol tutup sidebar (hanya di mobile) */}
          <button 
            className="absolute right-4 p-1 rounded-md text-white/70 hover:bg-white/10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.path === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname.startsWith(item.path)

            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setIsSidebarOpen(false)} // Tutup drawer otomatis setelah navigasi (mobile)
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? 'bg-[#15803d] text-white shadow-md ring-1 ring-white/10' 
                    : 'text-green-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon 
                  size={18} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={isActive ? 'text-white' : 'text-green-200 opacity-80'} 
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* =========================================
          MAIN CONTENT AREA wrapping HEADER & KONTEN
          ========================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-[64px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-4">
            {/* Tombol Hamburger (hanya mobile) */}
            <button 
              className="p-2 -ml-2 rounded-md hover:bg-gray-100 text-gray-600 lg:hidden transition"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} strokeWidth={2} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
              {activePageName}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Nama user, disembunyikan teks valuenya di mobile kecil */}
            <div className="hidden min-[400px]:flex items-center text-sm text-gray-600 font-medium bg-gray-50/80 px-4 py-1.5 rounded-full border border-gray-200 shadow-inner">
              <span className="text-gray-400 mr-1.5">Halo,</span> 
              <span className="text-gray-800">{userName}</span>
            </div>
            
            {/* Tombol Logout */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-600 font-medium hover:bg-red-50 hover:text-red-700 px-3 sm:px-4 py-2 rounded-lg transition"
              title="Keluar dari sistem"
            >
              <LogOut size={18} strokeWidth={2} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* KONTEN (dengan scrollbar mandiri) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#f9fafb]">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  )
}
