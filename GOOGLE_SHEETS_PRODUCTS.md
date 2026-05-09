# Integrasi Produk dengan Google Sheets

## Overview

Aplikasi Ayam Geprek Sambal Ijo sekarang terintegrasi dengan Google Sheets untuk manajemen produk. Semua produk dapat dikelola dan disinkronkan secara real-time ke Google Sheets.

📊 **Spreadsheet:** https://docs.google.com/spreadsheets/d/1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ/edit

## Cara Kerja

### Alur Data Produk:
1. **Primary Source** → Google Sheets sebagai database utama untuk produk
2. **Fallback** → Database SQLite sebagai cadangan jika Google Sheets tidak tersedia
3. **Auto-Sync** → Stok dan jumlah terjual otomatis diupdate setelah checkout

### Keuntungan:
- ✅ Manajemen produk mudah dari Google Sheets
- ✅ Update produk real-time tanpa perlu deploy
- ✅ Backup otomatis oleh Google
- ✅ Akses dari berbagai device
- ✅ Fallback ke database jika Google Sheets gagal

## Struktur Data di Google Sheets (Sheet "Produk")

| Kolom | Deskripsi | Contoh |
|-------|-----------|--------|
| ID | ID produk (cuid) | cm1abc123... |
| Name | Nama produk | Ayam Geprek Sambal Ijo |
| Slug | URL slug | ayam-geprek-sambal-ijo |
| Description | Deskripsi produk | Ayam geprek pedas... |
| Price | Harga normal | 15000 |
| Discount Price | Harga diskon (opsional) | 12000 |
| Stock | Jumlah stok | 100 |
| Barcode | Barcode/ISBN (opsional) | 8991234567890 |
| Image | URL gambar produk | https://... |
| Category | Data kategori (JSON) | {"id":"...", "name":"Ayam"} |
| Featured | Produk unggulan | true/false |
| Sold Count | Jumlah terjual | 45 |
| Rating | Rating produk (0-5) | 4.5 |
| Created At | Tanggal dibuat | 2025-01-01T10:00:00.000Z |
| Updated At | Tanggal diupdate | 2025-01-02T10:00:00.000Z |

## Setup Awal

### 1. Sinkronkan Produk dari Database ke Google Sheets

Jika Anda sudah memiliki produk di database SQLite, jalankan perintah berikut untuk sinkronkan ke Google Sheets:

```bash
bun run sync:products
```

Ini akan:
- Membuat sheet "Produk" jika belum ada
- Menambahkan header ke sheet
- Menyalin semua produk dari database ke Google Sheets

### 2. Verifikasi Sinkronisasi

Buka spreadsheet Google Sheets dan pastikan:
- Sheet "Produk" sudah dibuat
- Semua produk muncul di sheet
- Data sesuai dengan yang ada di database

## Penggunaan Sehari-hari

### Menambah Produk Baru

**Cara 1: Melalui Google Sheets (Recommended)**
1. Buka spreadsheet Google Sheets
2. Masuk ke sheet "Produk"
3. Tambahkan baris baru di bawah header
4. Isi data produk sesuai format

**Format Category (JSON):**
```json
{
  "id": "cm1abc123...",
  "name": "Ayam",
  "slug": "ayam",
  "order": 1
}
```

**Cara 2: Melalui Database**
1. Tambahkan produk ke database SQLite
2. Jalankan `bun run sync:products` untuk sinkronkan ke Google Sheets

### Update Produk

**Update di Google Sheets:**
1. Edit langsung di baris yang diinginkan
2. Perubahan akan langsung terlihat di aplikasi

**Update di Database:**
1. Update produk di database
2. Jalankan `bun run sync:products`

### Hapus Produk

**Hapus di Google Sheets:**
1. Hapus baris produk di sheet "Produk"
2. Produk tidak akan lagi muncul di aplikasi

**Hapus di Database:**
1. Hapus produk dari database
2. Jalankan `bun run sync:products`

### Update Stok Otomatis

Setiap kali ada checkout:
- ✅ Stok produk otomatis dikurangi di Google Sheets
- ✅ Jumlah terjual otomatis bertambah di Google Sheets
- ✅ Fallback ke database jika Google Sheets gagal

## API Endpoint

### GET `/api/products`

Mengambil semua produk dengan opsi filter:

**Query Parameters:**
- `category`: Filter berdasarkan kategori (opsional)
- `search`: Cari produk berdasarkan nama atau barcode (opsional)
- `featured`: Filter produk unggulan saja (opsional)

**Contoh:**
```bash
# Semua produk
curl /api/products

# Filter kategori
curl /api/products?category=ayam

# Cari produk
curl /api/products?search=geprek

# Produk unggulan
curl /api/products?featured=true
```

**Prioritas:**
1. Google Sheets (primary)
2. Database SQLite (fallback)

## Perintah Tersedia

```bash
# Sinkronkan produk dari database ke Google Sheets
bun run sync:products

# Push perubahan database
bun run db:push

# Generate Prisma client
bun run db:generate

# Reset database
bun run db:reset
```

## Troubleshooting

### Masalah: Produk tidak muncul di aplikasi

**Ceklist:**
- [ ] Produk sudah ditambahkan di Google Sheets
- [ ] Format data produk sesuai
- [ ] Category dalam format JSON yang valid
- [ ] ID produk unik
- [ ] Stok lebih dari 0

**Langkah Solusi:**
1. Cek dev server logs: `tail -f dev.log`
2. Buka tab produk di browser
3. Buka browser console untuk error detail
4. Refresh halaman

### Masalah: Stok tidak update setelah checkout

**Ceklist:**
- [ ] Google Sheets API sudah dikonfigurasi
- [ ] Service account sudah di-share ke spreadsheet
- [ ] Google Sheets API sudah di-enable

**Langkah Solusi:**
1. Cek logs untuk error Google Sheets
2. Pastikan sheet "Produk" ada di spreadsheet
3. Pastikan service account memiliki akses Editor

### Masalah: Sinkronisasi gagal

**Error Message:**
```
Google Sheets not configured for products
```

**Penyebab:** Environment variable atau key file belum diset

**Solusi:**
1. Pastikan file `google-sheets-key.json` ada di root folder
2. Pastikan `GOOGLE_SPREADSHEET_ID` sudah diset
3. Restart dev server setelah konfigurasi

### Masalah: Error rate limit Google Sheets

**Penyebab:** Google Sheets API memiliki rate limit

**Solusi:**
- Tunggu beberapa detik sebelum mencoba lagi
- Error tidak fatal, data tetap tersimpan di database

## Security Best Practices

### ✅ DO:
- Keep `google-sheets-key.json` in .gitignore
- Limit access ke service account hanya untuk Sheets API
- Use role-based access control di Google Sheets
- Monitor Google Sheets access regularly

### ❌ DON'T:
- JANGAN commit `google-sheets-key.json` ke git
- JANGAN share credentials ke public chat/forum
- JANGAN use production key di development environment

## Monitoring & Debugging

### Cek Logs
```bash
# Real-time logs
tail -f /home/z/my-project/dev.log

# Cari Google Sheets error
tail -f /home/z/my-project/dev.log | grep -i "google"

# Cari produk error
tail -f /home/z/my-project/dev.log | grep -i "product"
```

### Common Log Messages

**"Loaded X products from Google Sheets"**
- Artinya: Produk berhasil dimuat dari Google Sheets
- Status: ✅ OK

**"No products in Google Sheets, using database as fallback"**
- Artinya: Sheet "Produk" kosong, menggunakan database
- Status: ⚠️ Run `bun run sync:products`

**"Error fetching from Google Sheets, using database fallback"**
- Artinya: Google Sheets gagal, menggunakan database
- Status: ⚠️ Cek konfigurasi Google Sheets

**"Found product in Google Sheets: [product-id]"**
- Artinya: Produk ditemukan di Google Sheets
- Status: ✅ OK

**"Product not found: [product-id]"**
- Artinya: Produk tidak ditemukan
- Status: ❌ Sinkronkan produk atau refresh halaman

**"Product stock updated: [product-id] from X to Y"**
- Artinya: Stok berhasil diupdate di Google Sheets
- Status: ✅ OK

## Advanced Usage

### Sync Otomatis

Untuk sinkronisasi otomatis setiap kali ada perubahan, Anda bisa setup cron job:

```bash
# Add to crontab
crontab -e

# Sync products every 5 minutes
*/5 * * * * cd /home/z/my-project && bun run sync:products >> sync.log 2>&1
```

### Multiple Environments

Untuk environment berbeda (development, staging, production):

1. Buat spreadsheet terpisah untuk setiap environment
2. Set environment variable yang berbeda:
```env
# Development
GOOGLE_SPREADSHEET_ID=dev_spreadsheet_id

# Production
GOOGLE_SPREADSHEET_ID=prod_spreadsheet_id
```

### Backup Data

**Backup Google Sheets ke Excel:**
1. Buka spreadsheet
2. File > Download > Microsoft Excel (.xlsx)

**Backup Database:**
```bash
cp db/custom.db db/custom.db.backup
```

## Panduan Lengkap

Untuk setup Google Sheets API lengkap, baca file:
- 📖 `google-sheets-setup-instructions.md` - Setup Google Cloud Project
- 📖 `INTEGRASI_GOOGLE_SHEETS.md` - Integrasi order ke Google Sheets

## Dukungan

### Dokumentasi
- 📖 `GOOGLE_SHEETS_SETUP.md` - Setup dasar
- 📖 `google-sheets-setup-instructions.md` - Panduan lengkap
- 📖 `INTEGRASI_GOOGLE_SHEETS.md` - Integrasi order
- 📖 File ini - Produk integration

### Spreadsheet
- 📊 **Live Spreadsheet:** https://docs.google.com/spreadsheets/d/1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ/edit

### Support
Jika masih mengalami masalah:
1. Buka dev server logs: `tail -f /home/z/my-project/dev.log`
2. Cek file panduan lengkap
3. Pastikan semua langkah setup diikuti dengan benar

## Status Integrasi

✅ **Google Sheets Product Functions** - Fungsi manajemen produk
✅ **Products API** - Mengambil produk dari Google Sheets dengan fallback
✅ **Checkout API** - Update stok dan sold count di Google Sheets
✅ **Sync Script** - Sinkronisasi produk dari database ke Google Sheets
✅ **Fallback Mechanism** - Fallback ke database jika Google Sheets gagal
✅ **Stock Management** - Auto update stok setelah checkout

---

**Last Updated:** 2025-05-01
**Project:** Ayam Geprek Sambal Ijo
**Spreadsheet ID:** 1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ
