-- ============================================================
-- DESA DIGITAL - Initial Schema Migration
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- Aktifkan ekstensi UUID (sudah aktif di Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- HELPER: Fungsi auto-update kolom updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. PROFILES
-- Data profil pengguna, terhubung ke Supabase Auth (auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'warga' CHECK (role IN ('manager', 'warga')),
  rt          TEXT,
  rw          TEXT,
  no_hp       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Profil pengguna aplikasi, berelasi 1-to-1 dengan auth.users';
COMMENT ON COLUMN profiles.role IS 'manager = admin desa, warga = penduduk biasa';

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 2. KELUARGA
-- Data Kartu Keluarga (KK)
-- ============================================================
CREATE TABLE IF NOT EXISTS keluarga (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  no_kk         TEXT NOT NULL UNIQUE,
  nama_kepala   TEXT NOT NULL,
  rt            TEXT NOT NULL,
  rw            TEXT NOT NULL,
  alamat        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE keluarga IS 'Data Kartu Keluarga (KK) warga desa';
COMMENT ON COLUMN keluarga.no_kk IS '16 digit nomor Kartu Keluarga, harus unik';

CREATE TRIGGER trg_keluarga_updated_at
  BEFORE UPDATE ON keluarga
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 3. ANGGOTA
-- Anggota tiap Kartu Keluarga (data warga per-KK)
-- ============================================================
CREATE TABLE IF NOT EXISTS anggota (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keluarga_id     UUID NOT NULL REFERENCES keluarga(id) ON DELETE CASCADE,
  nama            TEXT NOT NULL,
  nik             TEXT NOT NULL UNIQUE,
  hubungan        TEXT NOT NULL,               -- kepala, istri, anak, dll
  tgl_lahir       DATE NOT NULL,
  jenis_kelamin   TEXT NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE anggota IS 'Anggota keluarga sesuai Kartu Keluarga';
COMMENT ON COLUMN anggota.nik IS '16 digit Nomor Induk Kependudukan, harus unik';
COMMENT ON COLUMN anggota.keluarga_id IS 'FK ke tabel keluarga, cascade delete jika KK dihapus';

CREATE INDEX idx_anggota_keluarga_id ON anggota(keluarga_id);

CREATE TRIGGER trg_anggota_updated_at
  BEFORE UPDATE ON anggota
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 4. BANSOS
-- Data penerima bantuan sosial
-- ============================================================
CREATE TABLE IF NOT EXISTS bansos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_program    TEXT NOT NULL,               -- PKH, BPNT, BLT, dll
  penerima_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  jumlah_bantuan  INTEGER NOT NULL CHECK (jumlah_bantuan > 0),
  periode         TEXT NOT NULL,               -- contoh: "2025-Q1", "Januari 2025"
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'tersalurkan')),
  catatan         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE bansos IS 'Data penerima dan penyaluran bantuan sosial';
COMMENT ON COLUMN bansos.jumlah_bantuan IS 'Jumlah bantuan dalam rupiah';
COMMENT ON COLUMN bansos.penerima_id IS 'FK ke profiles; RESTRICT agar data bansos tidak hilang bila user dihapus';

CREATE INDEX idx_bansos_penerima_id ON bansos(penerima_id);
CREATE INDEX idx_bansos_status ON bansos(status);

CREATE TRIGGER trg_bansos_updated_at
  BEFORE UPDATE ON bansos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 5. KEGIATAN
-- Kegiatan / agenda desa
-- ============================================================
CREATE TABLE IF NOT EXISTS kegiatan (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul         TEXT NOT NULL,
  deskripsi     TEXT,
  tanggal       DATE NOT NULL,
  waktu_mulai   TIME,
  waktu_selesai TIME,
  lokasi        TEXT NOT NULL,
  kuota         INTEGER CHECK (kuota IS NULL OR kuota > 0),
  status        TEXT NOT NULL DEFAULT 'aktif'
                  CHECK (status IN ('aktif', 'selesai', 'dibatalkan')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE kegiatan IS 'Kegiatan dan agenda resmi desa';
COMMENT ON COLUMN kegiatan.kuota IS 'NULL = tidak ada batas peserta';

CREATE INDEX idx_kegiatan_tanggal ON kegiatan(tanggal);
CREATE INDEX idx_kegiatan_status ON kegiatan(status);

CREATE TRIGGER trg_kegiatan_updated_at
  BEFORE UPDATE ON kegiatan
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 6. SURAT
-- Permohonan surat keterangan dari warga
-- ============================================================
CREATE TABLE IF NOT EXISTS surat (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pemohon_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  jenis_surat      TEXT NOT NULL,              -- domisili, tidak_mampu, usaha, dll
  keperluan        TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'diproses', 'selesai', 'ditolak')),
  catatan_petugas  TEXT,
  file_url         TEXT,                       -- URL file surat yang sudah diterbitkan
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE surat IS 'Permohonan surat keterangan dari warga ke pihak desa';
COMMENT ON COLUMN surat.file_url IS 'URL file PDF surat resmi setelah disetujui (Supabase Storage)';
COMMENT ON COLUMN surat.pemohon_id IS 'FK ke profiles; RESTRICT agar history surat tidak hilang';

CREATE INDEX idx_surat_pemohon_id ON surat(pemohon_id);
CREATE INDEX idx_surat_status ON surat(status);

CREATE TRIGGER trg_surat_updated_at
  BEFORE UPDATE ON surat
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 7. RETRIBUSI
-- Tagihan retribusi / iuran warga
-- ============================================================
CREATE TABLE IF NOT EXISTS retribusi (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warga_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  jenis         TEXT NOT NULL,                 -- sampah, air, keamanan, dll
  jumlah        INTEGER NOT NULL CHECK (jumlah > 0),
  jatuh_tempo   DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'belum_bayar'
                  CHECK (status IN ('belum_bayar', 'lunas', 'jatuh_tempo')),
  midtrans_id   TEXT UNIQUE,                   -- order_id dari Midtrans, nullable
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE retribusi IS 'Tagihan retribusi dan iuran warga desa';
COMMENT ON COLUMN retribusi.jumlah IS 'Jumlah tagihan dalam rupiah';
COMMENT ON COLUMN retribusi.midtrans_id IS 'Order ID dari Midtrans Payment Gateway, NULL jika belum ada transaksi';

CREATE INDEX idx_retribusi_warga_id ON retribusi(warga_id);
CREATE INDEX idx_retribusi_status ON retribusi(status);
CREATE INDEX idx_retribusi_jatuh_tempo ON retribusi(jatuh_tempo);

CREATE TRIGGER trg_retribusi_updated_at
  BEFORE UPDATE ON retribusi
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Aktifkan di semua tabel
-- Policy detail bisa ditambahkan sesuai kebutuhan
-- ============================================================
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE keluarga   ENABLE ROW LEVEL SECURITY;
ALTER TABLE anggota    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bansos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan   ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat      ENABLE ROW LEVEL SECURITY;
ALTER TABLE retribusi  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- END OF MIGRATION
-- ============================================================
