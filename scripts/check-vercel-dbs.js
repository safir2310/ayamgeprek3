#!/usr/bin/env node

/**
 * Script untuk mengecek database yang ada di Vercel dan mengambil connection strings
 * Menggunakan Vercel Token untuk autentikasi
 *
 * Usage: VERCEL_TOKEN=your_token node scripts/check-vercel-dbs.js
 */

const { execSync } = require('child_process');

// Ambil token dari environment variable
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

if (!VERCEL_TOKEN || VERCEL_TOKEN === 'YOUR_VERCEL_TOKEN_HERE') {
  console.log('❌ Vercel Token tidak di-set!');
  console.log('');
  console.log('📝 Cara penggunaan:');
  console.log('   VERCEL_TOKEN=your_token node scripts/check-vercel-dbs.js');
  console.log('');
  console.log('🌐 Cara mendapatkan token:');
  console.log('   1. Buka: https://vercel.com/account/tokens');
  console.log('   2. Create new token');
  console.log('   3. Copy token');
  console.log('');
  process.exit(1);
}

function runCommand(cmd, options = {}) {
  try {
    console.log(`🔧 Running: ${cmd.split(' ')[0]}`);
    const result = execSync(cmd, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });
    return result;
  } catch (error) {
    console.error(`❌ Error running command: ${cmd}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔍 Checking Vercel Postgres Databases...');
    console.log('');

    // Set environment variable untuk Vercel CLI
    process.env.VERCEL_TOKEN = VERCEL_TOKEN;

    // List databases (jika command ada)
    console.log('📋 Listing available Vercel Postgres databases...');
    console.log('');

    try {
      const result = runCommand('vercel storage ls', {
        env: { ...process.env }
      });

      console.log(result.stdout);
      console.log('');
      console.log('✅ Vercel connection verified');
      console.log('');
      console.log('📝 NOTE:');
      console.log('   Vercel CLI tidak memiliki perintah untuk membuat Postgres database.');
      console.log('   Database harus dibuat melalui Vercel Dashboard.');
      console.log('');
      console.log('🌐 Buka Vercel Dashboard:');
      console.log('   https://vercel.com/dashboard');
      console.log('');
      console.log('📝 Langkah-langkah:');
      console.log('   1. Buka Vercel Dashboard');
      console.log('   2. Pilih project → Storage → Postgres');
      console.log('   3. Klik "Create Database"');
      console.log('   4. Copy connection string dari tab "Connection Details"');
      console.log('   5. Jalankan: node scripts/vercel-env-helper.js <CONNECTION_STRING>');
      console.log('');

    } catch (error) {
      console.log('⚠️  Storage list command may not be available');
      console.log('   This is expected - database creation is manual in Vercel');
      console.log('');
    }

    console.log('╔════════════════════════════════════════════════╗');
    console.log('║     📘 DATABASE CREATION GUIDE FOR VERCEL           ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log('📖 Lihat panduan lengkap: VERCEL-POSTGRES-GUIDE.md');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error checking Vercel databases');
    console.error('');
    console.error('💡 Tips:');
    console.error('   1. Make sure Vercel token is valid');
    console.error('   2. Check if you have Vercel account');
    console.error('   3. Manually create database in Vercel Dashboard');
    console.error('   4. Connection strings are available in dashboard');
    console.error('');
    process.exit(1);
  }
}

main();
