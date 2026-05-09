# 🔐 Panduan Membuat Database Vercel Postgres

Vercel CLI tidak memiliki perintah untuk membuat Postgres database secara otomatis. Database harus dibuat melalui Vercel Dashboard.

---

## 📋 Langkah-langkah Membuat Database

### Step 1: Login ke Vercel Dashboard

1. Buka: https://vercel.com
2. Login menggunakan email/akun Anda

### Step 2: Buat Database Postgres

#### Cara A (Dari Project Baru)

1. Klik **"Add New Project"**
2. Pilih **Storage** → **Postgres**
3. Klik **"Create Database"**
4. Tunggu proses pembuatan (10-30 detik)

#### Cara B (Dari Project Ada)

1. Buka project yang ada di dashboard
2. Klik tab **"Storage"**
3. Klik **"Create Database"**
4. Pilih **"Postgres"**
5. Klik **"Create"**

### Step 3: Ambil Connection String

Setelah database dibuat:

1. Klik pada database yang baru dibuat
2. Buka tab **"Connection Details"**
3. Copy salah satu connection string:
   - **Prisma** (recommended) → `postgresql://...`
   - **Node.js** → `postgres://...`
   - **Direct** → `postgresql://...` (tanpa pooler)

### Step 4: Update .env

#### Jika menggunakan **Prisma** connection string:

```env
# Pooled connection (untuk app runtime)
DATABASE_URL=postgresql://user:pass@host-pooler.vercel-storage.com/db?sslmode=require

# Direct connection (untuk migrations)
DIRECT_URL=postgresql://user:pass@host.vercel-storage.com/db?sslmode=require
```

#### Jika menggunakan connection string lain:

Hapus bagian connection pooling:
- Dari: `...pooler.vercel-storage.com/db...`
- Menjadi: `...vercel-storage.com/db...`

---

## 📝 Cara Update .env Otomatis

Script helper tersedia: `scripts/vercel-env-helper.js`

Gunakan dengan memberikan connection string:

```bash
node scripts/vercel-env-helper.js "POSTGRES_CONNECTION_STRING"
```

---

## 🔍 Struktur Connection String Vercel Postgres

### Format:

```
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require&pgbouncer=true
```

### Bagian-bagian:

- **USER:** Database username (biasanya: default.xxxxxx)
- **PASSWORD:** Database password
- **HOST:** Server address (bisa dengan atau tanpa pooler)
- **DATABASE:** Database name (biasanya: verceldb atau postgres)
- **sslmode=require:** SSL connection (wajib)
- **pgbouncer=true:** Connection pooling (untuk app runtime)

---

## 🎯 Setelah Database Dibuat

### 1. Update Prisma Schema (Sudah)

`prisma/schema.prisma` sudah menggunakan PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 2. Generate Prisma Client

```bash
bun run db:generate
```

### 3. Push Schema ke Database

```bash
bun run db:push
```

### 4. Seed Data (Opsional)

```bash
bun run db:seed
```

### 5. Deploy ke Vercel

Environment variables akan otomatis ter-sync jika database dibuat di project yang sama.

---

## 📞 Perbedaan Neon vs Vercel Postgres

| Fitur | Neon | Vercel Postgres |
|--------|-------|------------------|
| Gratis | ✅ Ya | ✅ Ya |
| Lokasi | Singapore (ap-southeast-1) | Global (auto) |
| Connection Pooling | ✅ PgBouncer | ✅ PgBouncer |
| Hibernation | ✅ Ya (5 min) | ❌ Tidak |
| Dashboard | neon.tech | vercel.com |
| Integration | Manual | Auto (dengan Vercel projects) |
| Latency | 30-50ms (Singapura) | 10-30ms (Global) |

---

## 🚨 Masalah yang Mungkin Terjadi

### Error: Connection Timeout

**Solusi:**
- Pastikan `sslmode=require` ada di connection string
- Periksa firewall/network settings
- Coba dengan DIRECT_URL untuk migrasi

### Error: Invalid Connection String

**Solusi:**
- Copy langsung dari Vercel Dashboard
- Pastikan tidak ada karakter tambahan (quote, space)
- Escape karakter khusus jika menggunakan shell

### Error: Database Not Found

**Solusi:**
- Pastikan database sudah di-create di Vercel
- Periksa project scope yang benar
- Coba re-link project

---

## ✅ Checklist

Sebelum deployment:

- [ ] Database Postgres dibuat di Vercel Dashboard
- [ ] Connection string dicopy dari tab "Connection Details"
- [ ] `.env` diupdate dengan DATABASE_URL dan DIRECT_URL
- [ ] `bun run db:generate` berhasil
- [ ] `bun run db:push` berhasil
- [ ] Data sudah di-seed (opsional)
- [ ] Environment variables ter-sync di Vercel

---

## 💡 Tips

1. **Simpan Password di Tempat Aman**
   - Gunakan password manager (1Password, Bitwarden, dll)
   - Jangan simpan di clipboard untuk lama
   - Jangan share kredensial

2. **Gunakan Connection String yang Benar**
   - Pooled connection untuk DATABASE_URL (app runtime)
   - Direct connection untuk DIRECT_URL (migrations)
   - Jangan tukar keduanya!

3. **Test Lokal Dulu**
   - Pastikan database bisa diakses dari local
   - Test schema push dan seed
   - Baru deploy ke production

4. **Monitor Database**
   - Buka Vercel Dashboard → Storage
   - Monitor usage dan quota
   - Periksa connection logs jika ada error

---

## 📞 Bantuan

- **Vercel Docs:** https://vercel.com/docs/storage/vercel-postgres
- **Vercel Support:** https://vercel.com/support
- **Prisma Docs:** https://pris.ly/databases/postgresql

---

**Database Vercel Postgres siap digunakan! 🚀**
