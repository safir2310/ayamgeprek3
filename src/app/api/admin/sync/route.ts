import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  let syncedBy = 'system'
  let status = 'success'
  let errorDetails: string | null = null

  try {
    // Get admin email from token if available
    const token = getTokenFromRequest(request)
    if (token) {
      const payload = await verifyToken(token)
      if (payload && payload.email) {
        syncedBy = payload.email
      }
    }

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

    const duration = Date.now() - startTime

    // Save sync history to database
    try {
      await db.databaseSyncHistory.create({
        data: {
          syncedBy,
          status: 'success',
          totalUsers,
          totalProducts,
          totalOrders,
          totalVouchers,
          todayOrders,
          todayRevenue: todayRevenue._sum.finalAmount || 0,
          pendingOrders,
          duration,
        }
      })
    } catch (syncError) {
      console.error('Failed to save sync history:', syncError)
      // Continue even if saving sync history fails
    }

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
    status = 'failed'
    errorDetails = error instanceof Error ? error.message : 'Unknown error'
    const duration = Date.now() - startTime

    // Try to get at least some stats even if there's an error
    let totalUsers = 0
    let totalProducts = 0
    let totalOrders = 0
    let totalVouchers = 0
    let todayOrders = 0
    let todayRevenue = 0
    let pendingOrders = 0

    try {
      totalUsers = await db.user.count()
      totalProducts = await db.product.count()
      totalOrders = await db.order.count()
      totalVouchers = await db.voucher.count()
    } catch (statsError) {
      console.error('Failed to get partial stats:', statsError)
    }

    // Save failed sync history
    try {
      await db.databaseSyncHistory.create({
        data: {
          syncedBy,
          status: 'failed',
          totalUsers,
          totalProducts,
          totalOrders,
          totalVouchers,
          todayOrders,
          todayRevenue,
          pendingOrders,
          errorDetails,
          duration,
        }
      })
    } catch (syncError) {
      console.error('Failed to save failed sync history:', syncError)
    }

    return NextResponse.json(
      { success: false, error: errorDetails || 'Failed to sync database' },
      { status: 500 }
    )
  }
}
