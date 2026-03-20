import { FileText } from 'lucide-react'

export default function SuratPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-green-100 text-[#15803d] rounded-full flex items-center justify-center mb-4">
        <FileText size={32} />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Surat & Izin</h1>
      <p className="text-gray-500 max-w-md">
        Halaman ini sedang dalam pengembangan. Fitur permohonan surat menyurat akan segera hadir di sini.
      </p>
    </div>
  )
}
