import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Get products
    const products = await db.product.findMany({
      select: { id: true, name: true },
    })

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products found. Please add products first.' },
        { status: 400 }
      )
    }

    // Define point redemption options
    const redemptions = [
      {
        id: 'prd1',
        name: 'Es Teh Manis Gratis',
        description: 'Tukar 100 poin untuk Es Teh Manis gratis',
        pointsRequired: 100,
        productId: products.find((p) => p.name.includes('Es Teh Manis'))?.id || products[0].id,
        productImage: '🧊',
        order: 1,
      },
      {
        id: 'prd2',
        name: 'Keripik Singkong Gratis',
        description: 'Tukar 200 poin untuk Keripik Singkong gratis',
        pointsRequired: 200,
        productId: products.find((p) => p.name.includes('Keripik Singkong'))?.id || products[1].id,
        productImage: '🍠',
        order: 2,
      },
      {
        id: 'prd3',
        name: 'Sambal Ijo Botol Gratis',
        description: 'Tukar 500 poin untuk Sambal Ijo Botol gratis',
        pointsRequired: 500,
        productId: products.find((p) => p.name.includes('Sambal Ijo'))?.id || products[2].id,
        productImage: '🌶️',
        order: 3,
      },
      {
        id: 'prd4',
        name: 'Ayam Geprek Original Gratis',
        description: 'Tukar 1000 poin untuk Ayam Geprek Original gratis',
        pointsRequired: 1000,
        productId: products.find((p) => p.name.includes('Ayam Geprek Original'))?.id || products[3].id,
        productImage: '🍗',
        order: 4,
      },
    ]

    // Insert or update redemptions
    const results = []
    for (const redemption of redemptions) {
      const result = await db.pointRedemption.upsert({
        where: { id: redemption.id },
        create: redemption,
        update: redemption,
      })
      results.push(result)
    }

    return NextResponse.json({
      success: true,
      message: 'Point redemptions seeded successfully!',
      count: results.length,
    })
  } catch (error) {
    console.error('Error seeding point redemptions:', error)
    return NextResponse.json(
      { error: 'Failed to seed point redemptions' },
      { status: 500 }
    )
  }
}
