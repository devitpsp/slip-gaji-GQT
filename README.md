# Slip Gaji Tartila

Aplikasi web untuk membuat slip gaji Griya Qur'an Tartiilaa dari file Excel. Aplikasi membaca data gaji, menampilkan preview slip A5, lalu menyediakan fitur print dan download PDF.

## Fitur

- Upload file Excel slip gaji.
- Validasi format Excel sesuai template aplikasi.
- Preview slip gaji per pegawai.
- Print semua slip dalam format A5.
- Download satu slip sebagai PDF.
- Download semua slip sebagai satu file PDF gabungan.
- Pengaturan institusi, kota tanda tangan, bendahara, kampus, dan logo.
- Template Excel tersedia di `public/template-slip-gaji.xlsx`.

## Teknologi

- Next.js App Router
- React
- TypeScript
- `xlsx` untuk membaca Excel
- `@react-pdf/renderer` untuk membuat PDF
- CSS global untuk layout slip dan print

## Instalasi

```bash
npm install
```

## Menjalankan Development Server

```bash
npm run dev
```

Buka aplikasi di browser pada alamat yang ditampilkan oleh Next.js, biasanya:

```text
http://localhost:3000
```

## Build Production

```bash
npm run build
npm run start
```

## Type Check

```bash
npm run lint
```

Script `lint` pada project ini menjalankan:

```bash
tsc --noEmit
```

## Alur Penggunaan

1. Buka halaman **Settings**.
2. Isi data institusi, kota tanda tangan, nama bendahara, jabatan bendahara, kampus, dan logo.
3. Simpan pengaturan.
4. Kembali ke halaman utama.
5. Upload file Excel sesuai template.
6. Cek daftar pegawai dan preview slip.
7. Print semua slip atau download PDF.

## Database Setting Aplikasi

Aplikasi memakai file JSON lokal sebagai database sederhana untuk pengaturan institusi.

Lokasi file:

```text
data/settings.json
```

File ini diakses oleh aplikasi melalui API route `/api/settings` dan helper server di `lib/serverSettings.ts`.

Data yang disimpan mencakup:

- `nama_institusi`
- `kota_ttd`
- `nama_bendahara`
- `jabatan_bendahara`
- `kampus`
- `logo_data_url`

Saat user menyimpan halaman Settings, aplikasi menulis data ke `data/settings.json`. Saat aplikasi dibuka, data dibaca kembali dari file ini. Jika file belum ada atau gagal dibaca, aplikasi memakai default setting dari `lib/settings.ts`.

Folder `data/` masuk `.gitignore`, jadi isi database lokal tidak ikut masuk commit. Untuk deployment, pastikan folder `data/` tetap persistent agar setting tidak hilang saat container atau server restart.

## API Routes

- `POST /api/parse-excel` — membaca dan validasi file Excel.
- `POST /api/generate-pdf` — membuat PDF untuk satu slip.
- `POST /api/generate-bulk-pdf` — membuat satu PDF gabungan untuk semua slip.
- `GET /api/settings` — membaca setting aplikasi.
- `POST /api/settings` — menyimpan setting aplikasi ke `data/settings.json`.

## Struktur Penting

```text
app/                 Halaman dan API routes Next.js
components/          Komponen UI dan slip preview/PDF
lib/                 Parser, kalkulasi, format rupiah, settings, dan tipe data
public/              Asset publik dan template Excel
data/settings.json   Database setting lokal aplikasi
```

## Deployment

Project memiliki konfigurasi Docker:

- `Dockerfile`
- `docker-compose.yml`

Untuk deployment dengan Docker, pastikan volume untuk folder `data/` dipertahankan karena folder itu menyimpan `settings.json`.
