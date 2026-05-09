# 🚀 Deployment Guide - Vercel + Neon PostgreSQL

This guide will help you deploy the Ayam Geprek Sambal Ijo application to Vercel with Neon PostgreSQL database.

## 📋 Prerequisites

- ✅ Node.js (v18 or higher) or Bun
- ✅ Vercel account (free)
- ✅ Neon account (free)
- ✅ GitHub account

## 🗄️ Step 1: Setup Neon PostgreSQL

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up or log in
3. Create a new project

### 1.2 Get Connection Strings
1. After creating project, you'll see connection strings
2. Copy the following:
   - **Pooled connection URL** (for app runtime)
   - **Direct connection URL** (for migrations)

Example:
```
Pooled: postgresql://user:pass@pooler.neon.tech/db?sslmode=require&channel_binding=require
Direct: postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
```

### 1.3 Update Local .env
Add/update your `.env` file:
```env
DATABASE_URL=postgresql://USER:PASS@HOST-POOLER.neon.tech/DATABASE?sslmode=require&channel_binding=require
DIRECT_URL=postgresql://USER:PASS@HOST.neon.tech/DATABASE?sslmode=require
```

## 🗄️ Step 2: Migrate Database to Neon

### 2.1 Update Prisma Schema (Already Done!)
The `prisma/schema.prisma` has been updated to use PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 2.2 Push Schema to Neon
```bash
# Install dependencies (if not already installed)
bun install

# Generate Prisma Client
bun run db:generate

# Push schema to Neon
bun run db:push

# Seed initial data
bun run db:seed
```

### 2.3 Verify Database
```bash
# Open Prisma Studio to view data
bun run db:studio
```

## 🗄️ Step 3: Deploy to Vercel

### 3.1 Push Code to GitHub (Already Done!)
Your project is already at: https://github.com/safir2310/ayamgepreksiap

### 3.2 Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub: `safir2310/ayamgepreksiap`
4. Configure project:

**Framework Preset:** Next.js
**Root Directory:** `./` (leave empty)
**Build Command:** `prisma generate && next build`
**Output Directory:** `.next/standalone`

### 3.3 Add Environment Variables

In Vercel project settings, add these environment variables:

#### Database Variables (CRITICAL)
```
DATABASE_URL = postgresql://USER:PASS@HOST-POOLER.neon.tech/DATABASE?sslmode=require&channel_binding=require
DIRECT_URL = postgresql://USER:PASS@HOST.neon.tech/DATABASE?sslmode=require
```

**Important:** Get these from your Neon dashboard!

#### App Variables (Optional)
```
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Access your app at the provided URL

## ✅ Verification

After deployment, verify:

### 1. Check Build Logs
- Go to Vercel Dashboard
- View deployment logs
- Ensure no errors

### 2. Test Database Connection
```bash
# From your local machine with production DATABASE_URL
DATABASE_URL="your-vercel-db-url" bun run db:studio
```

### 3. Test the App
- Access the deployed URL
- Try login with admin account:
  - Email: admin@ayamgeprek.com
  - Password: admin123
- Test all features:
  - ✅ Products listing
  - ✅ Shopping cart
  - ✅ Checkout
  - ✅ Admin panel
  - ✅ Point redemption

## 🔧 Troubleshooting

### Issue: Database Connection Failed
**Solution:**
1. Check `DATABASE_URL` and `DIRECT_URL` in Vercel
2. Verify URLs are correct from Neon dashboard
3. Ensure URLs include `?sslmode=require`

### Issue: Build Failed
**Solution:**
1. Check Vercel build logs
2. Ensure `prisma generate` runs before build
3. Verify all dependencies are installed

### Issue: Prisma Client Not Generated
**Solution:**
- The `postinstall` script should auto-generate Prisma Client
- If fails, add to build command: `prisma generate`

### Issue: Migration Failed
**Solution:**
1. Use `DIRECT_URL` for migrations
2. Run `bun run db:push` locally first
3. Check schema for PostgreSQL compatibility

## 📝 Important Notes

### Database Persistence
- Neon automatically hibernates after inactivity (5 min)
- First request after hibernation may be slow (~500ms)
- This is normal for Neon's free tier

### Connection Pooling
- Use `DATABASE_URL` (pooled) for app requests
- Use `DIRECT_URL` (unpooled) for migrations only
- Never mix them up!

### Environment Variables
- Never commit `.env` to GitHub
- Use `.env.example` as reference
- Add all env vars to Vercel project settings

### Production vs Development
- Local development: Use SQLite or separate Neon database
- Production: Use dedicated Neon database
- Always test migrations before deploying

## 🎯 Quick Deploy Commands

```bash
# 1. Test locally with Neon
bun run db:push
bun run db:seed

# 2. Build for production
bun run build

# 3. Deploy (via Vercel CLI - optional)
npm i -g vercel
vercel
```

## 📞 Support

If you encounter issues:

1. **Vercel Logs:** Check deployment logs in Vercel dashboard
2. **Neon Console:** Monitor database queries at neon.tech
3. **Prisma Studio:** Use `bun run db:studio` to inspect data

---

**Happy Deploying! 🚀**

Your app will be available at: `https://ayamgepreksiap.vercel.app`
