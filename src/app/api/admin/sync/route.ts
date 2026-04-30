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
    ])

    // Get recent orders
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Get top products
    const topProducts = await db.product.findMany({
      take: 5,
      orderBy: {
        soldCount: 'desc',
      },
    })

    // Get top customers
    const topCustomers = await db.user.findMany({
      take: 5,
      orderBy: {
        points: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalVouchers,
          todayOrders,
          todayRevenue: todayRevenue._sum.finalAmount || 0,
          pendingOrders,
        },
        recentOrders,
        topProducts,
        topCustomers,
        lastSync: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync database' },
      { status: 500 }
    )
  }
}
