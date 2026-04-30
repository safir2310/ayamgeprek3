import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories first
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'makanan' },
      update: {},
      create: {
        name: 'Makanan',
        slug: 'makanan',
        description: 'Berbagai menu makanan lezat',
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
        description: 'Minuman segar dan menyegarkan',
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
        description: 'Camilan renyah dan enak',
        icon: '🍿',
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'bumbu' },
      update: {},
      create: {
        name: 'Bumbu',
        slug: 'bumbu',
        description: 'Bumbu dapur siap pakai',
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
        description: 'Kebutuhan rumah tangga',
        icon: '🏠',
        order: 5,
      },
    }),
  ])

  // Get category IDs
  const makananCategory = categories.find(c => c.slug === 'makanan')!
  const minumanCategory = categories.find(c => c.slug === 'minuman')!
  const snackCategory = categories.find(c => c.slug === 'snack')!
  const bumbuCategory = categories.find(c => c.slug === 'bumbu')!
  const kebutuhanRumahCategory = categories.find(c => c.slug === 'kebutuhan-rumah')!

  // Create or update products
  const products = [
    {
      id: '1',
      name: 'Ayam Geprek Original',
      slug: 'ayam-geprek-original',
      description: 'Ayam geprek dengan sambal ijo asli',
      price: 15000,
      categoryId: makananCategory.id,
      image: '🍗',
      barcode: 'AG001',
      stock: 50,
    },
    {
      id: '2',
      name: 'Ayam Geprek Keju',
      slug: 'ayam-geprek-keju',
      description: 'Ayam geprek dengan topping keju melimpah',
      price: 18000,
      discountPrice: 15000,
      discountPercent: 17,
      categoryId: makananCategory.id,
      image: '🧀',
      barcode: 'AG002',
      stock: 30,
    },
    {
      id: '3',
      name: 'Nasi Pecel Ayam',
      slug: 'nasi-pecel-ayam',
      description: 'Nasi pecel dengan ayam goreng',
      price: 20000,
      categoryId: makananCategory.id,
      image: '🍛',
      barcode: 'NP001',
      stock: 40,
    },
    {
      id: '4',
      name: 'Es Teh Manis',
      slug: 'es-teh-manis',
      description: 'Es teh manis segar',
      price: 5000,
      categoryId: minumanCategory.id,
      image: '🧊',
      barcode: 'ET001',
      stock: 100,
    },
    {
      id: '5',
      name: 'Es Jeruk Peras',
      slug: 'es-jeruk-peras',
      description: 'Es jeruk peras murni',
      price: 8000,
      categoryId: minumanCategory.id,
      image: '🍊',
      barcode: 'EJ001',
      stock: 80,
    },
    {
      id: '6',
      name: 'Kopi Susu Gula Aren',
      slug: 'kopi-susu-gula-aren',
      description: 'Kopi susu dengan gula aren asli',
      price: 12000,
      categoryId: minumanCategory.id,
      image: '☕',
      barcode: 'KS001',
      stock: 60,
    },
    {
      id: '7',
      name: 'Keripik Singkong',
      slug: 'keripik-singkong',
      description: 'Keripik singkong renyah',
      price: 10000,
      categoryId: snackCategory.id,
      image: '🍠',
      barcode: 'KS002',
      stock: 50,
    },
    {
      id: '8',
      name: 'Kerupuk Udang',
      slug: 'kerupuk-udang',
      description: 'Kerupuk udang gurih',
      price: 12000,
      discountPrice: 10000,
      discountPercent: 17,
      categoryId: snackCategory.id,
      image: '🦐',
      barcode: 'KU001',
      stock: 40,
    },
    {
      id: '9',
      name: 'Sambal Ijo Botol',
      slug: 'sambal-ijo-botol',
      description: 'Sambal ijo siap pakai dalam botol',
      price: 25000,
      categoryId: bumbuCategory.id,
      image: '🌶️',
      barcode: 'SI001',
      stock: 30,
    },
    {
      id: '10',
      name: 'Sambal Merah',
      slug: 'sambal-merah',
      description: 'Sambal merah pedas nendang',
      price: 20000,
      categoryId: bumbuCategory.id,
      image: '🔴',
      barcode: 'SM001',
      stock: 35,
    },
    {
      id: '11',
      name: 'Minyak Goreng 2L',
      slug: 'minyak-goreng-2l',
      description: 'Minyak goreng 2 liter',
      price: 35000,
      discountPrice: 30000,
      discountPercent: 14,
      categoryId: kebutuhanRumahCategory.id,
      image: '🫗',
      barcode: 'MG001',
      stock: 25,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        discountPercent: product.discountPercent,
        categoryId: product.categoryId,
        image: product.image,
        stock: product.stock,
      },
      create: product,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
