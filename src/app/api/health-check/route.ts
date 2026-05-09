import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const userCount = await db.user.count()
    const productCount = await db.product.count()
    const orderCount = await db.order.count()

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        users: userCount,
        products: productCount,
        orders: orderCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
