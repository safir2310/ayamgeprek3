import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Point redemption API working',
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { redemptionId } = body

    const redemption = {
      id: redemptionId,
      name: redemptionId === 'test1' ? 'Minuman Gratis' : 'Makanan Gratis',
      description: redemptionId === 'test1' ? 'Tukar 100 poin' : 'Tukar 200 poin',
      pointsUsed: redemptionId === 'test1' ? 100 : 200,
      productName: redemptionId === 'test1' ? 'Teh' : 'Ayam'
    }

    const voucherCode = `POINT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    return NextResponse.json({
      success: true,
      voucherCode: voucherCode,
      redemption: redemption
    })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json(
      { error: 'Gagal menukar poin', details: String(error) },
      { status: 500 }
    )
  }
}
