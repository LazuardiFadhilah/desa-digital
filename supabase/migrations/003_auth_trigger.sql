-- ============================================================
-- DESA DIGITAL - Auth Trigger: Auto-create Profile
-- Jalankan di: Supabase Dashboard > SQL Editor
-- CATATAN: Jalankan SETELAH 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- FUNCTION: handle_new_user
-- Dipanggil otomatis setiap kali ada INSERT baru di auth.users
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER                    -- Berjalan dengan hak akses pemilik function (postgres),
SET search_path = public            -- bukan hak user yang memicu trigger
AS $$
DECLARE
  nama_dari_metadata TEXT;
BEGIN
  -- Ambil nama dari metadata jika ada, fallback ke bagian sebelum '@' pada email
  nama_dari_metadata := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',   -- dari Google OAuth / provider lain
    NEW.raw_user_meta_data ->> 'name',        -- alternatif key dari beberapa provider
    NEW.raw_user_meta_data ->> 'nama',        -- custom metadata dari form register kita
    SPLIT_PART(NEW.email, '@', 1)             -- fallback: gunakan username dari email
  );

  INSERT INTO public.profiles (id, nama, role)
  VALUES (
    NEW.id,
    nama_dari_metadata,
    'warga'                                   -- semua user baru default jadi 'warga'
  );

  RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGER: on_auth_user_created
-- Terpasang di tabel auth.users, aktif setelah INSERT
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- VERIFIKASI (opsional, bisa dijalankan untuk cek trigger aktif)
-- ============================================================
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_name = 'on_auth_user_created';
