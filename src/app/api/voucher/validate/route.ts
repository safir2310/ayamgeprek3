import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { code, userId, cartTotal } = await request.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Kode voucher diperlukan' },
        { status: 400 }
      )
    }

    // Check if it's a point voucher
    const pointVoucher = await db.pointVoucher.findUnique({
      where: {
        code,
        userId,
        isUsed: false
      },
      include: {
        product: true
      }
    })

    if (pointVoucher) {
      // Check if user has enough points
      const user = await db.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User tidak ditemukan' },
          { status: 404 }
        )
      }

      if (user.points < pointVoucher.pointsRequired) {
        return NextResponse.json(
          { success: false, error: `Poin tidak cukup. Dibutuhkan ${pointVoucher.pointsRequired} poin.` },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        type: 'point_voucher',
        voucher: {
          id: pointVoucher.id,
          code: pointVoucher.code,
          pointsRequired: pointVoucher.pointsRequired,
          productId: pointVoucher.productId,
          productName: pointVoucher.product?.name || 'Produk Gratis',
          productImage: pointVoucher.product?.image || '🎁'
        }
      })
    }

    // Check if it's a regular discount voucher
    const discountVoucher = await db.voucher.findUnique({
      where: {
        code,
        status: 'active'
      }
    })

    if (!discountVoucher) {
      return NextResponse.json(
        { success: false, error: 'Kode voucher tidak valid' },
        { status: 404 }
      )
    }

    // Check if voucher is expired
    const now = new Date()
    if (discountVoucher.startDate > now || discountVoucher.endDate < now) {
      return NextResponse.json(
        { success: false, error: 'Voucher sudah kadaluarsa atau belum aktif' },
        { status: 400 }
      )
    }

    // Check if usage limit reached
    if (discountVoucher.usageLimit && discountVoucher.usageCount >= discountVoucher.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'Voucher sudah mencapai batas penggunaan' },
        { status: 400 }
      )
    }

    // Check minimum purchase
    if (cartTotal < discountVoucher.minPurchase) {
      return NextResponse.json(
        { success: false, error: `Minimum belanja Rp ${discountVoucher.minPurchase.toLocaleString()}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      type: 'discount_voucher',
      voucher: {
        id: discountVoucher.id,
        code: discountVoucher.code,
        name: discountVoucher.name,
        description: discountVoucher.description,
        discountType: discountVoucher.discountType,
        discountValue: discountVoucher.discountValue,
        minPurchase: discountVoucher.minPurchase,
        maxDiscount: discountVoucher.maxDiscount
      }
    })
  } catch (error) {
    console.error('Voucher validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memvalidasi voucher' },
      { status: 500 }
    )
  }
}
