import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// Generate random voucher code
function generateVoucherCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { rewardId } = body

    if (!rewardId) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Get reward product
    const reward = await prisma.product.findUnique({
      where: { id: rewardId },
      include: { category: true },
    })

    if (!reward) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    const pointsRequired = reward.pointsRequired || 0
    if (pointsRequired <= 0) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Produk ini tidak dapat ditukar dengan poin' }, { status: 400 })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    if (user.points < pointsRequired) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Poin tidak mencukupi' }, { status: 400 })
    }

    // Generate unique voucher code
    let voucherCode: string
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      voucherCode = generateVoucherCode()
      const existingVoucher = await prisma.voucher.findUnique({
        where: { code: voucherCode },
      })
      if (!existingVoucher) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Gagal membuat kode voucher' }, { status: 500 })
    }

    // Calculate voucher expiration (30 days from now)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    // Create voucher for the product (free product)
    const voucher = await prisma.voucher.create({
      data: {
        id: uuidv4(),
        code: voucherCode!,
        name: `Voucher Produk: ${reward.name}`,
        description: `Voucher gratis produk ${reward.name} dari tukar ${pointsRequired} poin`,
        discountType: 'fixed',
        discountValue: reward.price, // Voucher value equals product price
        minPurchase: 0,
        maxDiscount: reward.price,
        startDate,
        endDate,
        usageLimit: 1, // Sekali pakai
        usageCount: 0,
        status: 'active',
      },
    })

    // Deduct points
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        points: { decrement: pointsRequired },
      },
    })

    // Create point history record
    await prisma.pointHistory.create({
      data: {
        id: uuidv4(),
        userId: payload.userId,
        type: 'redeemed',
        points: pointsRequired,
        description: `Tukar ${pointsRequired} poin menjadi produk: ${reward.name} (Kode: ${voucherCode})`,
      },
    })

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: `${pointsRequired} poin berhasil ditukar menjadi ${reward.name}`,
      voucherCode: voucherCode!,
      productName: reward.name,
      productPrice: reward.price,
      expiryDate: endDate.toISOString(),
      remainingPoints: user.points - pointsRequired,
    })
  } catch (error) {
    console.error('Points exchange error:', error)
    try {
      await prisma.$disconnect()
    } catch (e) {
      // Ignore disconnect error
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menukar poin' },
      { status: 500 }
    )
  }
}
