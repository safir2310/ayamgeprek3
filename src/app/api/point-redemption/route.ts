import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch all active point redemption options
export async function GET(request: NextRequest) {
  try {
    // Simple response without database for now
    return NextResponse.json({
      redemptions: [
        {
          id: 'test1',
          name: 'Minuman Gratis',
          description: 'Tukar 100 poin untuk minuman gratis',
          pointsRequired: 100,
          productId: 'test-product-1',
          productImage: '🧊',
          active: true,
          order: 1,
          product: {
            id: 'test-product-1',
            name: 'Teh',
            price: 5000,
            image: null
          }
        },
        {
          id: 'test2',
          name: 'Makanan Gratis',
          description: 'Tukar 200 poin untuk makanan gratis',
          pointsRequired: 200,
          productId: 'test-product-2',
          productImage: '🍗',
          active: true,
          order: 2,
          product: {
            id: 'test-product-2',
            name: 'Ayam',
            price: 15000,
            image: null
          }
        }
      ]
    })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' })
  }
}

// POST - Redeem points for a voucher
export async function POST(request: NextRequest) {
  try {
    // TODO: Implement actual redemption logic when database is working
    // For now, return success with mock data
    return NextResponse.json({
      success: true,
      voucherCode: 'MOCK_VOUCHER_' + Date.now(),
      redemption: {
        id: 'mock-id',
        name: 'Mock Redemption',
        description: 'Mock redemption - database not connected yet',
        pointsUsed: 0,
        productName: 'Produk Gratis',
      },
    })
  } catch (error) {
    console.error('Error redeeming points:', error)
    return NextResponse.json(
      { error: 'Gagal menukar poin' },
      { status: 500 }
    )
  }
}
