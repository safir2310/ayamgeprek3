import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

async function seedPointRedemptions() {
  try {
    // Get product IDs from database
    const products = await db.product.findMany({
      select: { id: true, name: true },
    })

    if (products.length === 0) {
      console.log('No products found. Please add products first.')
      return
    }

    console.log('Found products:', products.map(p => p.name))

    // Create point redemption options using available products
    const redemptions = [
      {
        id: randomUUID(),
        name: 'Minuman Gratis',
        description: 'Tukar 100 poin untuk minuman gratis',
        pointsRequired: 100,
        productId: products[0].id,
        productImage: '🧊',
        order: 1,
      },
      {
        id: randomUUID(),
        name: 'Makanan Gratis',
        description: 'Tukar 200 poin untuk makanan gratis',
        pointsRequired: 200,
        productId: products[Math.min(1, products.length - 1)].id,
        productImage: '🍗',
        order: 2,
      },
    ]

    // Check if redemptions already exist
    const existingRedemptions = await db.pointRedemption.findMany()

    if (existingRedemptions.length > 0) {
      console.log('Point redemptions already exist. Skipping seed.')
      console.log('Existing redemptions:', existingRedemptions.map(r => ({ id: r.id, name: r.name })))
      return
    }

    // Insert redemptions
    for (const redemption of redemptions) {
      await db.pointRedemption.create({
        data: redemption,
      })
    }

    console.log('✅ Point redemptions seeded successfully!')
    console.log('Created redemptions:', redemptions.map(r => ({ id: r.id, name: r.name })))
  } catch (error) {
    console.error('Error seeding point redemptions:', error)
  }
}

seedPointRedemptions()
