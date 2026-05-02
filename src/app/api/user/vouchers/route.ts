import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID diperlukan' },
        { status: 400 }
      )
    }

    // Get all vouchers
    const allVouchers = await db.voucher.findMany({
      where: {
        status: 'active'
      }
    })

    // Get user's point vouchers
    const pointVouchers = await db.pointVoucher.findMany({
      where: {
        userId,
        isUsed: false
      }
    })

    return NextResponse.json({
      success: true,
      vouchers: allVouchers.map(v => ({
        id: v.id,
        code: v.code,
        name: v.name,
        description: v.description,
        discountType: v.discountType,
        discountValue: v.discountValue,
        minPurchase: v.minPurchase,
        maxDiscount: v.maxDiscount,
        startDate: v.startDate,
        endDate: v.endDate,
        usageLimit: v.usageLimit,
        usageCount: v.usageCount,
        remaining: v.usageLimit ? v.usageLimit - v.usageCount : null
      })),
      pointVouchers: pointVouchers.map(pv => ({
        id: pv.id,
        code: pv.code,
        pointsRequired: pv.pointsRequired,
        productId: pv.productId,
        productImage: pv.productImage,
        isUsed: pv.isUsed,
        usedOrderId: pv.usedOrderId,
        createdAt: pv.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching user vouchers:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil voucher' },
      { status: 500 }
    )
  }
}
