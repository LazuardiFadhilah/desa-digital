// ===========================
// TIPE DATA UTAMA desa-digital
// ===========================

// ----------------------------------------------------------------
// AUTH & PROFILE
// ----------------------------------------------------------------
export type UserRole = 'admin' | 'petugas' | 'warga'

/** Data profil pengguna yang tersimpan di tabel `profiles` */
export interface Profile {
  id: string           // UUID, foreign key ke auth.users
  email: string
  nama_lengkap: string
  role: UserRole
  no_hp?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// DATA KEPENDUDUKAN
// ----------------------------------------------------------------
export type JenisKelamin = 'L' | 'P'

export type StatusHidup = 'hidup' | 'meninggal'

/** Kartu Keluarga */
export interface Keluarga {
  id: string
  no_kk: string            // 16 digit nomor KK
  kepala_keluarga: string  // Nama kepala keluarga
  alamat: string
  rt: string
  rw: string
  dusun?: string
  created_at: string
  updated_at: string
}

/** Anggota keluarga / data warga (KTP) */
export interface Anggota {
  id: string
  nik: string                        // 16 digit NIK
  nama: string
  tempat_lahir: string
  tanggal_lahir: string              // ISO date: "YYYY-MM-DD"
  jenis_kelamin: JenisKelamin
  agama: string
  pendidikan?: string
  pekerjaan?: string
  status_perkawinan?: string
  status_dalam_keluarga: string      // kepala / istri / anak / dll
  status_hidup: StatusHidup
  keluarga_id: string                // FK ke Keluarga.id
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// BANTUAN SOSIAL
// ----------------------------------------------------------------
export type StatusBansos = 'aktif' | 'tidak_aktif' | 'diusulkan' | 'ditolak'

/** Program bantuan sosial yang diterima warga */
export interface Bansos {
  id: string
  nama_program: string               // PKH, BPNT, BLT, dll
  warga_id: string                   // FK ke Anggota.id (penerima)
  keluarga_id?: string               // FK ke Keluarga.id (opsional, untuk program KK)
  status: StatusBansos
  nominal: number                    // Nominal dalam rupiah
  periode_mulai?: string             // ISO date
  periode_selesai?: string           // ISO date
  keterangan?: string
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// SURAT KETERANGAN
// ----------------------------------------------------------------
export type JenisSurat =
  | 'keterangan_domisili'
  | 'keterangan_tidak_mampu'
  | 'pengantar_ktp'
  | 'keterangan_usaha'
  | 'keterangan_kelahiran'
  | 'keterangan_kematian'
  | 'keterangan_belum_menikah'
  | 'pengantar_nikah'

export type StatusSurat = 'menunggu' | 'diproses' | 'selesai' | 'ditolak'

/** Pengajuan surat oleh warga */
export interface Surat {
  id: string
  nomor_surat?: string               // Nomor surat resmi setelah disetujui
  jenis: JenisSurat
  pemohon_id: string                 // FK ke Anggota.id (yang mengajukan)
  untuk_id?: string                  // FK ke Anggota.id (yang dituju, misal surat kematian)
  status: StatusSurat
  keperluan?: string                 // Keperluan pengajuan
  keterangan?: string                // Catatan dari petugas/admin
  diproses_oleh?: string             // FK ke Profile.id (petugas)
  tanggal_selesai?: string
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// RETRIBUSI & PEMBAYARAN
// ----------------------------------------------------------------
export type StatusPembayaran = 'pending' | 'berhasil' | 'gagal' | 'kadaluarsa'

/** Tagihan / retribusi desa */
export interface Retribusi {
  id: string
  warga_id: string                   // FK ke Anggota.id
  jenis: string                      // 'sampah', 'air', 'pajak_bumi', dll
  deskripsi?: string
  nominal: number                    // Dalam rupiah
  status: StatusPembayaran
  midtrans_order_id?: string         // ID order dari Midtrans
  midtrans_transaction_id?: string   // ID transaksi dari Midtrans
  tanggal_jatuh_tempo?: string       // ISO date
  tanggal_bayar?: string             // ISO date, diisi setelah bayar
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// KEGIATAN DESA
// ----------------------------------------------------------------
export type StatusKegiatan = 'akan_datang' | 'berlangsung' | 'selesai' | 'dibatalkan'

/** Kegiatan / agenda desa */
export interface Kegiatan {
  id: string
  judul: string
  deskripsi: string
  tanggal: string                    // ISO date
  waktu_mulai?: string               // "HH:MM"
  waktu_selesai?: string             // "HH:MM"
  lokasi: string
  status: StatusKegiatan
  dibuat_oleh: string                // FK ke Profile.id
  gambar_url?: string
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// UTILITY TYPES
// ----------------------------------------------------------------

/** Response wrapper untuk API routes */
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

/** Pagination helper */
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}
