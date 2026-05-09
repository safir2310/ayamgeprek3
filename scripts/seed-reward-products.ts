import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed reward products...')

  // Get categories
  const makananCategory = await prisma.category.findUnique({
    where: { slug: 'makanan' },
  })
  const minumanCategory = await prisma.category.findUnique({
    where: { slug: 'minuman' },
  })
  const bumbuCategory = await prisma.category.findUnique({
    where: { slug: 'bumbu' },
  })

  if (!makananCategory || !minumanCategory || !bumbuCategory) {
    throw new Error('Categories not found. Please run the main seed script first.')
  }

  // Define reward products with 0 price (free items for point redemption)
  const rewardProducts = [
    {
      name: 'Ayam Geprek Sambal Ijo (Reward)',
      slug: 'reward-ayam-geprek-sambal-ijo',
      description: 'Gratis 1x Ayam Geprek dengan Sambal Ijo - Redeem dengan 1000 Poin',
      price: 0,
      stock: 1000,
      barcode: 'REWARD-AG-SI-1000',
      image: '🍗',
      categoryId: makananCategory.id,
      featured: false,
    },
    {
      name: 'Es Teh Manis (Reward)',
      slug: 'reward-es-teh-manis',
      description: 'Gratis 1x Es Teh Manis - Redeem dengan 500 Poin',
      price: 0,
      stock: 1000,
      barcode: 'REWARD-ETM-500',
      image: '🧊',
      categoryId: minumanCategory.id,
      featured: false,
    },
    {
      name: 'Sambal Ijo Botol (Reward)',
      slug: 'reward-sambal-ijo-botol',
      description: 'Gratis 1x Sambal Ijo Botol - Redeem dengan 1500 Poin',
      price: 0,
      stock: 1000,
      barcode: 'REWARD-SIB-1500',
      image: '🌶️',
      categoryId: bumbuCategory.id,
      featured: false,
    },
    {
      name: 'Nasi Pecel Ayam (Reward)',
      slug: 'reward-nasi-pecel-ayam',
      description: 'Gratis 1x Nasi Pecel Ayam - Redeem dengan 2000 Poin',
      price: 0,
      stock: 1000,
      barcode: 'REWARD-NPA-2000',
      image: '🍛',
      categoryId: makananCategory.id,
      featured: false,
    },
  ]

  console.log('Creating reward products...')
  const createdProducts = []

  for (const product of rewardProducts) {
    const existingProduct = await prisma.product.findUnique({
      where: { barcode: product.barcode },
    })

    if (existingProduct) {
      console.log(`Product ${product.name} already exists, skipping...`)
      createdProducts.push(existingProduct)
    } else {
      const newProduct = await prisma.product.create({
        data: product,
      })
      console.log(`✓ Created product: ${newProduct.name} (ID: ${newProduct.id})`)
      createdProducts.push(newProduct)
    }
  }

  console.log('\nReward products seeded successfully!')
  console.log('\nCreated/Found products:')
  console.log('================================')
  console.log('1. Ayam Geprek Sambal Ijo - 1000 Points')
  console.log(`   Product ID: ${createdProducts[0].id}`)
  console.log(`   Barcode: ${createdProducts[0].barcode}`)
  console.log('\n2. Es Teh Manis - 500 Points')
  console.log(`   Product ID: ${createdProducts[1].id}`)
  console.log(`   Barcode: ${createdProducts[1].barcode}`)
  console.log('\n3. Sambal Ijo Botol - 1500 Points')
  console.log(`   Product ID: ${createdProducts[2].id}`)
  console.log(`   Barcode: ${createdProducts[2].barcode}`)
  console.log('\n4. Nasi Pecel Ayam - 2000 Points')
  console.log(`   Product ID: ${createdProducts[3].id}`)
  console.log(`   Barcode: ${createdProducts[3].barcode}`)
  console.log('\n================================')

  // Return product IDs for reference
  return {
    reward_ayam_geprek: createdProducts[0].id,
    reward_es_teh: createdProducts[1].id,
    reward_sambal_ijo: createdProducts[2].id,
    reward_nasi_pecel: createdProducts[3].id,
  }
}

main()
  .catch((e) => {
    console.error('Error seeding reward products:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
