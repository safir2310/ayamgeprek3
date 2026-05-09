# Perbaikan Authentication Admin - Category & Promo Management

## Masalah
1. **Gagal memuat kategori** - CategoryManagement tidak mengirim token Bearer di header
2. **Gagal memuat promo** - PromoManagement tidak mengirim token Bearer di header
3. **Gagal membuat promo** - PromoManagement tidak mengirim token Bearer di header

## Penyebab Masalah
Komponen CategoryManagement dan PromoManagement tidak menggunakan header `Authorization: Bearer ${token}` saat memanggil API admin, sehingga API mengembalikan error 401 Unauthorized.

## Solusi
Menambahkan autentikasi yang benar ke kedua komponen dengan pattern yang sama seperti PointRedemptionManagement yang sudah berfungsi dengan baik.

## Perubahan yang Dilakukan

### 1. CategoryManagement.tsx
**File**: `src/components/admin/CategoryManagement.tsx`

**Perubahan**:
- ✅ Menambahkan import `useStore` untuk mengakses token
- ✅ Menambahkan import `autoLoginAsAdmin` untuk auto-login admin
- ✅ Menambahkan import `AlertCircle` untuk UI error
- ✅ Menambahkan state `isAutoLoggingIn` untuk tracking auto-login
- ✅ Menambahkan state `_hasHydrated` dan `user` dari store

**Fungsi yang Diperbarui**:

a. **`loadCategories()`**:
   - Mengambil token dari store via `useStore.getState()`
   - Menambahkan header `Authorization: Bearer ${token}` ke semua request
   - Menambahkan logic auto-login pada 401 error
   - Retry request setelah auto-login berhasil

b. **`handleDelete()`**:
   - Check admin role sebelum menghapus
   - Menambahkan header `Authorization: Bearer ${token}` ke DELETE request
   - Menambahkan logic auto-login pada 401 error

c. **`handleSubmit()`**:
   - Check admin role sebelum menyimpan
   - Menambahkan header `Authorization: Bearer ${token}` ke POST request
   - Menambahkan logic auto-login pada 401 error
   - Mengirim `id` di body untuk update kategori

d. **`useEffect` - Auto-login**:
   - Check `_hasHydrated` sebelum load data
   - Auto-login jika user bukan admin
   - Load kategori jika user sudah admin

e. **UI States - Auth Checks**:
   - Loading state saat `_hasHydrated = false`
   - Auto-logging state saat `isAutoLoggingIn = true`
   - Access denied state jika user bukan admin

### 2. PromoManagement.tsx
**File**: `src/components/admin/PromoManagement.tsx`

**Perubahan**:
- ✅ Menambahkan import `useStore` untuk mengakses token
- ✅ Menambahkan import `autoLoginAsAdmin` untuk auto-login admin
- ✅ Menambahkan import `AlertCircle` untuk UI error
- ✅ Menambahkan state `isAutoLoggingIn` untuk tracking auto-login
- ✅ Menambahkan state `_hasHydrated` dan `user` dari store

**Fungsi yang Diperbarui**:

a. **`loadPromoProducts()`**:
   - Check `_hasHydrated` sebelum load data
   - Mengambil token dari store via `useStore.getState()`
   - Menambahkan header `Authorization: Bearer ${token}` ke GET request
   - Menambahkan logic auto-login pada 401 error
   - Retry request setelah auto-login berhasil

b. **`loadProducts()`**:
   - Load list produk untuk dropdown
   - Tidak memerlukan token (API publik)

c. **`handleDelete()`**:
   - Check admin role sebelum menghapus
   - Menambahkan header `Authorization: Bearer ${token}` ke DELETE request
   - Menambahkan logic auto-login pada 401 error
   - Retry request setelah auto-login berhasil

d. **`handleSubmit()`**:
   - Check admin role sebelum menyimpan
   - Menambahkan header `Authorization: Bearer ${token}` ke POST request
   - Menambahkan logic auto-login pada 401 error
   - Retry request setelah auto-login berhasil
   - Load promo list setelah berhasil simpan

e. **`useEffect` - Auto-login**:
   - Check `_hasHydrated` sebelum load data
   - Auto-login jika user bukan admin
   - Load produk dan promos jika user sudah admin

f. **UI States - Auth Checks**:
   - Loading state saat `_hasHydrated = false`
   - Auto-logging state saat `isAutoLoggingIn = true`
   - Access denied state jika user bukan admin
   - Menampilkan tombol "Refresh Halaman" untuk retry

## Pattern Authentication yang Digunakan

```typescript
// 1. Check hydration
if (!_hasHydrated) {
  return <LoadingUI />
}

// 2. Auto-login if needed
useEffect(() => {
  if (_hasHydrated) {
    if (!user || user.role !== 'admin') {
      handleAutoLogin()
    } else {
      loadData()
    }
  }
}, [_hasHydrated, user])

// 3. Get token and include in headers
const { token: currentToken } = useStore.getState()
const res = await fetch('/api/admin/endpoint', {
  headers: currentToken ? {
    Authorization: `Bearer ${currentToken}`,
  } : {},
})

// 4. Handle 401 with auto-login
if (res.status === 401) {
  const loginResult = await autoLoginAsAdmin()
  if (loginResult.success) {
    // Retry with new token
    const { token: newToken } = useStore.getState()
    const retryRes = await fetch(url, {
      headers: { Authorization: `Bearer ${newToken}` }
    })
  }
}
```

## Status Saat Ini
- ✅ CategoryManagement - Autentikasi diperbaiki, siap digunakan
- ✅ PromoManagement - Autentikasi diperbaiki, siap digunakan
- ✅ Tidak ada error kompilasi (ESLint passed)
- ✅ Pattern konsisten dengan PointRedemptionManagement

## Testing
Untuk testing:
1. Buka halaman Admin
2. Pilih menu "Categories" atau "Promo"
3. Pastikan halaman menampilkan data (auto-login akan terjadi otomatis)
4. Coba tambah/edit/hapus data
5. Semua operasi seharusnya berfungsi dengan benar

## Catatan
- Auto-login akan terjadi otomatis ketika komponen di-load jika user belum login sebagai admin
- Token admin tersimpan di localStorage melalui Zustand store
- Semua request API sekarang menyertakan header Authorization yang benar
- Error 401 akan otomatis trigger auto-login dan retry request
