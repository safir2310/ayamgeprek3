# Setup Neon Database untuk Ayam Geprek Sambal Ijo

## 📚 Prasyarat
- Akun Neon (gratis di https://neon.tech)
- Akun GitHub (untuk Vercel integration)
- Project Ayam Geprek Sambal Ijo sudah ada

## 🚀 Langkah-Langkah Setup

### 1. Membuat Database di Neon

#### 1.1 Login ke Neon
1. Buka https://neon.tech
2. Klik "Sign in" atau "Create account"
3. Gunakan akun GitHub, Google, atau email Anda

#### 1.2 Buat Project Baru
1. Klik tombol **"Create a project"** (di dashboard)
2. Isi form:
   - **Project name**: `ayamgeprekfinal` (atau nama lain)
   - **Region**: Pilih Singapore (ap-southeast-1) untuk performa terbaik di Indonesia
   - **PostgreSQL version**: Biarkan default (16)
   - **Select a plan**: Free (tanpa biaya)

3. Klik **"Create project"**

#### 1.3 Ambil Connection Strings
Setelah project berhasil dibuat, Anda akan melihat 2 connection strings:

**Pooled Connection String** (untuk production):
```
postgresql://[user]:[password]@ep-[id].aws.region.neon.tech/neondb?sslmode=require&pgbouncer=true
```

**Direct Connection String** (untuk migration):
```
postgresql://[user]:[password]@ep-[id].aws.region.neon.tech/neondb?sslmode=require
```

✅ **Copy kedua connection string ini!**

---

### 2. Setup Project untuk Neon

#### 2.1 Update Environment Variables

**Untuk Local Development:**

Edit file `.env`:
```env
DATABASE_URL="postgresql://[user]:[password]@ep-[id].aws.region.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://[user]:[password]@ep-[id].aws.region.neon.tech/neondb?sslmode=require"
```

**Untuk Vercel:**

1. Buka dashboard Vercel: https://vercel.com/dashboard
2. Pilih project `ayamgeprekfinal`
3. Masuk ke **Settings** > **Environment Variables**
4. Add environment variables:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Pooled connection string | Production, Preview, Development |
| `DIRECT_URL` | Direct connection string | Production, Preview, Development |

5. Klik **"Save"** untuk setiap variable

---

### 3. Generate & Push Prisma Schema

#### 3.1 Install Dependencies (jika belum ada)
```bash
bun install
```

#### 3.2 Generate Prisma Client
```bash
bun run db:generate
```

#### 3.3 Push Schema ke Database
```bash
bun run db:push
```

Ini akan:
- Membuat semua tabel di database Neon
- Membuat semua relasi antar tabel
- Menyiapkan database untuk digunakan

---

### 4. Seed Initial Data (Opsional)

Jika Anda ingin mengisi database dengan data awal:

```bash
bun run db:seed
```

---

### 5. Testing Connection

Buat file test sederhana untuk memastikan connection berhasil:

```typescript
// test-db.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful!')

    // Test query
    const userCount = await prisma.user.count()
    console.log(`👥 Total users: ${userCount}`)

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

testConnection()
```

Run dengan:
```bash
bun run test-db.ts
```

---

### 6. Deploy ke Vercel

#### 6.1 Setup Vercel Integration dengan Neon

1. **Di Vercel Dashboard:**
   - Buka Settings > Integrations
   - Cari "Neon"
   - Klik **"Add"** atau **"Configure"**

2. **Authorize Neon:**
   - Login ke akun Neon Anda
   - Pilih project Neon yang sudah dibuat
   - Konfirmasi integration

3. **Vercel akan otomatis:**
   - Mengambil connection string dari Neon
   - Menambahkan environment variables
   - Menghubungkan database dengan project

#### 6.2 Deploy Project

1. Di Vercel, buka **Deployments**
2. Klik tombol **"Redeploy"**
3. Tunggu deployment selesai

---

## 🔧 Troubleshooting

### Error: Connection Refused
- Pastikan connection string benar
- Cek apakah IP address Anda diblok (Neon IP allowlist)
- Pastikan SSL mode diaktifkan (`sslmode=require`)

### Error: Migration Failed
- Gunakan `DIRECT_URL` untuk migration, bukan `DATABASE_URL`
- Pastikan Prisma schema valid
- Cek logs di Neon dashboard

### Error: Timeout
- Pastikan region database sesuai dengan region aplikasi
- Cek network connection
- Neon Free tier mungkin memiliki timeout lebih lama

---

## 📊 Monitoring di Neon

### Dashboard Neon
Buka https://console.neon.tech untuk melihat:

1. **Project Overview**:
   - Database usage
   - Storage usage
   - Active connections

2. **SQL Editor**:
   - Jalankan query SQL langsung
   - Debug data
   - Test queries

3. **Metrics**:
   - CPU usage
   - Memory usage
   - Read/Write operations

4. **Logs**:
   - Database query logs
   - Error logs
   - Connection logs

---

## 🔄 Backup & Restore

### Automatic Backup
Neon menyediakan automatic backup di Free tier:
- Setiap 4-8 jam
- Retention: 7 hari

### Manual Backup (Export)
```bash
# Export database ke SQL file
pg_dump "postgresql://[user]:[password]@ep-[id].aws.region.neon.tech/neondb" > backup.sql
```

### Restore from Backup
```bash
# Import dari SQL file
psql "postgresql://[user]:[password]@ep-[id].aws.region.neon.tech/neondb" < backup.sql
```

---

## 💡 Best Practices

1. **Environment Variables**:
   - JANGAN commit `.env` file
   - Gunakan `.env.example` untuk template
   - Jaga kerahasiaan connection string

2. **Connection Pooling**:
   - Gunakan pooled connection (`pgbouncer=true`) untuk production
   - Direct connection hanya untuk migration

3. **Monitoring**:
   - Pantau database usage di Neon dashboard
   - Setup alerts jika mendekati limit

4. **Performance**:
   - Gunakan indexes pada columns yang sering diquery
   - Optimize queries di Prisma
   - Hindari N+1 query problem

---

## 📚 Resources

- **Neon Documentation**: https://neon.tech/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **Vercel Integration Guide**: https://vercel.com/docs/integrations/neon

---

## ✅ Checklist Setup

- [ ] Akun Neon dibuat
- [ ] Project Neon dibuat
- [ ] Connection strings dicopy
- [ ] Prisma schema diupdate ke PostgreSQL
- [ ] Environment variables di-set (local & Vercel)
- [ ] Prisma client di-generate
- [ ] Schema di-push ke database
- [ ] Testing connection berhasil
- [ ] Vercel integration dengan Neon di-setup
- [ ] Deploy ke Vercel
- [ ] Testing di production environment

---

## 🆘 Dukungan

Jika mengalami masalah:
1. Cek Neon dashboard logs
2. Cek Vercel deployment logs
3. Review Prisma schema
4. Pastikan environment variables benar

---

**Selamat menggunakan Neon! 🚀**
