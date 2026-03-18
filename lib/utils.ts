import { type ClassValue, clsx } from 'clsx'

// Helper untuk gabungkan class names (berguna dengan Tailwind)
export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

// Format angka jadi format Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format tanggal ke format Indonesia
export function formatTanggal(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}
