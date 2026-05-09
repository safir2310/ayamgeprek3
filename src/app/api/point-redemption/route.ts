import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Fetch all active point redemption options
export async function GET(request: NextRequest) {
  try {
    const redemptions = await db.pointRedemption.findMany({
      where: { active: true },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

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

// POST - Redeem points for a voucher
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }

    // Get user with current points
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        points: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { redemptionId } = body

    if (!redemptionId) {
      return NextResponse.json(
        { error: 'ID penukaran tidak valid' },
        { status: 400 }
      )
    }

    // Get point redemption details
    const redemption = await db.pointRedemption.findUnique({
      where: { id: redemptionId },
      include: {
        product: true
      }
    })

    if (!redemption) {
      return NextResponse.json(
        { error: 'Penukaran tidak ditemukan' },
        { status: 404 }
      )
    }

    if (!redemption.active) {
      return NextResponse.json(
        { error: 'Penukaran tidak aktif' },
        { status: 400 }
      )
    }

    // Check if user has enough points
    if (user.points < redemption.pointsRequired) {
      return NextResponse.json(
        { error: `Poin tidak mencukupi. Diperlukan ${redemption.pointsRequired} poin, Anda memiliki ${user.points} poin.` },
        { status: 400 }
      )
    }

    // Generate voucher code
    const voucherCode = generateVoucherCode()

    // Create point voucher
    const pointVoucher = await db.pointVoucher.create({
      data: {
        code: voucherCode,
        pointsRequired: redemption.pointsRequired,
        productId: redemption.productId,
        productName: redemption.product?.name || redemption.name,
        productImage: redemption.productImage || redemption.product?.image,
        productPrice: redemption.product?.price,
        userId: user.id
      }
    })

    // Deduct points from user
    await db.user.update({
      where: { id: user.id },
      data: {
        points: {
          decrement: redemption.pointsRequired
        }
      }
    })

    // Create point history record
    await db.pointHistory.create({
      data: {
        userId: user.id,
        type: 'redeemed',
        points: redemption.pointsRequired,
        description: `Menukar poin untuk ${redemption.name} (${pointVoucher.productName})`
      }
    })

    return NextResponse.json({
      success: true,
      voucherCode: pointVoucher.code,
      redemption: {
        id: redemption.id,
        name: redemption.name,
        description: redemption.description,
        pointsUsed: redemption.pointsRequired,
        productName: pointVoucher.productName
      }
    })
  } catch (error) {
    console.error('Error redeeming points:', error)
    return NextResponse.json(
      { error: 'Gagal menukar poin' },
      { status: 500 }
    )
  }
}
