# PRD — Slip Gaji Generator
**Griya Qur'an Tartiilaa (atau institusi lain)**

> Versi: 1.0  
> Dibuat: Mei 2026  
> Stack: Next.js 14+ (App Router, Full-Stack — tanpa pemisahan FE/BE)

---

## 1. Latar Belakang

Saat ini slip gaji dibuat manual (mencetak satu per satu atau mengisi template). Prosesnya lambat dan rawan salah ketik. Dibutuhkan aplikasi web sederhana yang bisa:

1. Menerima data dari file Excel berformat standar
2. Menampilkan preview slip gaji per karyawan dalam layout A5
3. Menghasilkan output PDF A5 atau langsung bisa di-print

---

## 2. Tujuan Produk

| # | Tujuan |
|---|--------|
| 1 | Upload 1 file Excel → generate banyak slip sekaligus |
| 2 | Preview slip sebelum cetak / export |
| 3 | Export PDF per slip atau semua slip (bulk) |
| 4 | Print langsung dari browser dengan ukuran A5 |
| 5 | Tidak butuh login / database — aplikasi ringan |

---

## 3. Pengguna Target

- **Admin / Bendahara** yang menyiapkan slip gaji bulanan
- Tidak perlu keahlian teknis — cukup bisa upload Excel dan klik tombol

---

## 4. Fitur Utama (Scope MVP)

### 4.1 Upload Excel
- Tombol upload file `.xlsx` / `.xls`
- Validasi format kolom saat file dibuka
- Tampilkan tabel preview data yang diimport (semua karyawan)
- Jika format salah → tampilkan pesan error yang jelas

### 4.2 Preview Slip Gaji
- Setelah upload berhasil, tampil daftar nama karyawan
- Klik nama → tampil preview slip 1 karyawan dalam layout A5
- Ada tombol navigasi Prev / Next untuk pindah antar karyawan
- Layout slip mengikuti format standar (lihat Section 6)

### 4.3 Export PDF
- Tombol **"Download PDF"** → download slip 1 karyawan (A5)
- Tombol **"Download Semua PDF"** → download ZIP berisi semua slip PDF
- Format nama file: `SlipGaji_[NamaKaryawan]_[Periode].pdf`

### 4.4 Print
- Tombol **"Print"** → buka dialog print browser
- Print style otomatis A5, tanpa header/footer browser
- Bisa print 1 slip atau semua slip sekaligus

---

## 5. Format Excel (Standar Input)

File Excel hanya berisi **8 kolom wajib**. Baris pertama adalah header, data mulai baris kedua.

| Kolom | Nama Header di Excel | Contoh Nilai | Wajib? |
|-------|----------------------|--------------|--------|
| A | `nama` | Monna Marissa | ✅ |
| B | `periode` | Maret | ✅ |
| C | `periode_lengkap` | 21 Februari / 20 Maret 2026 | ✅ |
| D | `transport_per_datang` | 40000 | ✅ |
| E | `jumlah_hadir` | 8 | ✅ |
| F | `tunjangan` | 250000 | ✅ |
| G | `thr` | 450000 | ✅ (isi `0` jika tidak ada) |
| H | `potongan` | 0 | ✅ (isi `0` jika tidak ada) |

> **Catatan:**  
> - Semua kolom nominal diisi angka bulat tanpa titik/koma (contoh: `40000` bukan `40.000`)  
> - Kolom `thr` dan `potongan` **tetap harus diisi**, isi `0` jika tidak ada nilainya  
> - Nomor urut (`no`) akan di-generate otomatis dari nomor baris Excel  
> - File template Excel tersedia di aplikasi (tombol "Download Template")

---

## 5a. Nilai Konfigurasi — Diatur via Menu Settings

Nilai berikut **tidak diisi di Excel**, melainkan dikonfigurasi sekali di halaman **Settings** aplikasi dan disimpan di `localStorage` browser.

| Field | Label di Form Settings | Contoh Nilai |
|-------|------------------------|--------------|
| `nama_institusi` | Nama Institusi | GRIYA QUR'AN TARTIILAA |
| `kota_ttd` | Kota Tanda Tangan | Salatiga |
| `nama_bendahara` | Nama Bendahara | Tri Wahyuniati |
| `jabatan_bendahara` | Jabatan Bendahara | Bendahara GQT |

> **Penyimpanan:** `localStorage` dengan key `slip_gaji_settings`  
> Data tetap tersimpan selama tidak clear browser. Tidak butuh database.

### `tanggal_ttd` — Otomatis Tanggal Hari Ini

```typescript
// Di-generate otomatis saat preview/print/PDF, tidak dari Excel maupun Settings
const tanggal_ttd = new Date().toLocaleDateString("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
})
// Hasil contoh: "20 Mei 2026"
```

---

## 6. Layout Slip Gaji (Desain A5)

Ukuran A5 = 148mm × 210mm

```
┌─────────────────────────────────────────┐
│          SLIP GAJI [NAMA INSTITUSI]      │  ← Header bold, center
│     Periode: [periode_lengkap]           │
├──────────────────────────┬──────────────┤
│ No      : [no]           │  [LOGO]      │
│ Nama    : [nama]         │              │
│ Kampus  : [kampus]       │              │
│ Periode : [periode]      │              │
├──────────────────────────┴──────────────┤
│                 Rincian                  │  ← Sub-header center
├─────────────────────────────────────────┤
│ Transport per datang    Rp   [nominal]   │
│ Jumlah Hadir                 [hadir]    │
│                         Rp   [subtotal] │  ← transport × hadir
├─────────────────────────────────────────┤
│ Tunjangan               Rp   [nominal]  │
│ THR                          [nominal]  │
│ Potongan                     [nominal]  │
├─────────────────────────────────────────┤
│                         Rp   [TOTAL]    │  ← garis tebal
│ Total Penerimaan                        │
├─────────────────────────────────────────┤
│ Mengetahui,                             │
│ [kota_ttd], [tanggal_ttd]               │
│                                         │
│                                         │  ← area tanda tangan (kosong)
│ [nama_bendahara]                        │
│ [jabatan_bendahara]                     │
└─────────────────────────────────────────┘
```

**Rumus kalkulasi:**
- `subtotal_transport` = `transport_per_datang` × `jumlah_hadir`
- `total_penerimaan` = `subtotal_transport` + `tunjangan` + `thr` - `potongan`

---

## 7. Struktur Proyek Next.js

```
slip-gaji-app/
├── app/
│   ├── layout.tsx              ← root layout + navbar (Home | Settings)
│   ├── page.tsx                ← halaman utama (upload + preview)
│   ├── settings/
│   │   └── page.tsx            ← halaman settings konfigurasi institusi
│   ├── api/
│   │   ├── parse-excel/
│   │   │   └── route.ts        ← API: parse file Excel → JSON
│   │   └── generate-pdf/
│   │       └── route.ts        ← API: generate PDF satu slip
├── components/
│   ├── Navbar.tsx              ← navigasi Home | Settings
│   ├── UploadSection.tsx       ← area upload file
│   ├── EmployeeList.tsx        ← daftar karyawan hasil import
│   ├── SlipPreview.tsx         ← komponen preview 1 slip (A5)
│   └── SlipPrintWrapper.tsx    ← wrapper khusus print/PDF
├── lib/
│   ├── parseExcel.ts           ← logic baca Excel → array objek
│   ├── calculateSlip.ts        ← logic hitung subtotal & total
│   ├── formatRupiah.ts         ← format angka ke Rp 1.000.000,00
│   └── settings.ts             ← get/set settings dari localStorage
├── public/
│   ├── logo-gqt.png            ← logo institusi
│   └── template-slip-gaji.xlsx ← template Excel untuk diunduh
├── styles/
│   └── print.css               ← CSS khusus print A5
└── package.json
```

---

## 8. Teknologi yang Digunakan

| Kebutuhan | Library / Tool | Alasan |
|-----------|----------------|--------|
| Framework | **Next.js 14** (App Router) | Full-stack, satu repo |
| Baca Excel | **xlsx** (SheetJS) | Library paling populer baca `.xlsx` |
| Generate PDF | **@react-pdf/renderer** | Render React component jadi PDF |
| Styling | **Tailwind CSS** | Cepat, utility-first |
| Print CSS | CSS `@page` + `@media print` | Native browser print A5 |
| Zip bulk PDF | **jszip** | Bundle semua PDF jadi 1 file ZIP |
| Icon | **lucide-react** | Ringan dan konsisten |

---

## 9. Alur Kerja Aplikasi (User Flow)

```
[Buka Aplikasi]
      │
      ▼
[Halaman Utama]
 - Tampil tombol "Upload Excel"
 - Tampil tombol "Download Template Excel"
      │
      ▼ (user upload file)
[API: parse-excel]
 - Baca file Excel
 - Validasi kolom wajib
 - Return array data karyawan
      │
      ├─ Jika ERROR → tampil pesan error + panduan kolom
      │
      ▼ Jika OK
[Tampil Tabel Data Karyawan]
 - Nama | Kampus | Periode | Total | Aksi
 - Klik nama → buka preview
      │
      ▼
[SlipPreview Modal / Panel]
 - Tampil layout A5 slip gaji
 - Navigasi Prev / Next
 - Tombol: [Print Ini] [Download PDF Ini]
      │
      ▼ (opsional)
[Download Semua PDF]
 - Generate semua slip jadi ZIP
 - Download otomatis
```

---

## 10. Detail API Endpoint

### `POST /api/parse-excel`

**Request:**
```
Content-Type: multipart/form-data
Body: file (xlsx)
```

**Response sukses:**
```json
{
  "success": true,
  "data": [
    {
      "no": 1,
      "nama": "Monna Marissa",
      "periode": "Maret",
      "periode_lengkap": "21 Februari / 20 Maret 2026",
      "transport_per_datang": 40000,
      "jumlah_hadir": 8,
      "tunjangan": 250000,
      "thr": 450000,
      "potongan": 0
    }
  ]
}
```

> Nilai `no` adalah nomor baris di Excel (baris 2 = no 1, dst).  
> Field hardcoded (`nama_institusi`, `kota_ttd`, dll) **tidak dikirim dari API**, langsung diambil dari `lib/constants.ts` di komponen.
```

**Response error:**
```json
{
  "success": false,
  "error": "Kolom 'nama' tidak ditemukan di baris pertama Excel"
}
```

### `POST /api/generate-pdf`

**Request:**
```json
{ "slip": { ...data satu karyawan... } }
```

**Response:** File PDF binary (Content-Type: application/pdf)

---

## 11. Komponen: `SlipPreview`

Komponen ini adalah **inti aplikasi**. Harus di-render identik baik di layar maupun di PDF.

**Props:**
```typescript
// lib/constants.ts — nilai tetap, tidak dari Excel
export const INSTITUSI = {
  nama: "GRIYA QUR'AN TARTIILAA",
  kota_ttd: "Salatiga",
  nama_bendahara: "Tri Wahyuniati",
  jabatan_bendahara: "Bendahara GQT",
  logo_path: "/logo-gqt.png",
}

// Data dari Excel (per karyawan)
interface SlipData {
  no: number                  // auto dari nomor baris
  nama: string
  periode: string
  periode_lengkap: string
  transport_per_datang: number
  jumlah_hadir: number
  tunjangan: number
  thr: number
  potongan: number
}

interface SlipPreviewProps {
  data: SlipData
  mode: 'screen' | 'print' | 'pdf'
}
```

**Kalkulasi di dalam komponen:**
```typescript
const subtotal = data.transport_per_datang * data.jumlah_hadir
const total = subtotal + data.tunjangan + data.thr - data.potongan
```

---

## 12. Print & PDF — Konfigurasi A5

### CSS Print (styles/print.css)
```css
@media print {
  @page {
    size: A5 portrait;
    margin: 10mm;
  }
  body * { visibility: hidden; }
  .slip-print-area,
  .slip-print-area * { visibility: visible; }
  .slip-print-area {
    position: absolute;
    top: 0; left: 0;
    width: 148mm;
  }
}
```

### Strategi PDF
- Gunakan `@react-pdf/renderer` untuk generate PDF server-side
- Ukuran halaman: `{ format: 'A5', orientation: 'portrait' }`
- Font: gunakan font embed agar PDF konsisten di semua device

---

## 13a. Halaman Settings (`/settings`)

```
┌─────────────────────────────────────────────────────┐
│  ⚙️  Pengaturan Institusi                            │
│  Digunakan pada semua slip gaji yang digenerate      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Nama Institusi                                     │
│  [ GRIYA QUR'AN TARTIILAA                        ]  │
│                                                     │
│  Kota Tanda Tangan                                  │
│  [ Salatiga                                      ]  │
│                                                     │
│  Nama Bendahara                                     │
│  [ Tri Wahyuniati                                ]  │
│                                                     │
│  Jabatan Bendahara                                  │
│  [ Bendahara GQT                                 ]  │
│                                                     │
│               [ Simpan Pengaturan ]                 │
│                                                     │
│  ✅ Pengaturan berhasil disimpan                    │  ← muncul setelah save
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Saat halaman `/settings` pertama kali dibuka, form **otomatis terisi** dari nilai yang sudah tersimpan di `localStorage`
- Jika belum pernah diisi → form kosong, tampil placeholder teks contoh
- Tombol **Simpan** → simpan ke `localStorage`, tampil notifikasi sukses
- Jika settings belum diisi dan user mencoba generate/preview slip → tampil **warning banner**: *"Pengaturan institusi belum diisi. Lengkapi di menu Settings sebelum membuat slip."* dengan link ke `/settings`

### `lib/settings.ts`

```typescript
export interface AppSettings {
  nama_institusi: string
  kota_ttd: string
  nama_bendahara: string
  jabatan_bendahara: string
}

const STORAGE_KEY = "slip_gaji_settings"

export function getSettings(): AppSettings | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function isSettingsComplete(s: AppSettings | null): boolean {
  if (!s) return false
  return !!(s.nama_institusi && s.kota_ttd && s.nama_bendahara && s.jabatan_bendahara)
}
```


## 13. UI/UX Halaman Utama

```
┌─────────────────────────────────────────────────────┐
│  🕌 Slip Gaji Generator         [Home]  [⚙️ Settings] │  ← Navbar
├─────────────────────────────────────────────────────┤
│  ⚠️  Pengaturan institusi belum diisi. → Settings   │  ← muncul jika settings kosong
├─────────────────────────────────────────────────────┤
│                                                     │
│   [ 📁 Klik untuk upload file Excel (.xlsx) ]       │
│        atau drag & drop file di sini                │
│                              [Download Template]    │
├─────────────────────────────────────────────────────┤
│  Data Karyawan (24 orang)      [Download Semua PDF] │
│  ┌──────┬──────────────────┬──────────┬────────┐   │
│  │ No   │ Nama             │ Total    │ Aksi   │   │
│  ├──────┼──────────────────┼──────────┼────────┤   │
│  │  1   │ Monna Marissa    │ 1.020.000│  👁    │   │
│  └──────┴──────────────────┴──────────┴────────┘   │
└─────────────────────────────────────────────────────┘
```



**Klik ikon 👁 → buka modal/panel preview slip A5:**

```
┌──────────────────────────────────────────┐
│ ← Prev  [Monna Marissa - 1/24]  Next →   │
│ ┌──────────────────────────────────────┐ │
│ │         [PREVIEW SLIP A5]            │ │
│ │         (layout sesuai Section 6)    │ │
│ └──────────────────────────────────────┘ │
│    [🖨 Print Ini]  [📄 Download PDF]      │
└──────────────────────────────────────────┘
```

---

## 14. Penanganan Error & Validasi

| Kondisi | Pesan yang Ditampilkan |
|---------|----------------------|
| File bukan .xlsx | "Format file tidak didukung. Gunakan file .xlsx" |
| Kolom wajib tidak ada | "Kolom '[nama_kolom]' tidak ditemukan. Download template untuk melihat format yang benar." |
| Data kosong / sheet kosong | "File Excel tidak memiliki data. Pastikan data dimulai dari baris ke-2." |
| Settings belum diisi | Warning banner di halaman utama: "Pengaturan institusi belum diisi. Lengkapi di menu Settings." |

---

## 15. Hal yang TIDAK Termasuk MVP (Out of Scope)

| Fitur | Alasan Ditunda |
|-------|----------------|
| Login / autentikasi | Tidak diperlukan, hanya admin internal |
| Database / penyimpanan history | Tidak diperlukan untuk use case ini |
| Kustomisasi template slip | Tambahan kompleksitas, skip dulu |
| Multi-bahasa | Cukup Bahasa Indonesia |
| Upload logo per institusi | Logo di-hardcode di folder `public/` |

---

## 16. Urutan Pengerjaan untuk AI Agent

Eksekusi berurutan, per tahap:

**Tahap 1 — Setup Project**
1. Init Next.js 14 dengan App Router + TypeScript
2. Install dependencies: `xlsx`, `tailwindcss`, `lucide-react`, `@react-pdf/renderer`, `jszip`
3. Buat struktur folder sesuai Section 7
4. Tambahkan `print.css` dan import di `layout.tsx`

**Tahap 2 — Logic Inti**
5. Buat `lib/settings.ts` — fungsi `getSettings`, `saveSettings`, `isSettingsComplete` dengan localStorage
6. Buat `lib/parseExcel.ts` — baca 8 kolom Excel, validasi, return array + auto-increment `no`
7. Buat `lib/calculateSlip.ts` — hitung subtotal & total
8. Buat `lib/formatRupiah.ts` — format `1000000` → `Rp 1.000.000,00`

**Tahap 3 — API Routes**
8. Buat `app/api/parse-excel/route.ts` — terima file, jalankan parseExcel, return JSON
9. Buat `app/api/generate-pdf/route.ts` — terima data slip, return PDF binary

**Tahap 4 — Komponen UI**
10. Buat `components/Navbar.tsx` — navigasi Home | Settings
11. Buat `components/SlipPreview.tsx` — layout A5 slip (screen mode), baca settings dari localStorage
12. Buat `components/UploadSection.tsx` — drag & drop upload
13. Buat `components/EmployeeList.tsx` — tabel data karyawan

**Tahap 5 — Halaman**
14. Buat `app/settings/page.tsx` — form 4 field + tombol Simpan + notifikasi sukses
15. Buat `app/page.tsx` — integrasikan semua komponen, warning banner jika settings belum diisi
16. Tambahkan state management (useState) untuk data karyawan & selected slip
17. Implementasi modal preview + navigasi Prev/Next

**Tahap 6 — Print & PDF**
16. Implementasi fungsi print (inject CSS + `window.print()`)
17. Implementasi download PDF satu slip (call API generate-pdf)
18. Implementasi download semua PDF dalam ZIP (loop + jszip)

**Tahap 7 — Polish & Testing**
19. Test upload Excel dengan data sample
20. Test print di browser (pastikan ukuran A5)
21. Test download PDF (pastikan ukuran A5)
22. Tambahkan pesan error untuk kasus-kasus di Section 14

---

## 17. File Template Excel

Sediakan file `template-slip-gaji.xlsx` di folder `public/` dengan:
- Baris 1: **8 header** sesuai Section 5 (`nama`, `periode`, `periode_lengkap`, `transport_per_datang`, `jumlah_hadir`, `tunjangan`, `thr`, `potongan`)
- Baris 2–3: contoh data dummy
- Sel header diberi warna kuning agar mudah dikenali
- Tambahkan catatan di baris 1 kolom J: *"Isi nominal dengan angka bulat tanpa titik/koma. Kolom thr dan potongan isi 0 jika tidak ada."*

---

## 18. Checklist Selesai (Definition of Done)

- [ ] Halaman Settings bisa diisi dan tersimpan (persist setelah refresh)
- [ ] Warning muncul di halaman utama jika Settings belum diisi
- [ ] Upload file Excel `.xlsx` berhasil dibaca
- [ ] Data karyawan tampil di tabel dengan total yang benar
- [ ] Preview slip 1 karyawan tampil dengan layout A5
- [ ] Navigasi Prev/Next antar slip berfungsi
- [ ] Print 1 slip menghasilkan output A5 di dialog print
- [ ] Download PDF 1 slip berhasil, ukuran A5
- [ ] Download semua slip sebagai ZIP berhasil
- [ ] Template Excel bisa diunduh
- [ ] Pesan error tampil jika format Excel salah
- [ ] Tampilan rapi di desktop dan tablet

---

*PRD ini dibuat untuk kebutuhan eksekusi oleh AI Agent. Setiap tahap di Section 16 bisa dijadikan prompt terpisah untuk agent.*
