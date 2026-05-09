import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get sync history with pagination
    const [syncHistory, totalCount] = await Promise.all([
      db.databaseSyncHistory.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          syncedAt: 'desc',
        },
      }),
      db.databaseSyncHistory.count(),
    ])

    // Get latest sync status
    const latestSync = await db.databaseSyncHistory.findFirst({
      orderBy: {
        syncedAt: 'desc',
      },
    })

    // Calculate stats
    const totalSuccess = await db.databaseSyncHistory.count({
      where: {
        status: 'success',
      },
    })

    const totalFailed = await db.databaseSyncHistory.count({
      where: {
        status: 'failed',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        syncHistory: syncHistory.map(sync => ({
          id: sync.id,
          syncedAt: sync.syncedAt,
          syncedBy: sync.syncedBy,
          status: sync.status,
          totalUsers: sync.totalUsers,
          totalProducts: sync.totalProducts,
          totalOrders: sync.totalOrders,
          totalVouchers: sync.totalVouchers,
          todayOrders: sync.todayOrders,
          todayRevenue: sync.todayRevenue,
          pendingOrders: sync.pendingOrders,
          errorDetails: sync.errorDetails,
          duration: sync.duration,
        })),
        latestSync,
        stats: {
          totalCount,
          totalSuccess,
          totalFailed,
          successRate: totalCount > 0 ? ((totalSuccess / totalCount) * 100).toFixed(1) : '0',
          averageDuration: await db.databaseSyncHistory
            .aggregate({
              where: {
                duration: { not: null }
              },
              _avg: {
                duration: true
              }
            })
            .then(result => result._avg.duration || 0)
        },
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching sync history:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil riwayat sync' },
      { status: 500 }
    )
  }
}
