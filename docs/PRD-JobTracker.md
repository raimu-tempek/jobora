# Product Requirements Document — Jobora

## Product Overview
**Nama:** Jobora
**Deskripsi singkat:** Platform berbasis web bagi pencari kerja untuk mencatat setiap lamaran pekerjaan (secara manual maupun via upload screenshot) dan memantau progresnya lewat dashboard visual.
**Visi produk:** Membantu job seeker tetap terorganisir dan punya gambaran jelas atas performa pencarian kerja mereka, tanpa perlu spreadsheet manual.

## Problem
Pencari kerja biasanya melamar ke puluhan hingga ratusan lowongan secara bersamaan, di berbagai platform (LinkedIn, Kalibrr, website perusahaan, dll). Mencatat status tiap lamaran secara manual di spreadsheet itu memakan waktu, gampang lupa diupdate, dan tidak memberi gambaran menyeluruh soal progres pencarian kerja.

## Goal
Memberi user cara cepat mencatat lamaran kerja (manual atau screenshot) dan melihat progres pencarian kerja mereka secara visual, real-time, dan dari device manapun.

## Target Users
- Job seeker (fresh graduate maupun berpengalaman) yang melamar ke banyak posisi sekaligus dan butuh sistem tracking yang rapi.

## Core Features
1. **Input lamaran: Manual Form**
   Dibuka lewat modal "Tambah Lamaran Baru" (tab "Input Manual"). Form 2 kolom: Nama Perusahaan, Posisi Pekerjaan, Tipe Pekerjaan, Status Awal, Tanggal Melamar, Platform Lamaran.
2. **Input lamaran: Upload Screenshot dengan AI Auto-Extract**
   Dibuka dari modal yang sama (tab "Upload Screenshot (AI)", badge "BETA"). User upload screenshot lamaran (misal dari email/portal), AI mengekstrak data yang relevan ke form otomatis, ditampilkan sebagai preview card (nama file, ukuran, "Diekstrak otomatis via Gemini AI", link "Ganti Gambar") plus banner privasi inline. Gambar **tidak disimpan** di server maupun database, hanya diproses di memori lalu dibuang. Hasil ekstraksi **wajib dicek dan dikonfirmasi user** sebelum data disimpan ke list, bukan langsung masuk otomatis.
3. **List/Tabel Lamaran (halaman "Daftar Lamaran")**
   Terpisah dari ringkasan singkat di dashboard. Berisi:
   - Filter tabs dengan counter: Semua, Submitted, Test & Task, Interview, Offering, Rejected
   - Search bar ("Cari perusahaan, posisi...") + dropdown filter status + dropdown sort + tombol export
   - Tabel kolom: Perusahaan (bisa ada tag "Follow-up" kalau lamaran itu masuk daftar reminder), Posisi, Tipe, Platform, Tanggal Melamar, Status Progres, Aksi (lihat detail / menu)
   - Pagination (contoh: "Menampilkan 1-10 dari 42 lamaran")
4. **Dashboard Visual**
   Layout **2 kolom**: kolom utama (kiri, lebih lebar) dan rail (kanan, lebih sempit), supaya informasi tampil paralel dan halaman tidak perlu discroll panjang.

   Urutan tampilan:
   1. **Header greeting**: caption waktu ("Good morning"/"Selamat pagi") + "Halo, [nama]" + tombol "+ Tambah Lamaran" di kanan atas.
   2. **Banner Follow-up (expandable)**: lebar penuh, di atas KPI. Judul "Tindak Lanjut Diperlukan", isi "Kamu punya X lamaran yang belum di-update lebih dari 7 hari", link "Lihat detail". Kalau X = 0, banner tidak dirender sama sekali. Ini **satu-satunya** representasi fitur Reminder In-App di dashboard (lihat Core Feature #5) — reminder yang sama juga muncul sebagai tag "Follow-up" inline di tabel Daftar Lamaran (Core Feature #3).
   3. **4 Kartu KPI** (lebar penuh):
      - Applied: total semua lamaran ("Total applications")
      - Active: lamaran berstatus Submitted, Test, Task, Interview HR, Interview User, LGD, atau FGD ("Still in process")
      - Interview: lamaran berstatus Interview HR, Interview User, LGD, atau FGD ("Current stage")
      - Offer: lamaran berstatus Offering ("Final stage")
   4. **Baris chart** (2 kolom sebaris):
      - **Kolom utama:** Chart **"Application Activity"** dengan toggle "Bulanan / Mingguan". *Mode Mingguan belum didefinisikan logikanya — lihat "Proposal Belum Disetujui" di bawah.* Mode Bulanan: tren jumlah lamaran per bulan, mulai dari bulan lamaran paling awal user sampai bulan berjalan.
      - **Rail kanan:** **Status Breakdown**: bar-list tipis, 5 kategori saling eksklusif: Submitted, Test/Task (gabungan Test+Task), Interview (gabungan Interview HR+Interview User+LGD+FGD), Offering, Rejected. Tiap baris menampilkan jumlah + persentase; total harus sama dengan Applied.
   5. **Baris berikutnya** (2 kolom sebaris):
      - **Kolom utama:** **Ringkasan Riwayat Lamaran**: 5 lamaran terbaru, dilengkapi tombol "Lihat Semua Lamaran".
      - **Rail kanan:** **Applications by Platform**: bar-list dengan ikon per platform, jumlah + persentase, urut terbanyak (tie-break A–Z). Platform kosong ditampilkan sebagai "Tidak dicatat".

   ### Label Status Badge (tampilan, bukan value database)
   Supaya lebih deskriptif di UI, beberapa status punya label tampilan berbeda dari value di database:
   ```
   Test       → "Technical Test"
   Task       → "Take Home Task"
   Offering   → "Offering Received"
   ```
   Status lain (Submitted, Interview HR, Interview User, LGD, FGD, Rejected) tampil apa adanya. Ini perubahan kosmetik di layer tampilan saja, tidak mengubah daftar status di bagian "Status Lamaran yang Ditrack" di bawah.

5. **Reminder / Follow-up Notification**
   Notifikasi **in-app** berbentuk **banner expandable** di atas dashboard, **plus tag "Follow-up" inline** di baris tabel Daftar Lamaran yang relevan. Muncul setelah user login, mengingatkan lamaran mana saja yang belum ada update status setelah 7 hari.
6. **Akun & Autentikasi Multi-user**
   Setiap user punya akun sendiri (login/register). Data lamaran terpisah per user dan tersimpan permanen di database (bukan hanya di browser).

## User Flows
1. **Registrasi/Login**: user membuat akun atau login.
2. **Tambah lamaran (manual)**: buka modal → isi form → data tersimpan → muncul di list & dashboard ter-update.
3. **Tambah lamaran (screenshot)**: buka modal → pilih tab Upload Screenshot → AI ekstrak data → user cek/edit hasil ekstraksi → konfirmasi → data tersimpan.
4. **Update status lamaran**: user membuka lamaran di list → ubah status (misal dari Submitted ke Interview HR) → dashboard ter-update otomatis, tag "Follow-up" ikut hilang kalau statusnya baru di-update.
5. **Lihat dashboard**: user membuka halaman dashboard → melihat KPI, chart activity, status breakdown, dan ringkasan riwayat lamaran.
6. **Cari/filter lamaran**: user ke halaman Daftar Lamaran → pakai filter tab / search / sort / export untuk menemukan lamaran tertentu.
7. **Terima reminder**: sistem menampilkan banner expandable di atas dashboard dan tag di tabel untuk lamaran yang belum diupdate status dalam 7 hari.

## Status Lamaran yang Ditrack
Submitted, Test, Task, Interview HR, Interview User, LGD, Offering, Rejected, FGD

*(Value database tidak berubah — lihat "Label Status Badge" di atas untuk label tampilan.)*

## Field Data Lamaran
Company, Position, Type (Full-time / Internship / Contract / Freelance), Date, Status, Platform

## Requirements
**Functional**
- CRUD (create, read, update, delete) untuk data lamaran.
- Auth (register/login) per user.
- Upload gambar + AI extraction untuk auto-fill form, dengan langkah konfirmasi user sebelum simpan.
- Sistem reminder berbasis tanggal (belum update status setelah 7 hari), ditampilkan sebagai banner expandable in-app + tag inline di tabel.
- Dashboard dengan kombinasi KPI card, chart, dan bar-list breakdown, terhubung real-time ke data lamaran.
- Halaman Daftar Lamaran dengan filter tab, search, sort, export, dan pagination.

**UX**
- Clean SaaS dashboard dengan aksen **teal** (lihat `DESIGN_SYSTEM-Jobora.md` v8 untuk direction visual terkini — font Manrope + Hanken Grotesk, ikon Material Symbols Outlined).
- Mobile-responsive: dashboard dan form harus tetap enak dipakai di HP. Di layar sempit, kolom rail pindah ke bawah kolom utama, bukan di samping.

**Platform & Teknis**
- Web app dengan backend + database sungguhan (bukan hanya browser storage), agar data permanen dan bisa diakses dari device manapun.
- Dibangun 100% menggunakan layanan free-tier (Supabase untuk auth + database, Vercel untuk hosting, Google Gemini free tier untuk ekstraksi). Tanpa biaya berbayar.

**Performance**
- Dashboard harus ter-update near real-time setelah data lamaran ditambah/diubah.

## Tech Stack
- **Framework:** Next.js (React + Node, full-stack)
- **Auth + Database:** Supabase (Postgres, Auth). Supabase Storage tidak dipakai.
- **Font:** Manrope (heading) + Hanken Grotesk (body/label) — Google Fonts
- **Ikon:** Material Symbols Outlined (Google Fonts icon font)
- **Chart:** Bklit UI Area Chart (`@bklit/area-chart`, shadcn registry) — lihat `ARCHITECTURE-Jobora.md` untuk detail komponen & dependency
- **Hosting:** Vercel (free tier)
- **AI Auto-Extract Screenshot:** Google Gemini API (free tier, vision capability). Gambar tidak disimpan.
- **Reminder/Notifikasi:** In-app, ditampilkan setelah login (tanpa service eksternal berbayar)

## Success Metrics
- Jumlah lamaran tercatat dan konsistensi update data oleh user (volume/aktivitas).
- Conversion rate: Submitted → Interview → Offer.

## Out of Scope (v1)
- Export data (ke Excel/PDF) — *catatan: mockup terbaru nunjukin tombol export icon di toolbar tabel, ini kontradiksi langsung sama baris ini. Perlu diputuskan: export masuk v1 atau tombolnya dihapus dari UI.*
- Integrasi Calendar (auto-sync tanggal interview ke Google Calendar)
- Kolaborasi/sharing progres ke pihak lain (mentor, career coach, dll)
- **Analytics lanjutan berbasis AI (insight/saran otomatis dari pola lamaran user)** — *catatan: mockup terbaru nunjukin Insight Callout ("LinkedIn memberikan tingkat respons panggilan interview tertinggi bulan ini") di dashboard. Ini persis yang dimaksud baris ini. Kalau mau dipertahankan, baris Out of Scope ini perlu direvisi; kalau nggak, Insight Callout harus dihapus dari implementasi.*
- Dukungan multi-bahasa (i18n)
- Aplikasi native (iOS/Android). Cukup web yang mobile-responsive.
- Landing page/marketing page publik dan pricing tier. Produk ini single-tier, tidak ada halaman promosi sebelum login.

## Proposal Belum Disetujui (muncul di mockup, belum ada di scope resmi)
Hasil cross-check mockup terbaru (`code.html` + screenshot) ketemu beberapa hal yang **tidak ada** di versi PRD sebelumnya. Ditaruh di sini biar eksplisit sebelum di-build — jangan asumsikan otomatis "iya" cuma karena ada di gambar:

1. **Menu "Perusahaan" dan "Pengaturan"** di sidebar (screenshot Daftar Lamaran) — halaman baru yang belum ada spek fitur, data model, atau user flow-nya sama sekali.
2. **"Tingkat Konversi"** sebagai metrik ringkasan di bawah Status Breakdown — rumusnya belum didefinisikan (persentase dari apa ke apa).
3. **Insight Callout otomatis** ("LinkedIn memberikan tingkat respons..." di Applications by Platform) — bentrok langsung sama baris Out of Scope "Analytics lanjutan berbasis AI".
4. **Toggle "Bulanan / Mingguan"** di chart Application Activity — logika agregasi mingguan belum didefinisikan.
5. **"Sinkronisasi Otomatis Lewat Screenshot Email"** (banner promosi di bawah tabel Daftar Lamaran) — ini beda dari fitur upload-manual yang sudah ada; implikasinya butuh integrasi email (forwarding address / IMAP / Gmail API), yang artinya nambah external service baru. Ini **paling perlu didiskusikan dulu** karena dampaknya ke arsitektur & biaya paling besar dari semua poin di atas.
6. **Tombol export** di toolbar Daftar Lamaran — bentrok dengan baris Out of Scope "Export data".

Rekomendasi: bahas 6 poin ini satu-satu sebelum AGENTS.md dianggap final, supaya coding agent nggak diam-diam mulai bangun fitur yang sebenarnya belum disepakati (sesuai aturan "Boundaries" di `AGENTS.md`).
