import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// POST - Manual redeem points by admin
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, redemptionId } = await request.json()

    if (!userId || !redemptionId) {
      return NextResponse.json(
        { error: 'User ID dan Redemption ID wajib diisi' },
        { status: 400 }
      )
    }

    // Fetch redemption option with product details
    const redemption = await db.pointRedemption.findUnique({
      where: { id: redemptionId },
      include: {
        product: true
      }
    })

    if (!redemption || !redemption.active) {
      return NextResponse.json(
        { error: 'Menu penukaran tidak tersedia' },
        { status: 404 }
      )
    }

    // Check user points
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    if (user.points < redemption.pointsRequired) {
      return NextResponse.json(
        { error: `Poin tidak mencukupi. User memiliki ${user.points} poin, butuhkan ${redemption.pointsRequired} poin.` },
        { status: 400 }
      )
    }

    // Generate unique voucher code
    const voucherCode = `VOUCHER${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create point voucher with product details
    const pointVoucher = await db.pointVoucher.create({
      data: {
        code: voucherCode,
        pointsRequired: redemption.pointsRequired,
        productId: redemption.productId,
        userId: userId,
      },
    })

    // Deduct user points
    await db.user.update({
      where: { id: userId },
      data: {
        points: {
          decrement: redemption.pointsRequired,
        },
      },
    })

    // Record point history with admin note
    await db.pointHistory.create({
      data: {
        userId: userId,
        type: 'redeemed',
        points: -redemption.pointsRequired,
        description: `Penukaran poin manual oleh admin untuk voucher: ${redemption.name}`,
      },
    })

    return NextResponse.json({
      success: true,
      voucherCode: pointVoucher.code,
      redemption: {
        id: redemption.id,
        name: redemption.name,
        description: redemption.description,
        pointsUsed: redemption.pointsRequired,
        productName: redemption.product?.name || 'Produk Gratis',
        productImage: redemption.product?.image,
      },
      userName: user.name,
    })
  } catch (error) {
    console.error('Error manual redeeming points:', error)
    return NextResponse.json(
      { error: 'Gagal menukar poin manual' },
      { status: 500 }
    )
  }
}
