import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET - Fetch sales reports data
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (decoded.role !== 'admin') {
      console.log('[API] User is not admin, role from token:', decoded.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'

    const now = new Date()
    const startDate = new Date(now)
    
    // Calculate date range based on period
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate.setDate(now.getDate() - 30)
    } else if (period === 'quarter') {
      startDate.setDate(now.getDate() - 90)
    }

    // Fetch sales data for the period
    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        orderStatus: 'completed',
        paymentStatus: 'paid',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Calculate daily sales
    const dailySales = new Map<string, { revenue: number; orders: number }>()
    orders.forEach(order => {
      const dateKey = new Date(order.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
      })
      
      if (!dailySales.has(dateKey)) {
        dailySales.set(dateKey, { revenue: 0, orders: 0 })
      }
      
      const dayData = dailySales.get(dateKey)!
      dayData.revenue += order.finalAmount
      dayData.orders += 1
    })

    // Convert map to array
    const dailySalesArray = Array.from(dailySales.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }))

    // Calculate total revenue and orders
    const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0)
    const totalOrders = orders.length
    const avgRevenue = dailySalesArray.length > 0 ? Math.round(totalRevenue / dailySalesArray.length) : 0
    const avgOrders = dailySalesArray.length > 0 ? Math.round(totalOrders / dailySalesArray.length) : 0

    // Calculate top products
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = item.product
        if (!productSales.has(product.id)) {
          productSales.set(product.id, {
            name: product.name,
            quantity: 0,
            revenue: 0,
          })
        }
        
        const productData = productSales.get(product.id)!
        productData.quantity += item.quantity
        productData.revenue += item.price * item.quantity
      })
    })

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(p => ({
        name: p.name,
        quantity: p.quantity,
        revenue: p.revenue,
      }))

    // Calculate category sales
    const categorySales = new Map<string, { category: string; revenue: number }>()
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = item.product
        if (!categorySales.has(product.categoryId)) {
          categorySales.set(product.categoryId, {
            category: product.categoryId || 'Lainnya',
            revenue: 0,
          })
        }
        
        const categoryData = categorySales.get(product.categoryId)!
        categoryData.revenue += item.price * item.quantity
      })
    })

    // Get category names
    const categories = await db.category.findMany({
      where: {
        id: { in: Array.from(categorySales.keys()) },
      },
    })

    const categoryMap = new Map(categories.map(c => [c.id, c.name]))
    
    const categorySalesArray = Array.from(categorySales.values()).map(cs => ({
      category: categoryMap.get(cs.category) || cs.category,
      revenue: cs.revenue,
      percentage: totalRevenue > 0 ? Math.round((cs.revenue / totalRevenue) * 100) : 0,
    }))
      .sort((a, b) => b.revenue - a.revenue)

    return NextResponse.json({
      success: true,
      period,
      dailySales: dailySalesArray,
      totalRevenue,
      totalOrders,
      avgRevenue,
      avgOrders,
      topProducts,
      categorySales: categorySalesArray,
      maxRevenue: dailySalesArray.length > 0 ? Math.max(...dailySalesArray.map(d => d.revenue)) : 0,
      maxOrders: dailySalesArray.length > 0 ? Math.max(...dailySalesArray.map(d => d.orders)) : 0,
    })
  } catch (error) {
    console.error('[API] Error fetching sales reports:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data laporan penjualan' },
      { status: 500 }
    )
  }
}
