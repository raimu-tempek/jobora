# Architecture — Jobora (v8)

## System Overview
```
User
  ↓
Next.js Frontend (React)
  ↓
Server / API Layer (Next.js API Routes)
  ↓
Supabase (Postgres Database, Auth)

External Services:
- Supabase Auth   → Login/register, session per user
- Google Gemini API → Auto-extract data dari screenshot (gambar dikirim langsung, tidak disimpan)
- PostHog          → Product analytics (free tier)
- Vercel           → Hosting & deployment
```

## Tech Stack
- **Frontend + Backend:** Next.js (React + Node, full-stack, API Routes untuk server-side logic)
- **Typography:** **Dual font** — Manrope untuk heading (`headline-lg/md/sm`, `metric-number`, `display-hero`) + Hanken Grotesk untuk body/label/caption, keduanya via `next/font/google`.
- **Ikon:** **Material Symbols Outlined** (Google Fonts icon font, di-load lewat `<link>`, dipakai sebagai `<span class="material-symbols-outlined">`). Ganti dari rencana Lucide React sebelumnya — lihat catatan keputusan di bawah.
- **Chart dashboard:** **Bklit UI Area Chart** (`@bklit` registry shadcn, source: https://bklit.com).
  - Install: `npx shadcn@latest add @bklit/area-chart` (namespace `@bklit` di-set di `components.json` → `"registries": {"@bklit": "https://ui.bklit.com/r/{name}.json"}`)
  - Dependencies: `@visx/shape @visx/curve @visx/scale @visx/gradient @visx/responsive @visx/event @visx/grid d3-array motion react-use-measure`
  - Komponen yang relevan untuk "Application Activity": `AreaChart` (root), `Area` (garis + gradient fill), `Grid` (garis grid dashed), `XAxis` (label bulan), `ChartTooltip` (tooltip + crosshair saat hover).
  - Theming: di-map lewat CSS variable di `ApplicationActivityChart.module.css` (`--chart-line-primary: var(--chart-line)`).
  - Komponen chart disimpan di `components/charts/`.
  - Tailwind CSS v4 dipasang untuk kebutuhan styling komponen chart (entry `app/tailwind.css`); styling halaman tetap CSS Modules + token Design System.
  - Status Breakdown dan Applications by Platform **bukan** chart library, melainkan komponen bar-list custom (lihat bagian Dashboard).

- **Database:** Supabase Postgres
- **Auth:** Supabase Auth (email/password, session per user)
- **AI Extraction:** Google Gemini API (vision, baca data dari screenshot. Gambar tidak disimpan, hanya diproses sekali lalu dibuang)
- **Analytics:** PostHog (free tier)
- **Deployment/Hosting:** Vercel (free tier, production only)
- **Error Monitoring:** Tidak dipakai di v1 (bisa ditambah belakangan)

## Project Structure
```
/app            # Routes & pages (Next.js App Router)
  /dashboard    # Halaman dashboard (chart, ringkasan status)
  /applications # Halaman list & form lamaran (Daftar Lamaran)
  /login, /register
  /api          # API Routes (server-side logic)
/components     # Reusable UI (button, input, card, badge, chart, dsb, sesuai Design System)
/lib            # Utilities, konfigurasi Supabase client, konfigurasi Gemini client
/services       # Logic pemanggilan Supabase & Gemini API
/types          # TypeScript types (Application, Status, User, dsb)
/public         # Static assets (logo, ikon)
/docs           # PRD.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, AGENTS.md
```

> ⚠️ **Belum ada di struktur ini tapi muncul di screenshot sidebar terbaru:** route `/companies` ("Perusahaan") dan `/settings` ("Pengaturan"). Jangan ditambah ke struktur folder sampai dikonfirmasi — lihat PRD bagian "Proposal Belum Disetujui".

## Data Flow

**Tambah lamaran (manual):**
1. User isi form di `/applications` (modal "Tambah Lamaran Baru", tab "Input Manual")
2. Frontend validasi input dasar, kirim request ke API Route
3. Server verifikasi user (auth) dan validasi input
4. Data disimpan ke Supabase Postgres
5. Response balik ke frontend, list & dashboard ter-update

**Tambah lamaran (screenshot):**
1. User upload gambar di modal "Tambah Lamaran Baru", tab "Upload Screenshot (AI)" (gambar hanya dipegang sementara di memori browser/server, tidak pernah ditulis ke storage)
2. Server kirim gambar langsung ke Google Gemini API untuk ekstraksi data
3. Hasil ekstraksi dikembalikan ke frontend sebagai form ter-isi otomatis, plus preview card (nama file, ukuran, label "Diekstrak otomatis via Gemini AI", link "Ganti Gambar") dan banner privasi inline
4. User cek/edit hasilnya, lalu konfirmasi submit
5. Hanya data teks hasil ekstraksi yang disimpan ke Supabase Postgres. File gambar dibuang setelah proses ekstraksi selesai (tidak ada jejak file tersimpan di server maupun database).

**Buka dashboard/login:**
1. User login → server verifikasi session
2. Server ambil semua data lamaran milik user dari Supabase
3. Server hitung lamaran mana yang statusnya masih "In Progress" tapi belum update lebih dari 7 hari (dihitung on-the-fly, tanpa cron job). Hasilnya dipakai oleh `FollowUpReminderBanner` **dan** tag inline "Follow-up" di baris tabel Daftar Lamaran yang relevan.
4. Frontend render dashboard 2 kolom: KPI, chart, breakdown, dan banner reminder sekaligus dalam satu render. Tidak ada section notifikasi terpisah dari widget.

## Dashboard (Tahap 5)

Layout dashboard **2 kolom**: kolom utama (kiri, lebar penuh sisa setelah rail) dan rail kanan (lebar tetap, ~320px di desktop, grid `lg:grid-cols-12` dengan main `col-span-8` dan rail `col-span-4`). Section kecil (reminder detail, breakdown) tampil paralel di samping chart utama, bukan ditumpuk satu per satu.

**Di mobile (<640px):** rail pindah ke bawah kolom utama (stack vertikal), mengikuti Responsive Rules di Design System.

Urutan baris (`app/dashboard/page.tsx`):

1. **Header greeting**: caption "Good morning"/"Selamat pagi" + H1 "Halo, [nama]" + tombol "+ Tambah Lamaran" (membuka modal form yang sama dengan `/applications`, lalu `router.refresh()`).
2. **`FollowUpReminderBanner`**: lebar penuh, di atas KPI. Label baru: judul "Tindak Lanjut Diperlukan" + deskripsi "Kamu punya X lamaran yang belum di-update lebih dari 7 hari" + link "Lihat detail →". Collapsed-expandable, hanya dirender kalau `followUps.length > 0`. Sumber data `lib/applications/reminders.ts` (`isInProgressStatus()`, threshold 7 hari dari `status_updated_at`). Dihitung fresh tiap halaman dibuka (`force-dynamic`, tanpa cache).
3. **4 Kartu KPI** (lebar penuh, grid 4 kolom desktop / 2 kolom mobile): Applied ("Total applications"), Active ("Still in process" — ini label baru untuk In Progress), Interview ("Current stage"), Offer ("Final stage"). Dihitung di `lib/applications/stats.ts`.
4. **Baris chart** (`lg:col-span-8` + `lg:col-span-4`):
   - **Kolom utama:** Chart **"Application Activity"** (berbasis shadcn/ui Chart Recharts). Toggle segmented "Bulanan / Mingguan" di header card — **ini kontrol baru, belum ada spesifikasi datanya di PRD lama** (grouping mingguan belum didefinisikan). Rentang sumbu X mulai dari bulan lamaran paling awal yang tercatat sampai bulan berjalan untuk mode Bulanan.
   - **Rail kanan:** **Status Breakdown**: bar-list tipis, 5 kategori eksklusif dari `APPLICATION_STATUS_GROUPS`: Submitted, Test/Task, Interview, Offering, Rejected. Ditutup dengan ringkasan **"Tingkat Konversi"** (persentase Offering dibagi Applied, atau metrik lain — **belum didefinisikan rumusnya di PRD, perlu diputuskan sebelum dibangun**).
5. **Baris berikutnya**:
   - **Kolom utama:** **Ringkasan Riwayat Lamaran**: 5 lamaran terbaru dalam bentuk tabel ringkas (Perusahaan, Posisi, Tahap, Tanggal), plus tombol "Lihat Semua Lamaran" ke `/applications`.
   - **Rail kanan:** **Applications by Platform**: bar-list dengan ikon per platform + persentase, urut terbanyak. Ditutup dengan **Insight Callout** otomatis (contoh: "LinkedIn memberikan tingkat respons panggilan interview tertinggi bulan ini"). **Ini masuk kategori analytics/insight berbasis pola data yang eksplisit Out of Scope di PRD v1 — JANGAN dibangun sebelum ada keputusan eksplisit untuk memasukkannya ke scope.**

### Komponen baru/berubah
- **`components/dashboard/BreakdownBarList.tsx`**: tidak berubah secara fungsi, tapi perlu varian tinggi bar (8px untuk Status Breakdown, 6px + ikon untuk Applications by Platform).
- **`FollowUpReminderBanner`**: copy teks berubah ("Tindak Lanjut Diperlukan" / "Lihat detail"), struktur komponen tidak berubah dari v7.
- **`components/dashboard/ConversionRateCard`** (baru, kalau disetujui): untuk metrik "Tingkat Konversi" di bawah Status Breakdown.
- **`components/dashboard/InsightCallout`** (baru, **tunda sampai disetujui**): untuk kalimat insight otomatis.

### Empty state
Tidak berubah dari v7: berlaku per section, Status Breakdown & Applications by Platform butuh ≥1 lamaran, line chart activity butuh ≥2 titik data bertanggal valid.

## Halaman Daftar Lamaran (`/applications`)

Berbeda dari v7 yang cuma disebut "List/Tabel Lamaran" singkat, sekarang detail layout-nya jelas dari screenshot:

1. **Header**: judul "Daftar Lamaran" + badge status "Aktif", deskripsi singkat, tombol "Upload Screenshot (AI) BETA" (secondary) + "+ Tambah Lamaran" (primary) di kanan atas.
2. **Filter Tabs** (pill horizontal + counter): Semua, Submitted, Test & Task, Interview, Offering, Rejected.
3. **Toolbar**: search bar ("Cari perusahaan, posisi..."), dropdown "Semua Status", dropdown sort "Terbaru", tombol export (ikon download).
4. **Tabel**: kolom Perusahaan (+ tag "Follow-up" inline kalau relevan), Posisi, Tipe, Platform, Tanggal Melamar, Status Progres (Status Badge), Aksi (lihat detail + menu titik tiga).
5. **Pagination**: "Menampilkan 1-10 dari 42 lamaran" + nomor halaman.
6. **Banner promosi fitur** (bawah tabel): "Sinkronisasi Otomatis Lewat Screenshot Email" — **fitur baru yang belum ada spesifikasinya di PRD/Architecture manapun.** Kalau ini beneran mau dibangun, itu artinya ada integrasi email baru (akses inbox / forwarding address) yang kena aturan "Boundaries" di AGENTS.md (approval dulu sebelum nambah service eksternal baru). Jangan dianggap "cuma banner UI doang" — treat sebagai keputusan arsitektur.

## Database & Storage
**Auth:**
- Field `full_name` disimpan di user metadata Supabase Auth (bukan tabel terpisah), diisi user saat registrasi (label di UI: **"Nama"**), dipakai untuk sapaan personal.

**Tables (Supabase Postgres):**
- `applications`: id, user_id (relasi ke Supabase Auth user), company, position, type, date, status, platform, created_at, updated_at
- Catatan: kolom `screenshot_url` dari migration awal Tahap 3 tidak dipakai lagi. Boleh dibiarkan nullable, tidak perlu dihapus paksa dari schema.
- Status badge label tampilan (mis. "Technical Test", "Take Home Task", "Offering Received") itu murni mapping di layer presentasi (`lib/applications/format.ts` atau sejenis) — **value kolom `status` di DB tetap enum lama** (Test, Task, Offering, dst), tidak ada migration baru yang diperlukan untuk perubahan ini.

**Storage:**
- Tidak ada bucket storage. Screenshot tidak disimpan sama sekali, hanya diproses sekali oleh Gemini API lalu dibuang.

## External Services
- **Supabase**: Auth & Database (Storage tidak dipakai)
- **Google Gemini API**: Ekstraksi data dari screenshot, gambar tidak disimpan
- **PostHog**: Analytics pemakaian produk (hanya untuk insight internal)
- **Vercel**: Hosting & deployment otomatis dari repository
- **shadcn/ui** (https://ui.shadcn.com/): Komponen UI & Chart official (berbasis Recharts) yang di-copy ke `components/ui/`.

## Deployment
- Satu environment: **production** (sesuai kebutuhan v1, tidak ada staging terpisah)
- Deploy otomatis ke Vercel setiap ada perubahan di branch utama
- Environment variables (Supabase keys, Gemini API key) disimpan di Vercel Project Settings, tidak pernah di-commit ke repo

## Scalability Notes
- Tidak ada caching, queue, atau background job di v1. Semua dihitung on-the-fly saat request.
- Error monitoring & staging environment sengaja di-skip untuk v1, bisa ditambahkan belakangan tanpa mengubah arsitektur inti
- Kalau reminder/dashboard mulai terasa lambat karena data user membesar, opsi ke depan: pindah perhitungan reminder ke scheduled job (cron)
- Rate limit free tier Gemini API perlu diperhatikan kalau fitur auto-extract dipakai intensif. Pertimbangkan fallback ke input manual kalau limit tercapai.
- Kalau "Sinkronisasi Otomatis Lewat Screenshot Email" jadi disetujui ke scope: itu butuh entah inbound email parsing (forwarding address + webhook) atau integrasi IMAP/Gmail API — keduanya nambah kompleksitas & kemungkinan keluar dari free tier, perlu dipikirkan terpisah, bukan nebeng ke arsitektur AI-extract yang sekarang (yang sifatnya manual-trigger by user).
