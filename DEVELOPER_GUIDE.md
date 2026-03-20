# 🏛️ Desa Digital - Developer Guide (Manual Book)

Selamat datang di *codebase* **Desa Digital**! Panduan ini dibuat khusus agar kamu (Junior Developer atau tim baru) bisa memahami alur kerja, struktur folder, dan sistem perlindungan (keamanan) di project ini dengan cepat.

---

## 🛠️ Tech Stack Utama
- **Framework:** Next.js 15 (App Router)
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS
- **Ikon:** `lucide-react`
- **Bahasa:** TypeScript

---

## 📂 Struktur Folder Penting (Highlight)

Aplikasi ini menggunakan pola **Route Groups** di Next.js (folder dengan tanda kurung `()`), sehingga URL di browser terlihat lebih bersih walau strukturnya modular.

```text
src/
├── app/
│   ├── (auth)/                 # Menangani urusan otentikasi
│   │   ├── login/page.tsx      # Form login & logika fetch akun Warga vs Manager
│   │   └── unauthorized/       # Halaman "Akses Terbatas" untuk user yang menembus batas
│   │
│   ├── (dashboard)/            # Seluruh rute yang berada di dalam area Dashboard
│   │   ├── layout.tsx          # [SERVER COMPONENT] Satpam lapis ke-2: Pemblokir role Non-Manager
│   │   ├── client-layout.tsx   # [CLIENT COMPONENT] Pembungkus UI Sidebar & Header
│   │   ├── dashboard/page.tsx  # Halaman ringkasan statistik (Overview) & tabel
│   │   ├── keluarga, bansos, kegiatan, surat, retribusi/  # Folder fitur halaman
│   │
│   ├── test-rls/page.tsx       # Halaman rahasia untuk mengetes kebijakan akses (RLS) Supabase
│   ├── page.tsx                # Rute root (localhost:3000/) yg otomatis me-lempar ke /dashboard
│
├── lib/
│   └── supabase/               
│       ├── client.ts           # Supabase client untuk diakses dari Client Component
│       ├── server.ts           # Supabase client untuk diakses dari Server Component
│       └── middleware.ts       # Skrip helper untuk mengecek sesi (token) per request
│
└── middleware.ts               # [SATPAM LAPIS 1] Menjegal user yang belum login
```

---

## 🛡️ Alur Keamanan (Route Protection & Roles)

Aplikasi ini menggunakan skema pertahanan tiga lapis yang **wajib dipahami**:

### Lapisan 1: Middleware (`src/middleware.ts`)
Berjalan paling awal. Jika ada tamu yang belum *login* (tidak ada token) mencoba masuk ke halaman apa pun selain `/login`, maka **middleware akan langsung "menendang" mereka kembali ke `/login`**. Jika mereka sudah pernah login dan iseng mengunjungi kembali halaman `/login`, mereka juga akan "dipantulkan" maju ke `/dashboard`. 

### Lapisan 2: Layout Server (`src/app/(dashboard)/layout.tsx`)
Meskipun tamu sudah login, mereka **belum tentu seorang Manager**.
Setiap mengakses halaman di zona `(dashboard)`, Server akan mengecek tabel `profiles`. Jika isinya `role: 'warga'`, server seketika mengalihkannya ke halaman `/unauthorized`. Hal ini membuat *Junior Dev* tak perlu repot melakukan *role-check* secara manual di setiap komponen halaman baru. Cukup taruh halaman rute tersebut di dalam folder `(dashboard)`, dan secara magis sudah terlindungi!

### Lapisan 3: Row Level Security (Database Supabase)
Bahkan jika seseorang berusaha mengakses data dari belakang layar (API/Postman), Supabase punya satpam ke-3 bernama RLS. Manager (Role = manager) bisa menarik semua baris data (`keluarga`, `surat`, `retribusi`) ke layar, sedangkan User (Warga) hanya bisa mengekstrak data di mana nomor KTP/ID tersebut tertulis atas miliknya saja.

> **💡 Mengapa ada Fungsi `auth_is_manager()` di SQL?**
> Jika tabel `profiles` mengecek dari dirinya sendiri dengan operasi `SELECT`, PostgreSQL akan mengalami masalah *Infinite Recursion* (perulangan tanpa henti). Fungsi ini di-*deploy* untuk "membypass sementara" saat Supabase mengukur *policy* akses.

---

## ⚡ Data Fetching Pattern

Agar *project* ringan, kita memisahkan tugas *Client* dan *Server*:
1. **Gunakan Server Components (`layout.tsx`, `dashboard/page.tsx`)** kapan pun kamu butuh data dari Supabase secara instan pada saat halamannya dirender awal. Gunakan metode `Promise.all([ ... ])` jika kamu harus menarik >1 query bersamaan agar lebih ngebut (contoh: load 5 kotak statistik Dashboard).
2. **Gunakan Client Components (`client-layout.tsx`, `greeting.tsx`)** hanya ketika ada interaktivitas yang melibatkan hal fisik di browser, seperti state klik (Sidebar), `onClick`, atau jam internal lokal (*Greeting siang/malam*).

Bila kamu ingin mengubah desain atau fitur, mulailah berpatokan pada panduan ini. *Happy coding!* 🚀
