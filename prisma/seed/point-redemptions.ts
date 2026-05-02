import { db } from '@/lib/db'

async function seedPointRedemptions() {
  try {
    // Get product IDs from mock products
    const products = await db.product.findMany({
      select: { id: true, name: true },
    })

    if (products.length === 0) {
      console.log('No products found. Please add products first.')
      return
    }

    // Create point redemption options
    const redemptions = [
      {
        name: 'Es Teh Manis Gratis',
        description: 'Tukar 100 poin untuk Es Teh Manis gratis',
        pointsRequired: 100,
        productId: products.find((p) => p.name.includes('Es Teh Manis'))?.id || products[0].id,
        productImage: '🧊',
        order: 1,
      },
      {
        name: 'Keripik Singkong Gratis',
        description: 'Tukar 200 poin untuk Keripik Singkong gratis',
        pointsRequired: 200,
        productId: products.find((p) => p.name.includes('Keripik Singkong'))?.id || products[1].id,
        productImage: '🍠',
        order: 2,
      },
      {
        name: 'Sambal Ijo Botol Gratis',
        description: 'Tukar 500 poin untuk Sambal Ijo Botol gratis',
        pointsRequired: 500,
        productId: products.find((p) => p.name.includes('Sambal Ijo'))?.id || products[2].id,
        productImage: '🌶️',
        order: 3,
      },
      {
        name: 'Ayam Geprek Original Gratis',
        description: 'Tukar 1000 poin untuk Ayam Geprek Original gratis',
        pointsRequired: 1000,
        productId: products.find((p) => p.name.includes('Ayam Geprek Original'))?.id || products[3].id,
        productImage: '🍗',
        order: 4,
      },
    ]

    // Insert or update redemptions
    for (const redemption of redemptions) {
      await db.pointRedemption.upsert({
        where: { id: redemption.name },
        create: {
          ...redemption,
          id: redemption.name, // Using name as ID for simplicity
        },
        update: redemption,
      })
    }

    console.log('✅ Point redemptions seeded successfully!')
  } catch (error) {
    console.error('Error seeding point redemptions:', error)
  }
}

seedPointRedemptions()
