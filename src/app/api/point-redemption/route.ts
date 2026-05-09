import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const redemptions = await db.pointRedemption.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      redemptions: redemptions.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        pointsRequired: r.pointsRequired,
        productId: r.productId,
        productImage: r.productImage,
        active: r.active,
        order: r.order,
        product: r.product
      }))
    })
  } catch (error) {
    console.error('Error fetching point redemptions:', error)
    return NextResponse.json(
      { error: 'Gagal memuat opsi penukaran poin' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { redemptionId } = body

    // Get user info
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get redemption option
    const redemption = await db.pointRedemption.findUnique({
      where: { id: redemptionId },
      include: {
        product: true
      }
    })

    if (!redemption) {
      return NextResponse.json({ error: 'Opsi penukaran tidak ditemukan' }, { status: 404 })
    }

    if (!redemption.active) {
      return NextResponse.json({ error: 'Opsi penukaran tidak aktif' }, { status: 400 })
    }

    // Check if user has enough points
    if (user.points < redemption.pointsRequired) {
      return NextResponse.json(
        { error: `Poin tidak cukup. Anda membutuhkan ${redemption.pointsRequired} poin.` },
        { status: 400 }
      )
    }

    // Generate voucher code
    const voucherCode = `POINT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create point voucher
    const pointVoucher = await db.pointVoucher.create({
      data: {
        code: voucherCode,
        pointsRequired: redemption.pointsRequired,
        productId: redemption.productId,
        productName: redemption.product?.name,
        productImage: redemption.product?.image || redemption.productImage,
        productPrice: redemption.product?.price,
        userId: user.id,
        isUsed: false,
      }
    })

    // Deduct points from user
    await db.user.update({
      where: { id: user.id },
      data: {
        points: { decrement: redemption.pointsRequired },
      }
    })

    // Create point history
    await db.pointHistory.create({
      data: {
        userId: user.id,
        type: 'redeemed',
        points: redemption.pointsRequired,
        description: `Penukaran poin untuk ${redemption.name}`,
      }
    })

    return NextResponse.json({
      success: true,
      voucherCode: pointVoucher.code,
      redemption: {
        id: redemption.id,
        name: redemption.name,
        description: redemption.description,
        pointsRequired: redemption.pointsRequired,
        productName: redemption.product?.name,
        productId: redemption.productId,
      },
      voucherId: pointVoucher.id,
      newPointsBalance: user.points - redemption.pointsRequired
    })
  } catch (error) {
    console.error('Point redemption error:', error)
    return NextResponse.json(
      { error: 'Gagal menukar poin' },
      { status: 500 }
    )
  }
}
