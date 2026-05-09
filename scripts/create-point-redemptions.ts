import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Read .env file directly
const envPath = path.join(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')

// Parse DATABASE_URL from .env file
const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)
const DATABASE_URL = databaseUrlMatch ? databaseUrlMatch[1] : ''

console.log('🔗 DATABASE_URL from .env:', DATABASE_URL ? 'Found' : 'NOT FOUND')
console.log('')

// Create PrismaClient with explicit database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function createPointRedemptions() {
  try {
    console.log('🎁 Creating Point Redemption Options...')
    console.log('================================')
    console.log('')

    // Check if products exist
    const products = await prisma.product.findMany({
      take: 5
    })

    if (products.length === 0) {
      console.log('⚠️  No products found. Please add products first.')
      await prisma.$disconnect()
      process.exit(1)
    }

    console.log(`📦 Found ${products.length} products`)
    console.log('')

    // Create point redemption options
    const redemptions = [
      {
        name: 'Minuman Gratis - Teh',
        description: 'Tukar 100 poin untuk minuman gratis (Teh)',
        pointsRequired: 100,
        productId: products[0]?.id,
        productImage: products[0]?.image || '🥤',
        active: true,
        order: 1,
      },
      {
        name: 'Minuman Gratis - Jus',
        description: 'Tukar 150 poin untuk minuman gratis (Jus)',
        pointsRequired: 150,
        productId: products[1]?.id || products[0]?.id,
        productImage: products[1]?.image || '🧉',
        active: true,
        order: 2,
      },
      {
        name: 'Makanan Gratis - Ayam Geprek',
        description: 'Tukar 200 poin untuk makanan gratis (Ayam Geprek)',
        pointsRequired: 200,
        productId: products[2]?.id || products[0]?.id,
        productImage: products[2]?.image || '🍗',
        active: true,
        order: 3,
      },
      {
        name: 'Snack Gratis',
        description: 'Tukar 50 poin untuk snack gratis',
        pointsRequired: 50,
        productId: products[3]?.id || products[0]?.id,
        productImage: products[3]?.image || '🍿',
        active: true,
        order: 4,
      },
    ]

    // Clear existing redemptions
    await prisma.pointRedemption.deleteMany({})
    console.log('🗑️  Cleared existing point redemptions')
    console.log('')

    // Create new redemptions
    for (const redemption of redemptions) {
      const created = await prisma.pointRedemption.create({
        data: redemption
      })
      console.log(`✅ Created: ${created.name} (${created.pointsRequired} poin)`)
    }

    console.log('')
    console.log('================================')
    console.log(`✅ Created ${redemptions.length} point redemption options`)
    console.log('================================')

    await prisma.$disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error creating point redemptions:', error.message)
    console.error('')
    if (error.stack) {
      console.error('Stack:', error.stack.substring(0, 500))
    }

    await prisma.$disconnect()
    process.exit(1)
  }
}

createPointRedemptions()
