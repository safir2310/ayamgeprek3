# Instruksi Lengkap Integrasi Google Sheets

## Langkah 1: Persiapan Google Cloud Project

### 1.1 Buat Project di Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik "Select a project" > "New Project"
3. Masukkan nama project: `Ayam Geprek Sambal Ijo`
4. Klik "Create"

### 1.2 Aktifkan Google Sheets API
1. Buka [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
2. Klik tombol "Enable"
3. Tunggu proses aktivasi selesai

### 1.3 Buat Service Account
1. Buka [IAM & Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Klik "Create Service Account"
3. Isi form berikut:
   - **Service account name:** `ayam-geprek-api`
   - **Service account description:** `API Service untuk Ayam Geprek Sambal Ijo`
   - Klik "Create and Continue"
4. Pada bagian "Grant this service account access to this project":
   - Pilih role: **Editor** atau **Project > Editor**
   - Klik "Continue"
   - Klik "Done" (tidak perlu grant user access)

### 1.4 Buat dan Download Key File
1. Klik pada service account `ayam-geprek-api` yang baru dibuat
2. Masuk ke tab **Keys**
3. Klik **Add Key** > **Create new key**
4. Pilih **JSON** format
5. Klik **Create**
6. File JSON akan didownload otomatis
7. **Rename** file tersebut menjadi: `google-sheets-key.json`
8. **Pindahkan** file ke root folder project: `/home/z/my-project/google-sheets-key.json`

## Langkah 2: Bagikan Spreadsheet ke Service Account

### 2.1 Dapatkan Email Service Account
1. Buka file `google-sheets-key.json` dengan text editor
2. Cari properti `client_email`
3. Copy email tersebut (format: `xxx@project-id.iam.gserviceaccount.com`)

### 2.2 Bagikan Spreadsheet
1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ/edit
2. Klik tombol **Share** di pojok kanan atas
3. Paste email service account di kolom "Add people and groups"
4. Klik **Send**
5. Pada dialog permission, pilih role: **Editor**
6. Klik **Send**

**PENTING:** Pastikan role adalah "Editor" untuk bisa menulis data ke spreadsheet!

## Langkah 3: Restart Dev Server

Setelah setup selesai, restart dev server:

```bash
# Hentikan server yang sedang berjalan
pkill -f "next dev"

# Restart server
bun run dev
```

## Langkah 4: Testing Integrasi

### 4.1 Lakukan Order
1. Buka aplikasi di http://localhost:3000
2. Login sebagai user
3. Tambahkan produk ke keranjang
4. Lakukan checkout
5. Pilih metode pembayaran
6. Isi data dan konfirmasi order

### 4.2 Cek Spreadsheet
1. Buka spreadsheet Google Sheets
2. Sheet baru bernama "Pesanan" akan dibuat otomatis
3. Header kolom akan dibuat di baris pertama
4. Data order akan muncul di baris berikutnya
5. Pastikan semua data sudah tersimpan dengan benar

## Struktur Data yang Disimpan

| # | Kolom | Tipe | Contoh |
|---|--------|------|--------|
| 1 | Timestamp | String | "01/05/2025 12:30:45" |
| 2 | Order Number | String | "ORD1715242645000" |
| 3 | Customer Name | String | "Ahmad Subekti" |
| 4 | Phone | String | "08123456789" |
| 5 | Address | String | "Jl. Merdeka No. 123" |
| 6 | Total Amount | Number | 65000 |
| 7 | Final Amount | Number | 60000 |
| 8 | Discount | Number | 5000 |
| 9 | Payment Method | String | "COD" |
| 10 | Voucher Code | String | "DISKON10" |
| 11 | Items | String (JSON) | "[{\"name\":\"Ayam Geprek\",...}]" |
| 12 | Notes | String | "Pedas sedikit ya" |
| 13 | Payment Status | String | "pending" |
| 14 | Order Status | String | "pending" |

## Troubleshooting

### Masalah: Spreadsheet tidak terupdate
**Solusi:**
1. Cek dev server logs: `tail -f /home/z/my-project/dev.log`
2. Pastikan `google-sheets-key.json` ada di root folder
3. Pastikan file JSON valid dan tidak korup
4. Pastikan service account email sudah di-share ke spreadsheet dengan role Editor

### Masalah: Error "Service account not configured"
**Solusi:**
1. Pastikan environment variable `GOOGLE_SPREADSHEET_ID` sudah diset
2. Restart dev server setelah mengubah .env
3. Pastikan spreadsheet ID benar (tanpa bagian `/edit`)

### Masalah: Error "API not enabled"
**Solusi:**
1. Buka Google Cloud Console
2. Pastikan Google Sheets API sudah di-enable
3. Tunggu beberapa menit setelah enable sebelum mencoba lagi
4. Pastikan menggunakan project ID yang benar

### Masalah: Error "Rate limit exceeded"
**Solusi:**
1. Google Sheets API memiliki rate limit
2. Tunggu beberapa detik sebelum mencoba lagi
3. Jika sering terjadi, pertimbangkan untuk mengurangi frekuensi sync

### Masalah: Data tidak masuk ke spreadsheet
**Solusi:**
1. Cek apakah ada error di server logs
2. Order tetap tersimpan di database lokal (SQLite)
3. Integrasi Google Sheets bersifat non-blocking
4. Error Google Sheets tidak akan mengganggu fungsi utama

## Environment Variables yang Dibutuhkan

File `.env` sudah berisi:

```env
DATABASE_URL=file:/home/z/my-project/db/custom.db
GOOGLE_SPREADSHEET_ID=1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ
```

**Catatan:**
- `GOOGLE_SPREADSHEET_ID` otomatis diset dari URL spreadsheet Anda
- `google-sheets-key.json` harus ada di root folder project
- File ini berisi credentials untuk autentikasi ke Google Sheets API

## Keuntungan Integrasi Google Sheets

1. ✅ **Backup Cloud:** Data pesanan tersimpan di cloud secara real-time
2. ✅ **Monitoring Live:** Tim bisa memantau order secara langsung
3. ✅ **Analisis Data:** Gunakan fitur analisis bawaan Google Sheets
4. ✅ **Export Mudah:** Export ke Excel, CSV, PDF dengan satu klik
5. ✅ **Collaboration:** Beberapa tim bisa menganalisis data bersama
6. ✅ **Backup Otomatis:** Google melakukan backup otomatis
7. ✅ **Akses Mobile:** Bisa akses lewat Google Sheets app di mobile

## Catatan Penting

1. **Keamanan:**
   - JANGAN share file `google-sheets-key.json` ke repository publik
   - Tambahkan `google-sheets-key.json` ke `.gitignore`
   - Jaga kerahasiaan credentials

2. **Performance:**
   - Sync ke Google Sheets bersifat asynchronous
   - Tidak akan memperlambat proses checkout
   - Error Google Sheets tidak mempengaruhi user experience

3. **Backup:**
   - Data tetap tersimpan di database lokal (SQLite)
   - Google Sheets sebagai tambahan untuk monitoring dan analisis
   - Jika Google Sheets gagal, data tetap aman

## Support

Jika mengalami masalah setelah mengikuti semua langkah:

1. Cek file setup instructions: `GOOGLE_SHEETS_SETUP.md`
2. Cek dev server logs untuk error message
3. Pastikan semua langkah diikuti dengan benar
4. Coba ulang setup dari awal jika masih gagal
