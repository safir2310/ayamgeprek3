import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform main order data for Excel export
    const excelData = orders.map(order => {
      const itemsSummary = order.items.map(item =>
        `${item.product.name} (x${item.quantity})`
      ).join(', ')

      return {
        ID: order.id,
        'Nomor Pesanan': order.orderNumber,
        'Nama Pelanggan': order.customerName,
        'No Telepon': order.customerPhone || '-',
        'Email': order.customerEmail || '-',
        'Alamat': order.customerAddress || '-',
        'Item Pesanan': itemsSummary,
        'Jumlah Item': order.items.length,
        'Subtotal (Rp)': order.subtotal,
        'Pajak (Rp)': order.tax,
        'Total (Rp)': order.totalAmount,
        'Metode Pembayaran': order.paymentMethod,
        'Status Pembayaran': order.paymentStatus,
        'Status Pesanan': order.orderStatus,
        'Poin Didapat': order.pointsEarned || 0,
        'Dibuat Pada': new Date(order.createdAt).toLocaleString('id-ID'),
        'Diperbarui Pada': new Date(order.updatedAt).toLocaleString('id-ID')
      }
    })

    // Create main worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const wscols = [
      { wch: 25 },  // ID
      { wch: 20 },  // Nomor Pesanan
      { wch: 25 },  // Nama Pelanggan
      { wch: 15 },  // No Telepon
      { wch: 25 },  // Email
      { wch: 40 },  // Alamat
      { wch: 60 },  // Item Pesanan
      { wch: 10 },  // Jumlah Item
      { wch: 15 },  // Subtotal
      { wch: 10 },  // Pajak
      { wch: 15 },  // Total
      { wch: 15 },  // Metode Pembayaran
      { wch: 15 },  // Status Pembayaran
      { wch: 15 },  // Status Pesanan
      { wch: 10 },  // Poin Didapat
      { wch: 25 },  // Dibuat Pada
      { wch: 25 },  // Diperbarui Pada
    ]
    worksheet['!cols'] = wscols

    // Create order items worksheet
    const itemsData: any[] = []
    orders.forEach(order => {
      order.items.forEach(item => {
        itemsData.push({
          'Nomor Pesanan': order.orderNumber,
          'Nama Pelanggan': order.customerName,
          'Nama Produk': item.product.name,
          'Kategori': item.product.category,
          'Harga Satuan (Rp)': item.price,
          'Jumlah': item.quantity,
          'Subtotal (Rp)': item.price * item.quantity
        })
      })
    })

    const itemsWorksheet = XLSX.utils.json_to_sheet(itemsData)
    const itemsWscols = [
      { wch: 20 },  // Nomor Pesanan
      { wch: 25 },  // Nama Pelanggan
      { wch: 30 },  // Nama Produk
      { wch: 15 },  // Kategori
      { wch: 15 },  // Harga Satuan
      { wch: 10 },  // Jumlah
      { wch: 15 },  // Subtotal
    ]
    itemsWorksheet['!cols'] = itemsWscols

    // Create workbook with both sheets
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pesanan')
    XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'Item Pesanan')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `pesanan_${timestamp}.xlsx`

    // Return response with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error exporting orders:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor pesanan' },
      { status: 500 }
    )
  }
}
