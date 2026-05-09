import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch all active point redemption options
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/point-redemption - Starting...')

    // Return mock data for now to avoid database hanging
    const redemptions = [
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

    console.log('GET /api/point-redemption - Returning data')
    return NextResponse.json({ redemptions })
  } catch (error) {
    console.error('Failed to fetch point redemptions:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

// Generate unique voucher code
function generateVoucherCode(): string {
  const prefix = 'POINT'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// POST - Redeem points for a voucher (mock version)
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/point-redemption - Starting...')

    const body = await request.json()
    const { redemptionId } = body

    console.log('POST /api/point-redemption - redemptionId:', redemptionId)

    if (!redemptionId) {
      return NextResponse.json(
        { error: 'ID penukaran tidak valid' },
        { status: 400 }
      )
    }

    // Mock redemption details
    const redemption = {
      id: redemptionId,
      name: redemptionId === 'test1' ? 'Minuman Gratis' : 'Makanan Gratis',
      description: redemptionId === 'test1' ? 'Tukar 100 poin' : 'Tukar 200 poin',
      pointsUsed: redemptionId === 'test1' ? 100 : 200,
      productName: redemptionId === 'test1' ? 'Teh' : 'Ayam'
    }

    // Generate voucher code
    const voucherCode = generateVoucherCode()

    console.log('POST /api/point-redemption - Success, voucher:', voucherCode)

    // TODO: Add actual database integration when database issue is resolved
    // - Verify JWT token
    // - Check user points
    // - Deduct points
    // - Create point voucher
    // - Create point history

    return NextResponse.json({
      success: true,
      voucherCode: voucherCode,
      redemption: redemption
    })
  } catch (error) {
    console.error('Error redeeming points:', error)
    return NextResponse.json(
      { error: 'Gagal menukar poin' },
      { status: 500 }
    )
  }
}
