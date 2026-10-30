# Design System — Jobora (v8, Teal Executive SaaS)

## Direction
**Riwayat:** v1 (playful/Duolingo) → v2 (Clean SaaS, Satoshi, hijau matte) → v3 (Space Grotesk) → v4 (fintech dark-green, pill button) → v5 (teal/mint, card putih) → v6 (Hanken Grotesk, teal) → v7 (biru, Hanken Grotesk semua) → **v8 (sekarang)**: balik ke aksen teal, tapi dengan pairing font baru (Manrope untuk heading, Hanken Grotesk untuk body) dan ikon pindah dari Lucide ke **Material Symbols Outlined**. Diturunkan dari mockup final (`code.html` + screenshot Daftar Lamaran).

Tetap **Light mode saja**. Tidak ada elemen dark/gelap di seluruh UI.

Prinsip: warna dipakai untuk makna (status, aksen aktif), bukan sebagai dekorasi.

> ⚠️ **Catatan jujur soal sumber:** token di bawah ini gue ambil langsung dari tailwind config yang nempel di mockup (`code.html`), bukan ngarang kayak kemarin. Tapi mockup itu sendiri hasil AI design tool (indikasinya: asset `lh3.googleusercontent.com/aida-public/...`), jadi ada beberapa class yang dipakai di markup tapi **gak pernah didefinisikan** di config-nya sendiri — misal `text-caption`, `font-caption`, `text-stat-value`. Itu artinya kalau file itu ditempel mentah-mentah ke project asli, class itu bakal nge-render pakai default Tailwind (bukan ukuran yang dimaksud). Di dokumen ini gue formalkan nilainya (lihat bagian Typography) supaya tim dev gak ikut nge-bug yang sama.

## Color Tokens

### Core
```
--primary: #107C74         /* CTA utama, ikon aktif, link, border aksen */
--primary-hover: #0D6861   /* hover/pressed primary button */
--primary-soft: #E6FAF7    /* teal-soft: background badge/ikon box Submitted & Applied */
--background: #F8FAFC      /* page background (abu kebiruan sangat pucat) */
--surface: #FFFFFF         /* card, sidebar, modal */
--border: #E2EAF0          /* garis pembatas tipis */
--text: #132A30            /* on-surface, teks utama */
--text-secondary: #526970  /* on-surface-variant: teks sekunder (nav inactive, kolom posisi di tabel) */
--text-muted: #627D84      /* caption, label kecil, meta info */
```
Catatan: config asli juga punya token `--background: #F2FAF8` yang **tidak terpakai** di markup (halaman literally pakai `#F8FAFC` hardcoded). Pilih satu — rekomendasi gue pakai `#F8FAFC` karena itu yang kelihatan di screenshot, terus hapus token nganggur yang satunya biar gak bingung pas maintenance.

### Chart
```
--chart-line: #107C74                         /* stroke line/area chart "Application Activity" */
--chart-line-fill-start: rgba(16,124,116,0.18)  /* gradient atas */
--chart-line-fill-mid: rgba(167,243,208,0.04)   /* gradient tengah (70%) */
--chart-line-fill-end: rgba(255,255,255,0)      /* gradient bawah, transparan */
--chart-grid: #F1F5F9                          /* garis grid dashed */
--chart-point-glow: #99F6E4                    /* glow titik data terakhir */
```

### Semantic States
```
--success / --emerald: #10B981   bg #DCFCE7
--error: #DC2626                 bg #FEE2E2
--warning / --amber: #D97706     bg #FEF3C7
--info / --primary: #107C74      bg #E6FAF7
--purple (interview): #8B5CF6    bg #F3E8FF
```

### Status Badge (khusus status lamaran)
Teks solid + background soft + border tipis warna senada (opacity ~20–25%). Label tampilan boleh lebih deskriptif daripada value di database — value enum di DB **tidak berubah**, cuma label yang ditampilkan ke user.
```
Status (value DB)   Label ditampilkan     Teks      Bg
Submitted            Submitted             #107C74   #E6FAF7
Test                  Technical Test        #D97706   #FEF3C7
Task                  Take Home Task        #EA580C   #FFEDD5
Interview HR          Interview HR          #8B5CF6   #F3E8FF
Interview User        Interview User        #8B5CF6   #F3E8FF
LGD                   LGD                   #8B5CF6   #F3E8FF
FGD                   FGD                   #8B5CF6   #F3E8FF
Offering               Offering Received     #10B981   #DCFCE7
Rejected               Rejected              #DC2626   #FEE2E2
```

## Dihapus / Diganti dari v7
- Aksen biru (`#2563EB` dkk) → diganti teal (`#107C74`).
- Font tunggal Hanken Grotesk untuk semua teks → sekarang **dual-font**: Manrope (heading) + Hanken Grotesk (body/label).
- Ikon Lucide React → **Material Symbols Outlined** (Google Fonts icon font, bukan React component).
- Tetap berlaku dari v7: tanpa gradient panel, tanpa `--surface-dark`, tanpa pill tag lime, KPI card tetap solid putih (cuma ikon & kotak ikon yang berwarna).

## Typography
**Heading:** Manrope (`next/font/google`, weight 500/600/700/800)
**Body/Label:** Hanken Grotesk (weight 400/500/600/700)

```
Display Hero (tidak dipakai di app, reserved): 48px / 56px / Bold / -0.03em   — Manrope
H1 (headline-lg, judul halaman "Halo, [nama]"): 28px / 36px / Bold / -0.02em  — Manrope
H2 (headline-md, judul card/section):           22px / 28px / Semibold / -0.015em — Manrope
H3 (headline-sm, sub-judul, label nav, nama perusahaan di tabel): 18px / 24px / Semibold / -0.01em — Manrope
Stat Value (angka KPI besar, "metric-number"):  32px / 36px / Bold / -0.02em — Manrope
Body: 14px / 20px / Regular — Hanken Grotesk
Body Medium: 14px / 20px / Medium — Hanken Grotesk
Body Large: 16px / 24px / Regular — Hanken Grotesk
Label (badge, tab aktif): 13px / 16px / Semibold / 0.01em — Hanken Grotesk
Label Small (micro label): 11px / 14px / Semibold / 0.02em — Hanken Grotesk
Caption/Small (di-formalkan, lihat catatan di atas): 12px / 16px / Regular — Hanken Grotesk
```
Angka di Stat Value dan persentase pakai `font-variant-numeric: tabular-nums`.

## Spacing
```
space-xs: 4px    space-sm: 8px    space-md: 16px   space-lg: 24px   space-xl: 40px
gutter: 20px (desktop) / 12px (mobile)
margin konten: 32px (desktop) / 16px (mobile)
```

## Radius & Shadows
```
--radius-sm: 4px      /* micro elements */
--radius-md: 8px      /* input, nav item, icon box */
--radius-lg: 12px     /* card, panel, modal (rounded-xl) */
--radius-full: 999px  /* button, badge, avatar, nav aktif, progress bar */

--shadow-xs: tailwind default shadow-xs
--shadow-sm: tailwind default shadow-sm
```
Card: `--surface` + border `--border` + `--shadow-sm`. Elemen interaktif (row tabel, card clickable) pakai `hover:bg-background` sebagai feedback, bukan cuma shadow.

## Layout
- **Sidebar** (desktop): fixed kiri, lebar 240px, background putih, border-r `--border`, shadow tipis `0 1px 10px rgba(16,124,116,0.02)`. Logo "Jobora" + ikon di atas (H3, teks `--primary`). Menu aktif: background `--primary-soft`/70% opacity, teks `--primary`, border `--primary`/20%, radius 12px (bukan cuma flat background kayak v7 — sekarang ada border tipis + shadow-xs, kesannya kayak "chip" aktif). Footer sidebar: avatar + nama + role + tombol logout (hover → merah).
- **Top bar**: fixed, tinggi 64px, putih semi-transparan + backdrop-blur, border-bottom `--border`. Judul halaman di kiri, notifikasi (dengan dot indicator merah) + avatar di kanan.
- **Konten utama**: `max-w-7xl`, padding 32px, mulai di bawah top bar (`pt-16`).
- **Mobile** (<640px): sidebar jadi bottom nav bar (tetap seperti v7).

### ⚠️ Perlu konfirmasi: struktur menu sidebar
Mockup `code.html` (halaman Dashboard) cuma punya 2 menu: **Dashboard, Lamaran**. Tapi screenshot halaman **Daftar Lamaran** nunjukin sidebar dengan **4 menu: Dashboard, Lamaran, Perusahaan, Pengaturan**. Dua sumber ini gak konsisten. "Perusahaan" dan "Pengaturan" itu section baru yang **belum ada** di PRD/Architecture manapun. Sebelum coding agent bikinin halaman itu beneran, putusin dulu: ini emang fitur baru yang mau ditambah, atau sisa dari template AI generator yang harusnya dihapus pas port ke app asli? Gue taruh sebagai catatan di PRD juga (lihat bagian "Proposal Belum Disetujui").

## Components
- **Button**: pill penuh (`--radius-full`)
  - Primary: fill `--primary`, teks putih, `shadow-sm`, ring 1px `primary/30`, hover `--primary-hover`, active `scale-[0.98]`
  - Secondary: fill putih, border `--border`, teks `--text`
  - Ghost: transparan, teks `--text-secondary`, hover background `--background`
- **Input**: radius 8px, border `--border`, focus ring 2px `--primary`
- **Card**: `--surface`, border `--border`, radius 12px, `shadow-sm`. Padding 20–24px.
- **Status Badge**: pill kecil, background soft + teks solid + border tipis (lihat tabel Status Badge).
- **KPI/Stat Card**: card putih standar, 4 kartu (Applied, Active, Interview, Offer). Header: label `--text-muted` + icon box 40×40px radius 12px berwarna sesuai status. Body: angka besar (Stat Value) + caption deskriptif pendek ("Total applications", "Still in process", "Current stage", "Final stage"). Tanpa indikator persen perubahan.
- **Breakdown Bar-list**: dipakai di 2 tempat (Status Breakdown, Applications by Platform). Baris: label + jumlah/persentase di kanan, lalu progress bar tipis (track `#F1F5F9`, fill warna status, radius full). Status Breakdown pakai tinggi bar 8px, Applications by Platform pakai 6px + ikon kecil 16px di depan label. Status Breakdown ditutup dengan ringkasan **"Tingkat Konversi"** dalam kotak `--background` — lihat catatan scope di PRD soal metrik ini.
- **Chart Application Activity**: area chart resmi berbasis shadcn/ui (`components/ui/chart.tsx` & Recharts, lihat bagian Chart di Architecture). Toggle "Bulanan / Mingguan" di pojok kanan atas card (segmented control, pill aktif putih dengan ring tipis).
- **Tabel Daftar Lamaran**: header row background `--background`, radius di sel pojok kiri/kanan, teks caption `--text-muted` uppercase-ish tapi tetap sentence case di mockup. Body row: hover `--background`, divider `--border`. Kolom: Perusahaan (bold, bisa ada tag kecil "Follow-up" di sebelah nama), Posisi (`--text-secondary`), Tipe (badge soft, bukan status-badge — warna netral/teal muda), Platform (ikon + teks), Tanggal Melamar, Status Progres (Status Badge), Aksi (ikon mata = lihat detail, ikon titik tiga = menu aksi). Di bawah tabel: search bar + filter dropdown "Semua Status" + sort dropdown "Terbaru" + tombol export (ikon download) + pagination ("Menampilkan 1-10 dari 42 lamaran").
- **Filter Tabs** (atas tabel Daftar Lamaran): pill tabs horizontal — Semua, Submitted, Test & Task, Interview, Offering, Rejected — masing-masing dengan counter badge kecil. Tab aktif: fill `--primary`, teks putih.
- **Modal Tambah Lamaran**: radius 16-24px (lebih besar dari card biasa), header: judul "Tambah Lamaran Baru" + badge pill "✨ AI Ready" (teal-soft), subjudul deskriptif, tombol close (X). Body: segmented tab "Input Manual" vs "Upload Screenshot (AI) `BETA`". Saat tab Upload aktif: card preview file (nama file, ukuran, "Diekstrak otomatis via Gemini AI", link "Ganti Gambar") + banner privasi kecil ("🔒 Gambar tidak disimpan ke server, hanya diproses sekali oleh AI lalu dibuang"). Form 2 kolom: Nama Perusahaan / Posisi Pekerjaan, Tipe Pekerjaan / Status Awal, Tanggal Melamar / Platform Lamaran. Footer: tombol "Batal" (ghost) + "Simpan Lamaran" (primary, dengan ikon check).
- **Insight Callout** (card kecil bg `--background`, ikon lightbulb `--primary`): dipakai di bawah Applications by Platform untuk kalimat insight otomatis ("LinkedIn memberikan tingkat respons panggilan interview tertinggi bulan ini"). **Ini masuk kategori "Analytics lanjutan berbasis AI" yang di PRD lama eksplisit Out of Scope v1** — lihat catatan di PRD, jangan diimplementasi sampai ada keputusan eksplisit.
- **Banner Promosi Fitur** ("Sinkronisasi Otomatis Lewat Screenshot Email"): card lebar penuh, bg `--primary-soft`-ish, icon mail, judul + deskripsi + link "Coba Sekarang →". Ini juga **fitur baru yang belum ada di PRD** (auto-detect dari screenshot email, beda dari upload manual yang sudah ada). Lihat catatan scope di PRD.

## Iconography
**Material Symbols Outlined** (Google Fonts icon font — `dashboard`, `work`, `add`, `schedule`, `send`, `hourglass_top`, `group`, `verified`, `notifications`, `logout`, `chevron_right`, `filter_list`, `public`, `domain`, `language`, `lightbulb`, dll), ukuran 16–22px. Ikon pasif `--text-secondary`/`--text-muted`, ikon aktif ikut warna status. **Ini ganti total dari Lucide React yang disebut di v7** — konsekuensinya beda cara import (font-face/CDN vs React component, perlu `<link>` Google Fonts "Material Symbols Outlined" + class `material-symbols-outlined`), jadi tolong dikonfirmasi dulu ke tim sebelum AGENTS.md dianggap final, karena ini bukan cuma ganti warna doang.

## States
Sama seperti v7: Hover (shadow naik / bg berubah), Focus (ring 2px primary), Active/Pressed (fill lebih gelap / scale 0.98 di button), Disabled (opacity 40%), Loading (skeleton shimmer), Empty state (ikon abu + teks muted + CTA), Error state (ikon + teks error, bg error-soft).

## Responsive Rules
Sama seperti v7 (Mobile <640px, Tablet 640–1024px, Desktop >1024px). Tabel Daftar Lamaran di mobile jadi card-per-item (bukan tabel horizontal-scroll), mengikuti pola yang sudah ada di Design System lama.

## Accessibility
- Kontras `--text` (#132A30) di atas `--background` (#F8FAFC) dan `--surface` (#FFFFFF) — cek ulang AA saat implementasi, terutama `--text-muted` (#627D84) yang agak terang buat teks kecil 12px.
- Status badge selalu disertai label teks, bukan warna saja.
- Material Symbols adalah icon font — pastikan pakai `aria-hidden="true"` di span ikon dan label teks terpisah untuk screen reader, karena beda dari Lucide SVG yang biasanya sudah ada title/role bawaan.
