import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('=== Debug: Checking Vouchers ===')

    const vouchers = await db.voucher.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const now = new Date()

    const voucherDetails = vouchers.map(v => {
      const isActiveStatus = v.status === 'active'
      const isStarted = now >= v.startDate
      const notExpired = now <= v.endDate
      const withinLimit = !v.usageLimit || v.usageCount < v.usageLimit
      const isValid = isActiveStatus && isStarted && notExpired && withinLimit

      return {
        id: v.id,
        code: v.code,
        name: v.name,
        status: v.status,
        discountType: v.discountType,
        discountValue: v.discountValue,
        minPurchase: v.minPurchase,
        maxDiscount: v.maxDiscount,
        startDate: v.startDate,
        endDate: v.endDate,
        usageCount: v.usageCount,
        usageLimit: v.usageLimit,
        validation: {
          isActiveStatus,
          isStarted,
          notExpired,
          withinLimit,
          isValid,
          now: now.toISOString(),
        }
      }
    })

    return NextResponse.json({
      success: true,
      totalVouchers: vouchers.length,
      vouchers: voucherDetails
    })
  } catch (error: any) {
    console.error('Debug vouchers error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
