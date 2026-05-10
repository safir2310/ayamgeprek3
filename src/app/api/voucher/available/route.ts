import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cartTotal = searchParams.get('cartTotal')

    // Get current date
    const now = new Date()

    // Fetch active vouchers that are valid now
    const vouchers = await db.voucher.findMany({
      where: {
        status: 'active',
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Filter and format vouchers
    const availableVouchers = vouchers
      .filter((voucher) => {
        // Check if usage limit is not reached
        if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
          return false
        }

        // Check minimum purchase requirement
        if (cartTotal) {
          const total = parseFloat(cartTotal)
          if (total < voucher.minPurchase) {
            return false
          }
        }

        return true
      })
      .map((voucher) => ({
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minPurchase: voucher.minPurchase,
        maxDiscount: voucher.maxDiscount,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        usageLimit: voucher.usageLimit,
        usageCount: voucher.usageCount,
        remainingUses: voucher.usageLimit ? voucher.usageLimit - voucher.usageCount : null,
      }))

    return NextResponse.json({
      success: true,
      vouchers: availableVouchers,
    })
  } catch (error) {
    console.error('[Available Vouchers API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil daftar voucher yang tersedia',
      },
      { status: 500 }
    )
  }
}
