import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
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
      'Tanggal': date,
      'Pendapatan (Rp)': data.revenue,
      'Jumlah Pesanan': data.orders,
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
        'Nama Produk': p.name,
        'Jumlah Terjual': p.quantity,
        'Pendapatan (Rp)': p.revenue,
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
      'Kategori': categoryMap.get(cs.category) || cs.category,
      'Pendapatan (Rp)': cs.revenue,
      'Persentase (%)': totalRevenue > 0 ? Math.round((cs.revenue / totalRevenue) * 100) : 0,
    }))
      .sort((a, b) => b['Pendapatan (Rp)'] - a['Pendapatan (Rp)'])

    // Create Summary sheet
    const periodLabel = {
      week: '7 Hari Terakhir',
      month: '30 Hari Terakhir',
      quarter: '90 Hari Terakhir'
    }

    const summaryData = [
      { 'Metrik': 'Periode Laporan', 'Nilai': periodLabel[period as keyof typeof periodLabel] },
      { 'Metrik': 'Tanggal Export', 'Nilai': new Date().toLocaleString('id-ID') },
      { 'Metrik': 'Total Pendapatan', 'Nilai': totalRevenue },
      { 'Metrik': 'Total Pesanan', 'Nilai': totalOrders },
      { 'Metrik': 'Rata-rata Pendapatan Harian', 'Nilai': avgRevenue },
      { 'Metrik': 'Rata-rata Pesanan Harian', 'Nilai': avgOrders },
      { 'Metrik': 'Produk Terlaris', 'Nilai': topProducts[0]?.['Nama Produk'] || '-' },
      { 'Metrik': 'Kategori Terlaris', 'Nilai': categorySalesArray[0]?.['Kategori'] || '-' },
    ]

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
    const summaryWscols = [
      { wch: 25 },  // Metrik
      { wch: 30 },  // Nilai
    ]
    summaryWorksheet['!cols'] = summaryWscols

    // Create Daily Sales sheet
    const dailySalesWorksheet = XLSX.utils.json_to_sheet(dailySalesArray)
    const dailySalesWscols = [
      { wch: 15 },  // Tanggal
      { wch: 20 },  // Pendapatan
      { wch: 15 },  // Jumlah Pesanan
    ]
    dailySalesWorksheet['!cols'] = dailySalesWscols

    // Create Top Products sheet
    const topProductsWorksheet = XLSX.utils.json_to_sheet(topProducts)
    const topProductsWscols = [
      { wch: 35 },  // Nama Produk
      { wch: 15 },  // Jumlah Terjual
      { wch: 20 },  // Pendapatan
    ]
    topProductsWorksheet['!cols'] = topProductsWscols

    // Create Category Sales sheet
    const categorySalesWorksheet = XLSX.utils.json_to_sheet(categorySalesArray)
    const categorySalesWscols = [
      { wch: 25 },  // Kategori
      { wch: 20 },  // Pendapatan
      { wch: 15 },  // Persentase
    ]
    categorySalesWorksheet['!cols'] = categorySalesWscols

    // Create workbook with all sheets
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Ringkasan')
    XLSX.utils.book_append_sheet(workbook, dailySalesWorksheet, 'Penjualan Harian')
    XLSX.utils.book_append_sheet(workbook, topProductsWorksheet, 'Produk Terlaris')
    XLSX.utils.book_append_sheet(workbook, categorySalesWorksheet, 'Distribusi Kategori')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const periodSuffix = {
      week: '7hari',
      month: '30hari',
      quarter: '90hari'
    }
    const filename = `laporan_penjualan_${periodSuffix[period as keyof typeof periodSuffix]}_${timestamp}.xlsx`

    // Return response with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error exporting sales reports:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor laporan penjualan' },
      { status: 500 }
    )
  }
}
