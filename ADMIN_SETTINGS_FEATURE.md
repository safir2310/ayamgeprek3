# Fitur Dashboard Admin - Menyimpan Data ke Database

## Ringkasan

Fitur ini memungkinkan admin untuk menyimpan dan mengelola pengaturan toko dan sistem dashboard secara terpusat ke database.

## Apa yang Dibuat

### 1. Model Database (AdminSettings)

File: `prisma/schema.prisma`

Field yang tersedia:
- **Informasi Toko**
  - `storeName` - Nama toko
  - `storeDescription` - Deskripsi toko
  - `storeAddress` - Alamat toko
  - `storePhone` - Nomor telepon toko
  - `storeEmail` - Email toko
  - `businessHours` - Jam operasional (JSON)

- **Pengaturan Pembayaran**
  - `taxRate` - Pajak (default: 11%)
  - `currency` - Mata uang (default: IDR)
  - `defaultPaymentMethods` - Metode pembayaran default (JSON array)
  - `autoApprovePayments` - Otomatis approve pembayaran

- **Program Loyalty**
  - `enableLoyaltyProgram` - Aktifkan program loyalty
  - `pointMultiplier` - Multiplier poin yang didapat
  - `redemptionMultiplier` - Multiplier poin redeem
  - `loyaltyPointsPerRp` - Poin per unit mata uang
  - `minOrderForPoints` - Minimum order untuk dapat poin

- **Notifikasi**
  - `sendNotifications` - Kirim notifikasi
  - `backupEnabled` - Backup otomatis

- **Tampilan**
  - `theme` - Tema (light/dark/auto)
  - `language` - Bahasa (id/en)
  - `dashboardLayout` - Konfigurasi layout dashboard (JSON)

- **Timestamp**
  - `lastBackupDate` - Tanggal backup terakhir
  - `createdAt`, `updatedAt`

### 2. API Endpoint

File: `src/app/api/admin/settings/route.ts`

**GET** `/api/admin/settings`
- Mengambil semua pengaturan admin
- Jika belum ada settings, akan otomatis membuat default settings
- Mengembalikan settings dengan JSON strings sudah ter-parsing

**POST** `/api/admin/settings`
- Menyimpan/update pengaturan admin
- Menerima semua field settings
- Mengupdate settings yang sudah ada atau membuat baru jika belum ada
- Mengembalikan settings yang sudah diupdate

### 3. Komponen AdminSettings

File: `src/components/admin/AdminSettings.tsx`

Fitur UI:

**Tab Navigation:**
1. **Toko** - Informasi toko dan jam operasional
2. **Pembayaran** - Pengaturan pajak dan metode pembayaran
3. **Loyalty** - Program loyalty dan poin
4. **Notifikasi** - Pengaturan notifikasi
5. **Tampilan** - Tema dan bahasa

**Fitur per Tab:**

**Toko Tab:**
- Nama toko
- Email toko
- Telepon toko
- Mata uang
- Deskripsi toko
- Alamat toko
- Jam operasional (7 hari dengan open/close time dan toggle aktif/non-aktif)

**Pembayaran Tab:**
- Pengaturan pajak (persentase)
- Pilihan metode pembayaran default (QRIS, Cash, COD, Transfer)
- Toggle otomatis approve pembayaran

**Loyalty Tab:**
- Toggle aktifkan program loyalty
- Poin per Rp yang dibelanjakan
- Minimum order untuk dapat poin
- Multiplier poin earn
- Multiplier poin redeem

**Notifikasi Tab:**
- Toggle kirim notifikasi
- Toggle backup otomatis

**Tampilan Tab:**
- Pilihan tema (Light, Dark, Auto)
- Pilihan bahasa (Bahasa Indonesia, English)

**Fitur Tambahan:**
- Loading state saat memuat settings
- Saving state saat menyimpan
- Indikasi perubahan yang belum disimpan
- Toast notification untuk success/error
- Auto-save saat klik tombol "Simpan Pengaturan"

### 4. Integrasi ke Dashboard Admin

File: `src/components/admin/AdminDashboard.tsx`

Menu "Settings" ditambahkan ke sidebar:
- Icon: Settings (lucide-react)
- Position: Sebelum menu Database
- Navigasi: `activePage === 'settings'`

## Cara Menggunakan

1. Akses Dashboard Admin
2. Klik menu "Settings" di sidebar
3. Edit pengaturan di tab yang diinginkan
4. Klik tombol "Simpan Pengaturan"
5. Settings akan tersimpan ke database dan diterapkan

## Keuntungan

✅ **Centralized Management** - Semua pengaturan toko dan sistem di satu tempat
✅ **Persistent Storage** - Settings tersimpan di database, tidak hilang saat refresh
✅ **Real-time Updates** - Perubahan langsung disimpan dan diterapkan
✅ **User-Friendly UI** - Interface tabbed yang mudah dinavigasi
✅ **Validation** - Input validasi untuk semua field
✅ **Responsive Design** - Bekerja dengan baik di mobile dan desktop
✅ **Type Safety** - Full TypeScript support

## Security

✅ Hanya admin yang bisa mengakses dan mengubah settings
✅ Token validation dengan role check
✅ Error handling yang komprehensif

## Database Schema Update

Schema telah ditambahkan:
- Model `AdminSettings` dengan semua field yang diperlukan
- Database sudah diupdate dengan `bun run db:push`

## Status

✅ Model database dibuat
✅ Database diupdate
✅ API endpoint dibuat
✅ Komponen AdminSettings dibuat
✅ Integrasi ke dashboard admin selesai
✅ Ready untuk testing dan production

## Testing

Untuk menguji fitur ini:
1. Buka Dashboard Admin
2. Klik menu "Settings"
3. Edit beberapa pengaturan
4. Klik "Simpan Pengaturan"
5. Refresh halaman
6. Settings harus tetap tersimpan

---

**Tanggal Dibuat:** 2025-05-09
**Status:** Selesai & Ready for Production
