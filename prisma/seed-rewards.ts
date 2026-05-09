import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function seedRewards() {
  console.log('Seeding reward products...')

  // Check if category exists
  const category = await prisma.category.findFirst({
    where: { name: 'Reward' }
  })

  let categoryId: string
  if (!category) {
    const newCategory = await prisma.category.create({
      data: {
        id: uuidv4(),
        name: 'Reward',
        slug: 'reward',
        description: 'Produk yang bisa ditukar dengan poin',
        order: 999,
      }
    })
    categoryId = newCategory.id
    console.log('Created Reward category')
  } else {
    categoryId = category.id
  }

  // Sample reward products
  const rewards = [
    {
      name: 'Ayam Geprek Gratis (Porsi Kecil)',
      description: 'Ayam geprek porsi kecil dengan sambal ijo',
      price: 15000,
      pointsRequired: 150,
      image: null,
    },
    {
      name: 'Ayam Geprek Gratis (Pori Sedang)',
      description: 'Ayam geprek porsi sedang dengan sambal ijo',
      price: 20000,
      pointsRequired: 200,
      image: null,
    },
    {
      name: 'Ayam Geprek Gratis (Porsi Besar)',
      description: 'Ayam geprek porsi besar dengan sambal ijo',
      price: 25000,
      pointsRequired: 250,
      image: null,
    },
    {
      name: 'Minuman Es Teh Manis',
      description: 'Es teh manis dingin segar',
      price: 5000,
      pointsRequired: 50,
      image: null,
    },
    {
      name: 'Diskon Rp 50.000',
      description: 'Voucher diskon Rp 50.000 untuk semua menu',
      price: 50000,
      pointsRequired: 500,
      image: null,
    },
    {
      name: 'Diskon Rp 100.000',
      description: 'Voucher diskon Rp 100.000 untuk semua menu',
      price: 100000,
      pointsRequired: 1000,
      image: null,
    },
  ]

  for (const reward of rewards) {
    const existing = await prisma.product.findFirst({
      where: { name: reward.name }
    })

    if (!existing) {
      await prisma.product.create({
        data: {
          id: uuidv4(),
          name: reward.name,
          slug: reward.name.toLowerCase().replace(/\s+/g, '-'),
          description: reward.description,
          price: reward.price,
          pointsRequired: reward.pointsRequired,
          categoryId,
          image: reward.image,
          stock: 999,
          featured: true,
        },
      })
      console.log(`Created reward: ${reward.name}`)
    } else {
      console.log(`Reward already exists: ${reward.name}`)
    }
  }

  console.log('Reward seeding completed!')
}

seedRewards()
  .catch((error) => {
    console.error('Error seeding rewards:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
