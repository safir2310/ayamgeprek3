import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ayamgeprek.com' },
    update: {},
    create: {
      email: 'admin@ayamgeprek.com',
      name: 'Admin Toko',
      phone: '085260812758',
      password: hashedPassword,
      role: 'admin',
      memberLevel: 'Platinum',
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'customer@gmail.com' },
    update: {},
    create: {
      email: 'customer@gmail.com',
      name: 'Pelanggan Setia',
      phone: '081234567890',
      password: userPassword,
      role: 'customer',
      memberLevel: 'Gold',
      points: 500,
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'makanan' },
      update: {},
      create: {
        name: 'Makanan',
        slug: 'makanan',
        icon: '🍽️',
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'minuman' },
      update: {},
      create: {
        name: 'Minuman',
        slug: 'minuman',
        icon: '🥤',
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'snack' },
      update: {},
      create: {
        name: 'Snack',
        slug: 'snack',
        icon: '🍿',
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'bumbu' },
      update: {},
      create: {
        name: 'Bumbu & Sambal',
        slug: 'bumbu',
        icon: '🌶️',
        order: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'kebutuhan-rumah' },
      update: {},
      create: {
        name: 'Kebutuhan Rumah',
        slug: 'kebutuhan-rumah',
        icon: '🏠',
        order: 5,
      },
    }),
  ])

  // Create products
  const products = [
    {
      name: 'Ayam Geprek Original',
      slug: 'ayam-geprek-original',
      description: 'Ayam geprek crispy dengan sambal ijo pedas mantap',
      price: 15000,
      categoryId: categories[0].id,
      stock: 50,
      barcode: 'AG001',
      featured: true,
    },
    {
      name: 'Ayam Geprek Keju',
      slug: 'ayam-geprek-keju',
      description: 'Ayam geprek dengan topping keju lumer',
      price: 18000,
      discountPrice: 15000,
      discountPercent: 17,
      categoryId: categories[0].id,
      stock: 30,
      barcode: 'AG002',
      featured: true,
    },
    {
      name: 'Nasi Pecel Ayam',
      slug: 'nasi-pecel-ayam',
      description: 'Nasi pecel dengan ayam goreng dan sayuran segar',
      price: 20000,
      categoryId: categories[0].id,
      stock: 40,
      barcode: 'NP001',
      featured: true,
    },
    {
      name: 'Es Teh Manis',
      slug: 'es-teh-manis',
      description: 'Es teh manis segar dingin',
      price: 5000,
      categoryId: categories[1].id,
      stock: 100,
      barcode: 'ET001',
    },
    {
      name: 'Es Jeruk Peras',
      slug: 'es-jeruk-peras',
      description: 'Es jeruk peras asli segar',
      price: 8000,
      categoryId: categories[1].id,
      stock: 80,
      barcode: 'EJ001',
    },
    {
      name: 'Kopi Susu Gula Aren',
      slug: 'kopi-susu-gula-aren',
      description: 'Kopi susu dengan gula aren asli',
      price: 12000,
      categoryId: categories[1].id,
      stock: 60,
      barcode: 'KS001',
    },
    {
      name: 'Keripik Singkong',
      slug: 'keripik-singkong',
      description: 'Keripik singkong renyah pedas',
      price: 10000,
      categoryId: categories[2].id,
      stock: 50,
      barcode: 'KS002',
    },
    {
      name: 'Kerupuk Udang',
      slug: 'kerupuk-udang',
      description: 'Kerupuk udang gurih renyah',
      price: 12000,
      discountPrice: 10000,
      discountPercent: 17,
      categoryId: categories[2].id,
      stock: 40,
      barcode: 'KU001',
    },
    {
      name: 'Sambal Ijo Botol',
      slug: 'sambal-ijo-botol',
      description: 'Sambal ijo pedas dalam botol 250ml',
      price: 25000,
      categoryId: categories[3].id,
      stock: 30,
      barcode: 'SI001',
      featured: true,
    },
    {
      name: 'Sambal Merah',
      slug: 'sambal-merah',
      description: 'Sambal merah pedas nampol',
      price: 20000,
      categoryId: categories[3].id,
      stock: 35,
      barcode: 'SM001',
    },
    {
      name: 'Bumbu Rendang',
      slug: 'bumbu-rendang',
      description: 'Bumbu rendang instan siap masak',
      price: 8000,
      categoryId: categories[3].id,
      stock: 60,
      barcode: 'BR001',
    },
    {
      name: 'Minyak Goreng 2L',
      slug: 'minyak-goreng-2l',
      description: 'Minyak goreng 2 liter',
      price: 35000,
      discountPrice: 30000,
      discountPercent: 14,
      categoryId: categories[4].id,
      stock: 25,
      barcode: 'MG001',
      featured: true,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }

  // Create vouchers
  const vouchers = [
    {
      code: 'DISKON10',
      name: 'Diskon 10%',
      description: 'Diskon 10% untuk semua produk',
      discountType: 'percentage',
      discountValue: 10,
      minPurchase: 50000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      usageLimit: 1000,
    },
    {
      code: 'HEMAT20K',
      name: 'Hemat Rp 20.000',
      description: 'Diskon Rp 20.000 dengan minimum belanja Rp 100.000',
      discountType: 'fixed',
      discountValue: 20000,
      minPurchase: 100000,
      maxDiscount: 20000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      usageLimit: 500,
    },
    {
      code: 'NEWUSER',
      name: 'Diskon New User',
      description: 'Diskon Rp 15.000 untuk user baru',
      discountType: 'fixed',
      discountValue: 15000,
      minPurchase: 30000,
      maxDiscount: 15000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      usageLimit: 100,
    },
  ]

  for (const voucher of vouchers) {
    await prisma.voucher.upsert({
      where: { code: voucher.code },
      update: {},
      create: voucher,
    })
  }

  console.log('Database seeded successfully!')
  console.log('Admin credentials:')
  console.log('Email: admin@ayamgeprek.com')
  console.log('Password: admin123')
  console.log('\nUser credentials:')
  console.log('Email: customer@gmail.com')
  console.log('Password: user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
