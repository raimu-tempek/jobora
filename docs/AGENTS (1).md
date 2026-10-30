# Agent Instructions — Jobora

## Project Context
Jobora adalah web app job application tracker. User mencatat lamaran kerja (manual atau upload screenshot dengan AI auto-extract), lalu memantau progresnya lewat dashboard visual (multi-chart) dan halaman Daftar Lamaran (tabel + filter + search).

**Stack:** Next.js (React + Node) · Supabase (Postgres, Auth) · Vercel (hosting) · Google Gemini API (auto-extract screenshot) · shadcn/ui (chart & UI components) · Material Symbols Outlined (ikon)

## Before You Start
- Baca `PRD-JobTracker.md`: fitur, user flow, requirements, out of scope, **dan bagian "Proposal Belum Disetujui"**
- Baca `DESIGN_SYSTEM-Jobora.md` (v8): warna teal, tipografi Manrope+Hanken Grotesk, ikon Material Symbols, spacing, komponen
- Baca `ARCHITECTURE-Jobora.md`: struktur folder, data flow, layout dashboard, detail integrasi Bklit UI yang sebenarnya (bukan asumsi)
- Cek komponen yang sudah ada sebelum bikin komponen baru

## General Rules
- Pakai TypeScript
- Reuse komponen yang sudah ada, jangan duplikasi
- Komponen modular, satu tanggung jawab per komponen
- Ikuti struktur folder yang sudah ada di project
- Tanya dulu sebelum melakukan perubahan arsitektur besar (misal ganti database, ganti struktur auth)
- Semua fitur baru harus dicek dulu terhadap bagian "Out of Scope" **dan "Proposal Belum Disetujui"** di PRD. Jangan bangun fitur yang sudah eksplisit ditunda atau masih berstatus belum disetujui, walaupun ada referensi visualnya di mockup/screenshot.
- Kalau nemu mockup atau screenshot yang nunjukin fitur/halaman yang nggak ada di PRD (contoh: halaman baru, tombol baru, copy insight otomatis), **jangan langsung implementasi**. Tandai dulu ke user, karena itu kemungkinan cuma artefak dari tool desain AI, bukan keputusan produk yang final.

## Code Guidelines
- Nama file & komponen: PascalCase untuk komponen React, camelCase untuk fungsi/variabel
- Ambil warna, font, spacing, radius dari token di `DESIGN_SYSTEM-Jobora.md` (v8, teal). Jangan hardcode hex/px baru di luar token — termasuk jangan ikut nge-hardcode inkonsistensi yang ada di mockup asal (mis. `bg-[#f8fafc]` literal padahal ada token `--background`).
- Status lamaran (Submitted, Test, Task, Interview HR, Interview User, LGD, FGD, Offering, Rejected) harus pakai badge warna sesuai mapping di Design System. Label tampilan (mis. "Technical Test", "Take Home Task", "Offering Received") itu di layer presentasi saja — jangan ganti value enum di database.
- Semua query ke Supabase yang menyangkut data user harus difilter berdasarkan user yang login. Jangan sampai data antar-user tercampur.
- Chart "Application Activity" pakai Bklit UI Area Chart (`@bklit/area-chart`: `AreaChart`, `Area`, `Grid`, `XAxis`, `ChartTooltip` dari `@/components/charts/`). Theming chart di-map ke token Design System Jobora (`--chart-line`, `--chart-grid`).
- Ikon pakai Material Symbols Outlined (`<span class="material-symbols-outlined">`), bukan Lucide React.

## Design Rules
- Ikuti `DESIGN_SYSTEM-Jobora.md` (v8) untuk semua elemen visual. Font: **Manrope** (heading) + **Hanken Grotesk** (body/label), keduanya via `next/font/google`.
- Gaya clean/professional SaaS: card putih dengan border tipis + shadow halus, banyak whitespace
- Wajib mobile-responsive mengikuti breakpoint di Design System
- Chart di dashboard pakai warna dari palet status yang sama dengan badge di list, biar konsisten

## Security Rules
- Jangan pernah expose API key (Supabase, Gemini) di client-side code. Simpan di environment variables.
- Semua environment variable sensitif disimpan di `.env` (jangan pernah di-commit)
- Validasi semua input user di server-side, jangan percaya validasi client-side saja
- Verifikasi otorisasi di server-side untuk setiap request yang mengubah data (bukan cuma cek di UI)
- Hasil ekstraksi AI dari screenshot tidak boleh langsung disimpan ke database. Wajib melalui konfirmasi/edit user dulu.
- Gambar screenshot tidak disimpan di storage mana pun. Hanya diproses di memori lalu dibuang.

## Commands
```
npm install
npm run dev
npm run build
npm run lint
npm run test
```

## Boundaries
- Jangan ubah skema database Supabase tanpa konfirmasi
- Jangan tambah service/API eksternal baru (terutama yang berbayar) tanpa persetujuan. Semua service di stack ini wajib tetap dalam free tier. Ini termasuk fitur "Sinkronisasi Otomatis Lewat Screenshot Email" yang muncul di mockup — itu butuh integrasi email baru dan **wajib** izin eksplisit dulu.
- Jangan bangun fitur yang masuk daftar "Out of Scope" **atau "Proposal Belum Disetujui"** di PRD tanpa diminta eksplisit
- Jangan ganti font, warna, atau ikon dari Design System tanpa persetujuan — termasuk kalau ada mockup baru yang kelihatan lebih bagus, tetap konfirmasi dulu sebelum dianggap jadi standar baru.
