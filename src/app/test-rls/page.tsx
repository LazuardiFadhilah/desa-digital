'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestRLSPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message])
    console.log(message)
  }

  const runRLSTest = async () => {
    setIsLoading(true)
    setLogs([]) // bersihkan log sebelumnya
    const supabase = createClient()
    
    addLog('========== MEMULAI TEST RLS ==========')

    // 1. Cek sesi user saat ini
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      addLog('👤 STATUS: Tidak terautentikasi (Public)')
    } else {
      // Ambil role dari profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        
      addLog(`👤 STATUS: Login sebagai [${profile?.role?.toUpperCase() || 'UNKNOWN'}]`)
      addLog(`ID: ${user.id}`)
    }

    addLog('--------------------------------------')

    // 2. Test Fetch Data Keluarga
    addLog('🔍 Mengambil data tabel KELUARGA...')
    const { data: keluarga, error: errKeluarga } = await supabase
      .from('keluarga')
      .select('*')

    if (errKeluarga) {
      addLog(`❌ Error Keluarga: ${errKeluarga.message}`)
    } else {
      addLog(`✅ Keluarga diambil: ${keluarga.length} baris`)
      if (keluarga.length === 0) {
        addLog('💡 Catatan: Record 0 bisa berarti tabel kosong, atau RLS Anda menolak akses baca ditarik jadi empty array.')
      }
    }

    addLog('--------------------------------------')

    // 3. Test Fetch Data Surat
    addLog('🔍 Mengambil data tabel SURAT...')
    const { data: surat, error: errSurat } = await supabase
      .from('surat')
      .select('*')

    if (errSurat) {
      addLog(`❌ Error Surat: ${errSurat.message}`)
    } else {
      addLog(`✅ Surat diambil: ${surat.length} baris`)
    }

    // 4. Test Error "Not Authorized" (Insert)
    addLog('--------------------------------------')
    addLog('🔍 Test INSERT ke tabel KELUARGA (diharapkan ERROR)...')
    const { error: errInsert } = await supabase
      .from('keluarga')
      .insert([{
        no_kk: '9999999999999999',
        nama_kepala: 'Test RLS',
        rt: '00', rw: '00', alamat: 'Test'
      }])

    if (errInsert) {
      addLog(`✅ Berhasil tertolak dengan error: ${errInsert.message}`)
    } else {
      addLog('⚠️ Insert berhasil! Jika Anda Warga/Public, berarti RLS Anda BOCOR!')
    }

    addLog('========== TEST RLS SELESAI ==========')
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          Dashboard Pengujian RLS Supabase
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          Klik tombol di bawah ini untuk menjalankan skenario test RLS. Hasilnya akan langsung ditampilkan di layar aplikasi dan di Console Browser Anda.
        </p>
        
        <button
          onClick={runRLSTest}
          disabled={isLoading}
          className="bg-[#15803d] hover:bg-green-800 text-white font-semibold py-2.5 px-6 rounded-lg disabled:opacity-50 transition shadow-sm"
        >
          {isLoading ? 'Sedang Menguji...' : 'Jalankan Test RLS'}
        </button>

        <div className="mt-8">
          <div className="bg-slate-900 rounded-lg p-5 h-[450px] overflow-y-auto shadow-inner">
            {logs.length === 0 ? (
              <p className="text-slate-500 font-mono text-sm flex items-center h-full justify-center">
                Belum ada log. Silahkan klik tombol uji.
              </p>
            ) : (
              <ul className="space-y-3">
                {logs.map((log, i) => (
                  <li key={i} className={`font-mono text-[13px] leading-relaxed ${
                    log.includes('❌') ? 'text-red-400' :
                    log.includes('✅') ? 'text-emerald-400' :
                    log.includes('⚠️') ? 'text-amber-400' :
                    log.includes('👤') ? 'text-sky-300 font-semibold' :
                    log.includes('💡') ? 'text-purple-300' :
                    log.includes('===') ? 'text-slate-400 text-center font-bold tracking-widest my-4' :
                    log.includes('---') ? 'text-slate-600 text-center' :
                    'text-slate-300'
                  }`}>
                    {log}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
