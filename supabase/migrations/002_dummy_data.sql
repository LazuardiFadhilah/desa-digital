-- ============================================================
-- DESA DIGITAL - Dummy Data (Development Only)
-- Jalankan di: Supabase Dashboard > SQL Editor
-- CATATAN: Jalankan SETELAH 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- PERHATIAN: FK KE PROFILES
-- Tabel bansos, surat, dan retribusi membutuhkan profiles.id
-- yang valid. Karena profiles.id FK ke auth.users, kita perlu
-- memasukkan dummy profile secara manual dengan cara di bawah.
--
-- Cara paling mudah di Supabase:
--   1. Daftar user via Supabase Dashboard > Auth > Users > Add user
--   2. Copy UUID user tersebut
--   3. Ganti semua '00000000-0000-0000-0000-000000000001' dengan UUID asli
--
-- ATAU jalankan blok "WORKAROUND" di bawah ini (hanya untuk dev):
-- ============================================================

-- [WORKAROUND DEV] Insert dummy row ke auth.users agar FK tidak error
-- Hapus bagian ini di production!
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'warga.dummy@desadigital.id',
    '',
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert dummy profile yang merujuk ke auth.users di atas
INSERT INTO profiles (id, nama, role, rt, rw, no_hp)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Heru Santoso',
  'warga',
  '003',
  '001',
  '081234567890'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 1. KELUARGA - 3 Kartu Keluarga
-- ============================================================
INSERT INTO keluarga (id, no_kk, nama_kepala, rt, rw, alamat) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    '3273010101870001',
    'Suharto',
    '003',
    '001',
    'Jl. Mawar No. 12, Kel. Sukamaju'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    '3273010203920002',
    'Ahmad Fauzi',
    '003',
    '002',
    'Jl. Melati No. 7, Kel. Sukamaju'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    '3273010508850003',
    'Bambang Wijaya',
    '004',
    '001',
    'Jl. Kenanga No. 25, Kel. Sukamaju'
  );

-- ============================================================
-- 2. ANGGOTA - 2–3 Anggota per Keluarga
-- ============================================================

-- Keluarga 1: Suharto (3 anggota)
INSERT INTO anggota (id, keluarga_id, nama, nik, hubungan, tgl_lahir, jenis_kelamin) VALUES
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Suharto',
    '3273010101870001',
    'Kepala Keluarga',
    '1987-01-01',
    'L'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Sri Mulyani',
    '3273010204900002',
    'Istri',
    '1990-04-02',
    'P'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Dedi Suharto',
    '3273011503120003',
    'Anak',
    '2012-03-15',
    'L'
  );

-- Keluarga 2: Ahmad Fauzi (2 anggota)
INSERT INTO anggota (id, keluarga_id, nama, nik, hubungan, tgl_lahir, jenis_kelamin) VALUES
  (
    'bbbbbbbb-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Ahmad Fauzi',
    '3273010302920004',
    'Kepala Keluarga',
    '1992-02-03',
    'L'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000005',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Siti Rahayu',
    '3273012007940005',
    'Istri',
    '1994-07-20',
    'P'
  );

-- Keluarga 3: Bambang Wijaya (3 anggota)
INSERT INTO anggota (id, keluarga_id, nama, nik, hubungan, tgl_lahir, jenis_kelamin) VALUES
  (
    'bbbbbbbb-0000-0000-0000-000000000006',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'Bambang Wijaya',
    '3273010508850006',
    'Kepala Keluarga',
    '1985-08-05',
    'L'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000007',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'Dewi Lestari',
    '3273011109880007',
    'Istri',
    '1988-09-11',
    'P'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000008',
    'aaaaaaaa-0000-0000-0000-000000000003',
    'Rizki Bambang',
    '3273010606110008',
    'Anak',
    '2011-06-06',
    'L'
  );

-- ============================================================
-- 3. BANSOS - 2 Program Bantuan Sosial
-- (penerima_id merujuk ke profiles dummy di atas)
-- ============================================================
INSERT INTO bansos (id, nama_program, penerima_id, jumlah_bantuan, periode, status, catatan) VALUES
  (
    'cccccccc-0000-0000-0000-000000000001',
    'Program Keluarga Harapan (PKH)',
    '00000000-0000-0000-0000-000000000001',
    900000,
    'Triwulan I 2026',
    'tersalurkan',
    'Bantuan sudah dicairkan melalui rekening KKS'
  ),
  (
    'cccccccc-0000-0000-0000-000000000002',
    'Bantuan Pangan Non Tunai (BPNT)',
    '00000000-0000-0000-0000-000000000001',
    200000,
    'Maret 2026',
    'pending',
    'Menunggu verifikasi data dari Dinas Sosial'
  );

-- ============================================================
-- 4. KEGIATAN - 3 Agenda Desa
-- 1 sudah lewat, 2 mendatang (relatif terhadap 2026-03-18)
-- ============================================================
INSERT INTO kegiatan (id, judul, deskripsi, tanggal, waktu_mulai, waktu_selesai, lokasi, kuota, status) VALUES
  (
    'dddddddd-0000-0000-0000-000000000001',
    'Gotong Royong Bersih Desa',
    'Kegiatan rutin bersih-bersih lingkungan desa setiap bulan. Warga diharapkan membawa peralatan kebersihan masing-masing.',
    '2026-02-22',
    '07:00',
    '11:00',
    'Balai Desa Sukamaju',
    NULL,
    'selesai'
  ),
  (
    'dddddddd-0000-0000-0000-000000000002',
    'Posyandu Balita & Lansia',
    'Pemeriksaan kesehatan rutin untuk balita dan lansia. Disediakan imunisasi gratis untuk balita usia 0–5 tahun.',
    '2026-03-25',
    '08:00',
    '12:00',
    'Pos Kesehatan Desa (Poskesdes) RT 003',
    50,
    'aktif'
  ),
  (
    'dddddddd-0000-0000-0000-000000000003',
    'Pelatihan UMKM Digital Desa',
    'Workshop pemanfaatan media sosial dan marketplace untuk pengembangan usaha warga. Peserta mendapat sertifikat desa.',
    '2026-04-12',
    '09:00',
    '15:00',
    'Aula Kantor Kepala Desa',
    30,
    'aktif'
  );

-- ============================================================
-- 5. SURAT - 3 Permohonan dengan Status Berbeda
-- ============================================================
INSERT INTO surat (id, pemohon_id, jenis_surat, keperluan, status, catatan_petugas, file_url) VALUES
  (
    'eeeeeeee-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'keterangan_domisili',
    'Persyaratan pembukaan rekening bank BRI',
    'pending',
    NULL,
    NULL
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'keterangan_tidak_mampu',
    'Pengajuan beasiswa pendidikan anak ke Dinas Pendidikan',
    'diproses',
    'Sedang menunggu tanda tangan Kepala Desa. Estimasi selesai 2 hari kerja.',
    NULL
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'keterangan_usaha',
    'Persyaratan pengajuan KUR (Kredit Usaha Rakyat) ke BNI',
    'selesai',
    'Surat sudah ditandatangani dan distempel. Silakan ambil di kantor desa.',
    'https://vkettymhnnszemtfmdxf.supabase.co/storage/v1/object/public/surat/surat-usaha-2026-003.pdf'
  );

-- ============================================================
-- 6. RETRIBUSI - 3 Tagihan dengan Status Berbeda
-- ============================================================
INSERT INTO retribusi (id, warga_id, jenis, jumlah, jatuh_tempo, status, midtrans_id) VALUES
  (
    'ffffffff-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Iuran Kebersihan',
    25000,
    '2026-03-31',
    'belum_bayar',
    NULL
  ),
  (
    'ffffffff-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Iuran Keamanan',
    30000,
    '2026-02-28',
    'lunas',
    'ORDER-DESADIGITAL-20260228-002'
  ),
  (
    'ffffffff-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Iuran Kebersihan',
    25000,
    '2026-02-28',
    'jatuh_tempo',
    NULL
  );

-- ============================================================
-- END OF DUMMY DATA
-- ============================================================
