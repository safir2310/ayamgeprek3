import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// GET - Fetch all active point redemption options
export async function GET(request: NextRequest) {
  try {
    const redemptions = await db.pointRedemption.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        product: true
      }
    })

    return NextResponse.json({ redemptions })
  } catch (error) {
    console.error('Error fetching point redemptions:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data penukaran poin' },
      { status: 500 }
    )
  }
}

// POST - Redeem points for a voucher
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - Token tidak ditemukan' }, { status: 401 })
    }

    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { redemptionId } = await request.json()

    if (!redemptionId) {
      return NextResponse.json(
        { error: 'Pilih menu penukaran terlebih dahulu' },
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
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    if (user.points < redemption.pointsRequired) {
      return NextResponse.json(
        { error: `Poin tidak mencukupi. Anda memiliki ${user.points} poin, butuhkan ${redemption.pointsRequired} poin.` },
        { status: 400 }
      )
    }

    // Generate unique voucher code
    const voucherCode = `VOUCHER${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create point voucher with product details
    const product = await db.product.findUnique({
      where: { id: redemption.productId }
    })

    const pointVoucher = await db.pointVoucher.create({
      data: {
        code: voucherCode,
        pointsRequired: redemption.pointsRequired,
        productId: redemption.productId,
        productName: product?.name || redemption.name,
        productImage: product?.image || redemption.productImage,
        productPrice: product?.price || 0,
        userId: decoded.userId,
      },
    })

    // Deduct user points
    await db.user.update({
      where: { id: decoded.userId },
      data: {
        points: {
          decrement: redemption.pointsRequired,
        },
      },
    })

    // Record point history
    await db.pointHistory.create({
      data: {
        userId: decoded.userId,
        type: 'redeemed',
        points: -redemption.pointsRequired,
        description: `Penukaran poin untuk voucher: ${redemption.name}`,
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
    })
  } catch (error) {
    console.error('Error redeeming points:', error)
    return NextResponse.json(
      { error: 'Gagal menukar poin' },
      { status: 500 }
    )
  }
}
