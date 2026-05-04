import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        orders: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for Excel export
    const excelData = users.map(user => {
      // Calculate order statistics
      const totalOrders = user.orders.length
      const totalSpent = user.orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const lastOrderDate = user.orders.length > 0
        ? new Date(Math.max(...user.orders.map(o => new Date(o.createdAt).getTime()))).toLocaleDateString('id-ID')
        : '-'

      return {
        ID: user.id,
        'Nama Lengkap': user.name,
        'Email': user.email || '-',
        'No Telepon': user.phone || '-',
        'Role': user.role,
        'Member Level': user.memberLevel || '-',
        'Poin': user.points || 0,
        'Stamp Count': user.stampCount || 0,
        'Star Count': user.starCount || 0,
        'Total Order': totalOrders,
        'Total Belanja (Rp)': totalSpent,
        'Order Terakhir': lastOrderDate,
        'Dibuat Pada': new Date(user.createdAt).toLocaleString('id-ID'),
        'Diperbarui Pada': new Date(user.updatedAt).toLocaleString('id-ID')
      }
    })

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const wscols = [
      { wch: 25 },  // ID
      { wch: 30 },  // Nama Lengkap
      { wch: 30 },  // Email
      { wch: 15 },  // No Telepon
      { wch: 15 },  // Role
      { wch: 15 },  // Member Level
      { wch: 10 },  // Poin
      { wch: 10 },  // Stamp Count
      { wch: 10 },  // Star Count
      { wch: 10 },  // Total Order
      { wch: 15 },  // Total Belanja
      { wch: 20 },  // Order Terakhir
      { wch: 25 },  // Dibuat Pada
      { wch: 25 },  // Diperbarui Pada
    ]
    worksheet['!cols'] = wscols

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pengguna')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `pengguna_${timestamp}.xlsx`

    // Return response with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor pengguna' },
      { status: 500 }
    )
  }
}
