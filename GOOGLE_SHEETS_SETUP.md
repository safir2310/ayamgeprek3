# Integrasi Google Sheets

## Setup Google Cloud Project

1. **Buat Project Google Cloud**
   - Buka [Google Cloud Console](https://console.cloud.google.com/)
   - Buat project baru atau pilih project yang sudah ada

2. **Aktifkan Google Sheets API**
   - Buka [APIs & Services](https://console.cloud.google.com/apis/dashboard)
   - Cari "Google Sheets API"
   - Klik "Enable" untuk mengaktifkan API

3. **Buat Service Account**
   - Buka [IAM & Admin](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Klik "Create Service Account"
   - Isi form:
     - Service account name: `ayam-geprek-api`
     - Service account description: `API untuk Ayam Geprek Sambal Ijo`
     - Klik "Create and Continue"
     - Pilih role: "Editor" atau "Project Editor"
     - Klik "Done"

4. **Buat dan Download Service Account Key**
   - Klik pada service account yang baru dibuat
   - Masuk ke tab "Keys"
   - Klik "Add Key" > "Create new key"
   - Pilih "JSON" format
   - Download file JSON tersebut
   - Rename file menjadi `google-sheets-key.json`
   - Pindahkan file ke root folder project (`/home/z/my-project/`)

5. **Bagikan Spreadsheet ke Service Account**
   - Buka spreadsheet yang ingin digunakan
   - Klik "Share" di pojok kanan atas
   - Masukkan email service account dari file JSON (format: `xxx@project-id.iam.gserviceaccount.com`)
   - Berikan akses: "Editor"
   - Klik "Send"

## Setup Environment Variables

Tambahkan variabel berikut ke file `.env`:

```env
GOOGLE_SPREADSHEET_ID=1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ
```

**Catatan:**
- `GOOGLE_SPREADSHEET_ID` diambil dari URL spreadsheet Anda
- Contoh: URL `https://docs.google.com/spreadsheets/d/1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ/edit`
- `1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ` adalah spreadsheet ID

## Struktur Data di Google Sheets

Setiap order akan disimpan dengan kolom berikut:

| Kolom | Deskripsi |
|--------|-----------|
| Timestamp | Waktu order dibuat |
| Order Number | Nomor order unik |
| Customer Name | Nama pelanggan |
| Phone | Nomor telepon pelanggan |
| Address | Alamat pengiriman |
| Total Amount | Total harga sebelum diskon |
| Final Amount | Total harga setelah diskon |
| Discount | Jumlah diskon |
| Payment Method | Metode pembayaran (COD/QRIS) |
| Voucher Code | Kode voucher yang digunakan |
| Items | Detail item dalam format JSON |
| Notes | Catatan tambahan dari pelanggan |
| Payment Status | Status pembayaran |
| Order Status | Status order |

## Cara Kerja

1. **Saat Checkout:**
   - Order disimpan ke database lokal (SQLite/Prisma)
   - Secara asynchronous, order juga disalin ke Google Sheets
   - Jika Google Sheets gagal, order tetap tersimpan di database lokal

2. **Sheet "Pesanan":**
   - Sheet ini akan dibuat otomatis saat order pertama dibuat
   - Header kolom akan di-generate otomatis
   - Data akan di-append ke sheet setiap kali order baru dibuat

3. **Error Handling:**
   - Jika Google Sheets API gagal, error akan dicatat di log server
   - Error tidak akan mengganggu fungsi checkout utama
   - Data tetap tersimpan di database lokal

## Testing

Untuk menguji integrasi:

1. Setup Google Cloud dan Service Account
2. Bagikan spreadsheet ke service account
3. Set environment variables
4. Restart dev server: `bun run dev`
5. Lakukan checkout order
6. Cek spreadsheet, data order harus muncul otomatis

## Troubleshooting

**Error: "Service account not configured"**
- Pastikan `google-sheets-key.json` ada di root folder
- Pastikan file JSON valid dan tidak korup

**Error: "Spreadsheet not accessible"**
- Pastikan service account email sudah di-share ke spreadsheet
- Pastikan service account memiliki akses "Editor"

**Error: "API not enabled"**
- Pastikan Google Sheets API sudah di-enable di Google Cloud Console
- Tunggu beberapa menit setelah enable sebelum mencoba kembali

**Error: "Rate limit exceeded"**
- Google Sheets API memiliki rate limit
- Tunggu beberapa detik sebelum mencoba kembali

## Keuntungan Menggunakan Google Sheets

1. **Backup Data:** Data pesanan tersimpan di cloud
2. **Real-time Monitoring:** Bisa memantau order secara real-time
3. **Analisis:** Bisa menggunakan fitur analisis Google Sheets
4. **Export:** Mudah export ke berbagai format (Excel, CSV, PDF)
5. **Collaboration:** Tim bisa mengakses dan menganalisis data bersama-sama
