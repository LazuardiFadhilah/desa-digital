import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientLayout from './client-layout'

// ==========================================
// SERVER COMPONENT LAYOUT
// Melindungi seluruh halaman dalam rute /dashboard
// dari intervensi user biasa (Role harus Manager)
// ==========================================
export default async function DashboardServerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Karena middleware di root sudah melempar kalau unauthenticated, 
  // kondisi ini hanya buat double check demi keamanan tambahan. 
  if (!user) {
    redirect('/login')
  }

  // Mengambil profile berdasarkan user ID yang terpaut
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama, role')
    .eq('id', user.id)
    .single()

  // BLOKIR AKSES JIKA BUKAN MANAGER
  if (!profile || profile.role !== 'manager') {
    redirect('/unauthorized')
  }

  // Jika aman, render layout UI dan kirim data nama agar Sidebar bisa memakainya
  return (
    <ClientLayout userName={profile.nama || 'Pengguna Desa'}>
      {children}
    </ClientLayout>
  )
}
