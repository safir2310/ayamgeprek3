import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get all database statistics
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalVouchers,
      todayOrders,
      todayRevenue,
      pendingOrders,
      completedOrders,
      totalRevenue,
    ] = await Promise.all([
      db.user.count(),
      db.product.count(),
      db.order.count(),
      db.voucher.count(),
      db.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          paymentStatus: 'paid',
        },
        _sum: {
          finalAmount: true,
        },
      }),
      db.order.count({
        where: {
          orderStatus: 'pending',
        },
      }),
      db.order.count({
        where: {
          orderStatus: 'completed',
        },
      }),
      db.order.aggregate({
        where: {
          paymentStatus: 'paid',
        },
        _sum: {
          finalAmount: true,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalVouchers,
        todayOrders,
        todayRevenue: todayRevenue._sum.finalAmount || 0,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.finalAmount || 0,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
