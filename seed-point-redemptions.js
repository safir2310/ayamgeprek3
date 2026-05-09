const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedPointRedemptions() {
  try {
    console.log('🌱 Seeding point redemptions...')

    // Get products
    const products = await prisma.product.findMany({
      select: { id: true, name: true, image: true, price: true },
    })

    console.log(`Found ${products.length} products`)

    if (products.length === 0) {
      console.log('❌ No products found. Please add products first.')
      return
    }

    // Helper function to get product by name or fallback
    const getProduct = (nameKeyword, fallbackIndex) => {
      const product = products.find((p) => p.name.includes(nameKeyword))
      return product || products[Math.min(fallbackIndex, products.length - 1)]
    }

    // Define point redemption options
    const redemptions = [
      {
        id: 'prd1',
        name: 'Es Teh Manis Gratis',
        description: 'Tukar 100 poin untuk Es Teh Manis gratis',
        pointsRequired: 100,
        productId: getProduct('Es Teh', 0).id,
        productImage: '🧊',
        order: 1,
      },
      {
        id: 'prd2',
        name: 'Keripik Singkong Gratis',
        description: 'Tukar 200 poin untuk Keripik Singkong gratis',
        pointsRequired: 200,
        productId: getProduct('Keripik', Math.min(1, products.length - 1)).id,
        productImage: '🍠',
        order: 2,
      },
      {
        id: 'prd3',
        name: 'Sambal Ijo Botol Gratis',
        description: 'Tukar 500 poin untuk Sambal Ijo Botol gratis',
        pointsRequired: 500,
        productId: getProduct('Sambal', Math.min(1, products.length - 1)).id,
        productImage: '🌶️',
        order: 3,
      },
      {
        id: 'prd4',
        name: 'Ayam Geprek Original Gratis',
        description: 'Tukar 1000 poin untuk Ayam Geprek Original gratis',
        pointsRequired: 1000,
        productId: getProduct('Ayam', Math.min(0, products.length - 1)).id,
        productImage: '🍗',
        order: 4,
      },
    ]

    // Insert or update redemptions
    for (const redemption of redemptions) {
      await prisma.pointRedemption.upsert({
        where: { id: redemption.id },
        create: redemption,
        update: redemption,
      })
      console.log(`✅ Created/updated: ${redemption.name}`)
    }

    console.log('✅ Point redemptions seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding point redemptions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPointRedemptions()
