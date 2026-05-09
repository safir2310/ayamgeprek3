# 🚀 Neon Database Quick Start Guide

## Cara Cepat Setup Neon Database (5 Menit)

### Step 1: Buat Database di Neon (2 Menit)

1. **Buka:** https://neon.tech
2. **Login** dengan akun Anda (bisa pakai GitHub)
3. **Klik "Create a project"**
4. **Isi:**
   - Project name: `ayamgeprekfinal`
   - Region: Singapore (ap-southeast-1)
   - Plan: Free
5. **Klik "Create project"**

### Step 2: Copy Connection Strings (30 Detik)

Setelah project dibuat, Neon akan menampilkan connection string:

**Pooled Connection** (untuk app):
```
postgresql://[user]:[pass]@ep-[xxx].aws.region.neon.tech/neondb?sslmode=require&pgbouncer=true
```

**Direct Connection** (untuk migration):
```
postgresql://[user]:[pass]@ep-[xxx].aws.region.neon.tech/neondb?sslmode=require
```

✅ **Copy kedua string ini!**

---

### Step 3: Update .env File (30 Detik)

Edit file `.env` di root project:

```env
DATABASE_URL="paste-pooled-connection-string-here"
DIRECT_URL="paste-direct-connection-string-here"
```

Contoh lengkap:
```env
DATABASE_URL="postgresql://neondb_owner:xyz123@ep-cool-darkness-123.aws.ap-southeast-1.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://neondb_owner:xyz123@ep-cool-darkness-123.aws.ap-southeast-1.neon.tech/neondb?sslmode=require"
```

---

### Step 4: Generate & Push Schema (1 Menit)

Run command ini di terminal:

```bash
# Generate Prisma Client
bun run db:generate

# Push schema ke database
bun run db:push
```

Tunggu sampai selesai, akan muncul:
```
✔ Generated Prisma Client (X.XX s)
✔ Successfully created database tables
```

---

### Step 5: Test Connection (1 Menit)

```bash
bun run db:test
```

Jika berhasil, akan muncul:
```
🔌 Testing database connection...
================================
✅ Database connection successful!

📊 Testing database queries...
--------------------------------
👥 Total users: 0
📦 Total products: 0
📋 Total orders: 0
🎟️  Total vouchers: 0

================================
✅ All tests passed!
================================
```

---

### Step 6: Setup di Vercel (2 Menit)

**Option A: Otomatis (Recommended)**

1. Buka Vercel Dashboard
2. Settings → Integrations
3. Cari "Neon"
4. Klik "Add" → Login → Pilih project Neon
5. Vercel otomatis set environment variables ✅

**Option B: Manual**

1. Buka Vercel Dashboard → Settings → Environment Variables
2. Add variables:
   - Name: `DATABASE_URL` → Value: Pooled connection string
   - Name: `DIRECT_URL` → Value: Direct connection string
3. Select environments: Production, Preview, Development
4. Klik "Save" untuk masing-masing

---

### Step 7: Deploy ke Vercel

1. Push code ke GitHub (jika belum):
```bash
git add .
git commit -m "Setup Neon database"
git push
```

2. Di Vercel, klik **"Redeploy"**
3. Tunggu deployment selesai
4. Akses URL deployment ✅

---

## 🎯 Checklist Selesai

- [ ] Database Neon dibuat
- [ ] Connection strings dicopy
- [ ] `.env` file diupdate
- [ ] `bun run db:generate` berhasil
- [ ] `bun run db:push` berhasil
- [ ] `bun run db:test` passed
- [ ] Environment variables di Vercel
- [ ] Deploy ke Vercel success

---

## 🔧 Commands yang Berguna

```bash
# Test koneksi database
bun run db:test

# Generate Prisma Client (after schema changes)
bun run db:generate

# Push schema changes ke database
bun run db:push

# Create new migration
bun run db:migrate

# Reset database (⚠️ Hati-hati!)
bun run db:reset

# Seed database dengan data awal
bun run db:seed
```

---

## 🆘 Troubleshooting

### Error: "Connection refused"
- Cek `.env` file
- Pastikan connection string benar
- Pastikan `sslmode=require` ada

### Error: "Prisma Client is not generated"
- Run `bun run db:generate`
- Pastikan tidak ada error di schema

### Error: "Database connection timeout"
- Cek internet connection
- Pastikan database Neon active
- Coba reconnect ke dashboard Neon

---

## 📚 Resources

- **Neon Dashboard:** https://console.neon.tech
- **Neon Docs:** https://neon.tech/docs
- **Project Repo:** https://github.com/safir2310/ayamgeprekfinal

---

**Selamat! Database Anda siap digunakan! 🎉**
