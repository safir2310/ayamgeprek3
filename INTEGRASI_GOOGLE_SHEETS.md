# Integrasi Google Sheets untuk Ayam Geprek Sambal Ijo

## Overview

Integrasi ini secara otomatis menyimpan semua data pesanan ke Google Sheets setiap kali checkout dilakukan. Data akan tersinkronisasi secara real-time ke spreadsheet berikut:

📊 **Spreadsheet:** https://docs.google.com/spreadsheets/d/1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ/edit

## Cara Kerja

### Alur Data:
1. **User Checkout** → Order disimpan ke database lokal (SQLite)
2. **Async Sync** → Order dikirim ke Google Sheets secara background
3. **Error Handling** → Jika Google Sheets gagal, data tetap tersimpan di database lokal

### Keuntungan:
- ✅ Data tersimpan di cloud secara real-time
- ✅ Monitoring order bisa dilakukan langsung di Google Sheets
- ✅ Analisis data dengan fitur Google Sheets
- ✅ Export ke Excel/CSV/PDF dengan mudah
- ✅ Backup otomatis oleh Google
- ✅ Akses dari berbagai device

## Setup Cepat (5 Langkah)

### 1️⃣ Setup Google Cloud Project
```
1. Buka: https://console.cloud.google.com/
2. Buat project baru: "Ayam Geprek Sambal Ijo"
3. Aktifkan Google Sheets API
4. Buat Service Account dengan role "Editor"
5. Download key JSON file
6. Rename menjadi: google-sheets-key.json
7. Pindahkan ke: /home/z/my-project/google-sheets-key.json
```

### 2️⃣ Bagikan Spreadsheet ke Service Account
```
1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ/edit
2. Klik "Share" di pojok kanan atas
3. Paste email service account dari file JSON
4. Set role: "Editor"
5. Klik "Send"
```

### 3️⃣ Verifikasi Environment
Environment variable sudah diset otomatis:
```env
GOOGLE_SPREADSHEET_ID=1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ
```

### 4️⃣ Restart Dev Server
```bash
pkill -f "next dev"
bun run dev
```

### 5️⃣ Testing
```
1. Lakukan checkout order di aplikasi
2. Buka spreadsheet Google Sheets
3. Sheet "Pesanan" akan dibuat otomatis
4. Data order akan muncul di baris berikutnya
```

## Panduan Lengkap

Untuk instruksi detail lengkap, baca file:
📖 **`google-sheets-setup-instructions.md`**

Panduan tersebut mencakup:
- Setup Google Cloud Project (detail lengkap)
- Buat Service Account (step-by-step)
- Generate dan download key JSON
- Share spreadsheet ke service account
- Troubleshooting masalah umum
- Keamanan credentials

## Struktur Data di Google Sheets

Data akan disimpan dengan format berikut:

| Timestamp | Order Number | Customer Name | Phone | Address | Total | Final | Discount | Payment | Voucher | Items | Notes | Payment Status | Order Status |
|-----------|--------------|----------------|-------|---------|-------|-------|----------|----------|---------|---------|---------------|--------------|
| 01/05/2025 | ORD1715xxx | Ahmad Subekti | 0812... | Jl. x... | 65000 | 60000 | 5000 | COD | DISKON10 | JSON array | Pedas | pending | pending |

**Catatan:**
- Sheet "Pesanan" akan dibuat otomatis pada order pertama
- Header akan dibuat di baris pertama
- Data order akan di-append setiap checkout

## Fitur yang Tersedia

### 1. Auto-Sync
- Setiap order otomatis disimpan ke Google Sheets
- Sync bersifat asynchronous (tidak blocking checkout)
- Error tidak mempengaruhi fungsi utama

### 2. Real-time Monitoring
- Tim bisa memantau order langsung dari spreadsheet
- Data update seketika order dibuat
- Bisa diakses dari berbagai device

### 3. Data Analytics
- Gunakan Google Sheets functions untuk analisis
- Buat charts dan graphs
- Filter dan sort data sesuai kebutuhan

### 4. Export Options
- Export ke Excel: File > Download > Microsoft Excel
- Export ke CSV: File > Download > Comma-separated values
- Export ke PDF: File > Download > PDF Document

## Security Best Practices

### ✅ DO:
- Keep `google-sheets-key.json` in .gitignore (sudah diset)
- Limit access to service account to necessary API only
- Use role-based access control in Google Sheets

### ❌ DON'T:
- JANGAN commit `google-sheets-key.json` ke git repository
- JANGAN share credentials ke public chat/forum
- JANGAN use production key in development environment

## Monitoring & Debugging

### Cek Logs
```bash
# Real-time logs
tail -f /home/z/my-project/dev.log

# Cari Google Sheets error
tail -f /home/z/my-project/dev.log | grep -i "google"
```

### Common Error Messages

**"Google Sheets not configured, skipping sheet sync"**
- Artinya: Environment variable atau key file belum diset
- Solusi: Ikuti panduan setup lengkap

**"Google Sheets sync error (non-blocking)"**
- Artinya: Ada error saat sync ke Google Sheets
- Solusi: Cek logs untuk detail error
- Note: Order tetap tersimpan di database lokal

**"Service account not configured"**
- Artinya: File `google-sheets-key.json` tidak ditemukan
- Solusi: Pastikan file ada di root folder project

## Troubleshooting

### Masalah: Data tidak muncul di Google Sheets

**Ceklist:**
- [ ] File `google-sheets-key.json` ada di `/home/z/my-project/`
- [ ] Service account email sudah di-share ke spreadsheet
- [ ] Role untuk service account adalah "Editor"
- [ ] Google Sheets API sudah di-enable
- [ ] Environment variable `GOOGLE_SPREADSHEET_ID` benar

**Langkah Solusi:**
1. Cek dev server logs untuk error spesifik
2. Verify semua item di checklist di atas
3. Restart dev server setelah mengubah konfigurasi
4. Lakukan test order baru

### Masalah: Error rate limit

**Penyebab:** Google Sheets API memiliki rate limit per menit

**Solusi:**
- Tunggu beberapa detik sebelum mencoba lagi
- Jika sering terjadi, pertimbangkan untuk mengurangi frekuensi sync
- Error tidak fatal, data tetap tersimpan di database lokal

## Dukungan

### Dokumentasi
- 📖 `GOOGLE_SHEETS_SETUP.md` - Setup dasar
- 📖 `google-sheets-setup-instructions.md` - Panduan lengkap
- 📖 File ini - Quick reference

### Spreadsheet
- 📊 **Live Spreadsheet:** https://docs.google.com/spreadsheets/d/1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ/edit

### Support
Jika masih mengalami masalah:
1. Baca panduan lengkap di `google-sheets-setup-instructions.md`
2. Cek dev server logs: `tail -f /home/z/my-project/dev.log`
3. Pastikan semua langkah setup diikuti dengan benar

## Status Integrasi

✅ **Checkout API** - Menyimpan order ke database lokal dan Google Sheets
✅ **Auto-Sync** - Sync asynchronous dan non-blocking
✅ **Error Handling** - Error tidak mempengaruhi fungsi utama
✅ **Environment** - Spreadsheet ID sudah diset otomatis

⚠️ **TODO (Manual Setup):**
- [ ] Setup Google Cloud Project
- [ ] Buat Service Account
- [ ] Download dan setup `google-sheets-key.json`
- [ ] Share spreadsheet ke service account
- [ ] Test integrasi dengan order checkout

---

**Last Updated:** 2025-05-01
**Project:** Ayam Geprek Sambal Ijo
**Spreadsheet ID:** 1a9Hw4nX84Tzt9vgwoLNWDpNp4LeF2qa6O9vTpo3-izQ
