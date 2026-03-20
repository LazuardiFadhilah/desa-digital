import { redirect } from 'next/navigation'

export default function Home() {
  // Mengarahkan langsung halaman utama ("/") menuju "/dashboard"
  redirect('/dashboard')
}
