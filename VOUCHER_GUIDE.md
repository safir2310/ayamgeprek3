# Panduan Voucher

## Voucher Sample yang Telah Dibuat

Berikut adalah 3 voucher yang telah ditambahkan ke database untuk pengujian:

### 1. DISKON10
- **Nama**: Diskon 10% Semua Produk
- **Tipe**: Persentase (10%)
- **Min. Pembelian**: Rp 50.000
- **Max. Diskon**: Rp 50.000
- **Batas Penggunaan**: 100 kali
- **Status**: Aktif ✅

### 2. HEMAT20K
- **Nama**: Hemat Rp 20.000
- **Tipe**: Fixed (Rp 20.000)
- **Min. Pembelian**: Rp 100.000
- **Max. Diskon**: Tidak ada
- **Batas Penggunaan**: 50 kali
- **Status**: Aktif ✅

### 3. GRATISONGKIR
- **Nama**: Gratis Ongkir
- **Tipe**: Fixed (Rp 15.000)
- **Min. Pembelian**: Rp 75.000
- **Max. Diskon**: Rp 15.000
- **Batas Penggunaan**: 200 kali
- **Status**: Aktif ✅

## Cara Membuat Voucher Baru di Admin Dashboard

1. Login sebagai admin
2. Buka menu "Kelola Voucher"
3. Klik tombol "Tambah Voucher"
4. Isi data voucher:
   - **Kode**: Kode unik (contoh: PROMO123)
   - **Nama**: Nama voucher (contoh: Diskon Lebaran)
   - **Deskripsi**: Deskripsi singkat voucher
   - **Tipe**: Persentase (%) atau Fixed (Rp)
   - **Diskon**: Nilai diskon
   - **Min. Order**: Minimal belanja (Rp)
   - **Max. Diskon**: Maksimal diskon (untuk tipe persentase)
   - **Mulai**: Tanggal mulai aktif
   - **Berakhir**: Tanggal kadaluarsa
   - **Batas Pakai**: Jumlah maksimal penggunaan (kosongkan untuk unlimited)
   - **Aktif**: Centang untuk mengaktifkan voucher
5. Klik tombol "Simpan"

## Cara Menggunakan Voucher di Checkout

1. Tambahkan produk ke keranjang
2. Buka checkout
3. Di bagian "Kode Voucher", masukkan kode:
   - `DISKON10` untuk diskon 10%
   - `HEMAT20K` untuk diskon Rp 20.000
   - `GRATISONGKIR` untuk gratis ongkir Rp 15.000
4. Sistem akan otomatis memvalidasi voucher
5. Jika valid, diskon akan otomatis diterapkan

## Masalah Umum dan Solusi

### "Voucher tidak valid"
- Pastikan kode voucher dimasukkan dengan benar (case-insensitive)
- Pastikan voucher masih dalam periode aktif
- Pastikan total pembelian memenuhi minimum belanja
- Pastikan voucher belum mencapai batas penggunaan

### "Voucher sudah kadaluarsa atau belum aktif"
- Cek tanggal mulai dan berakhir voucher di admin dashboard
- Pastikan tanggal saat ini berada dalam periode tersebut

### "Minimum belanja Rp XXXXX untuk menggunakan voucher ini"
- Tambahkan lebih banyak produk ke keranjang
- Gunakan voucher dengan minimum pembelian yang lebih rendah

## Validasi Voucher

Sistem memvalidasi voucher berdasarkan:
1. ✅ Status harus "active"
2. ✅ Tanggal saat ini harus >= startDate
3. ✅ Tanggal saat ini harus <= endDate
4. ✅ UsageCount < UsageLimit (jika ada batas)
5. ✅ Total pembelian >= MinPurchase

## Export Voucher ke Excel

Untuk mengexport daftar voucher:
1. Buka Admin Dashboard
2. Masuk ke menu "Kelola Voucher"
3. Klik tombol "Export ke Excel"
4. File Excel akan terdownload dengan data lengkap voucher
