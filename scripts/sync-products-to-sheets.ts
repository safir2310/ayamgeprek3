import { PrismaClient } from '@prisma/client'
import { initializeProductSheet, syncProductToSheet } from '../src/lib/google-sheets'

const prisma = new PrismaClient()

async function syncProducts() {
  console.log('🚀 Starting product sync to Google Sheets...')

  try {
    // Initialize product sheet
    console.log('📋 Initializing product sheet...')
    await initializeProductSheet()
    console.log('✅ Product sheet initialized')

    // Get all products from database
    console.log('📦 Fetching products from database...')
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    })

    console.log(`Found ${products.length} products in database`)

    // Sync each product to Google Sheets
    let syncedCount = 0
    for (const product of products) {
      try {
        await syncProductToSheet({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice,
          stock: product.stock,
          barcode: product.barcode,
          image: product.image,
          category: product.category,
          featured: product.featured,
          soldCount: product.soldCount,
          rating: product.rating,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        })
        syncedCount++
        console.log(`✅ Synced: ${product.name}`)
      } catch (error) {
        console.error(`❌ Failed to sync product ${product.name}:`, error)
      }
    }

    console.log(`\n✨ Sync complete! ${syncedCount}/${products.length} products synced to Google Sheets`)
    console.log('\n📊 Check your Google spreadsheet to see the synced products')
  } catch (error) {
    console.error('❌ Error syncing products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync
syncProducts()
