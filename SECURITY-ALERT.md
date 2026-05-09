# 🚨 SECURITY ALERT - Database Password Compromised

## ⚠️ CRITICAL: Password Database Neon Telah Ter-expose

Password database Neon Anda `npg_PnluQm7EjL9p` telah di-expose secara **PUBLIC** di GitHub repository.

### Apa yang Terjadi:
- File `.env` yang berisi kredensial database telah di-commit ke git
- Password dapat dilihat oleh siapa saja di:
  - https://github.com/safir2310/ayamgepreksiap

### Risiko Keamanan:
1. ❌ Database dapat diakses oleh pihak tidak berwenang
2. ❌ Data user dapat diubah/dihapus
3. ❌ Data pesanan dapat dimanipulasi
4. ❌ Sistem dapat disabotase
5. ❌ Kerugian finansial dan reputasi

---

## 🚨 TINDAKAN YANG PERLU DILAKU SEKARANG!

### 1. Rotate Password Neon Database (MANDATORY!)

#### Langkah-langkah:
1. Buka [Neon Dashboard](https://console.neon.tech)
2. Pilih project Anda
3. Klik "Settings" → "Database Password"
4. Klik "Rotate password"
5. **SIMPAN password baru** di tempat aman

### 2. Update Local .env

Setelah rotate password, update `.env` Anda:

```env
# Ganti PASSWORD baru di sini
DATABASE_URL=postgresql://neondb_owner:PASSWORD_BARU@ep-dawn-paper-aodygj25-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DIRECT_URL=postgresql://neondb_owner:PASSWORD_BARU@ep-dawn-paper-aodygj25.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Update Environment Variables di Vercel

**SANGAT PENTING:** Jangan gunakan password lama di production!

Tambahkan environment variables baru di Vercel:
1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project Anda
3. Settings → Environment Variables
4. Update/Add:
   - `DATABASE_URL` dengan password baru
   - `DIRECT_URL` dengan password baru
5. Re-deploy aplikasi

### 4. Clear Git History (Optional tapi Recommended)

Untuk menghapus password dari git history:

```bash
# Hapus commit yang berisi .env
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env"

# Force push (hati-hati: akan rewrite history!)
git push origin --force --all
```

⚠️ **PERINGATAN:** Ini akan **REWRITE SELURUH git history**. Lakukan hanya jika Anda yakin.

---

## ✅ Checklist Keamanan

Sebelum deploy ke production, pastikan:

- [ ] Password Neon sudah di-rotate
- [ ] .env tidak di-commit ke GitHub
- [ ] `.env*` ada di `.gitignore`
- [ ] Environment variables di-set di Vercel
- [ ] Password di .env != password di git history
- [ ] Aplikasi sudah di-test dengan password baru

---

## 🔐 Best Practices untuk Production

### 1. JANGAN pernah commit .env
```gitignore
# .gitignore
.env
.env.local
.env.production
.env.development
```

### 2. Gunakan Environment Variables
- **Development:** .env file (local)
- **Production:** Vercel environment variables
- **Staging:** Separate environment variables

### 3. Separated Database per Environment
- Development: Neon project terpisah
- Production: Neon project terpisah
- Jangan gunakan database sama untuk dev dan prod

### 4. Regular Security Audits
- Rotate password setiap 3-6 bulan
- Monitor database access logs di Neon dashboard
- Review git history untuk kredensial yang ter-expose

### 5. Use Secret Management
- Vercel Environment Variables untuk production
- GitHub Secrets untuk CI/CD
- Jangan hard-code credentials

---

## 📞 Bantuan

Jika Anda butuh bantuan:

1. **Neon Support:** https://neon.tech/support
2. **Vercel Support:** https://vercel.com/support
3. **GitHub Security:** https://github.com/security

---

## 🎯 Rekomendasi Terkini

**PENTING:** Lakukan hal ini SEKARANG sebelum deploy production:

1. ✅ Rotate password Neon database
2. ✅ Update .env local
3. ✅ Update Vercel environment variables
4. ✅ Test aplikasi dengan password baru
5. ✅ Hapus/clear git history yang berisi password lama
6. ✅ Deploy ke Vercel
7. ✅ Verifikasi aplikasi berjalan dengan password baru

**KEAMANAN ADALAH PRIORITAS!**

---

*Dokumen ini dibuat: $(date)*
*Project: Ayam Geprek Sambal Ijo*
*Status: ⚠️ Security Alert*
