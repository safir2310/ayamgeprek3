import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for Excel export
    const excelData = products.map(product => ({
      ID: product.id,
      'Nama Produk': product.name,
      'Kategori': product.category?.name || '-',
      'Harga (Rp)': product.price,
      'Harga Diskon (Rp)': product.discountPrice || '-',
      'Stok': product.stock,
      'Barcode': product.barcode || '-',
      'Promo': product.isPromo ? 'Ya' : 'Tidak',
      'Persentase Diskon': product.discountPercent ? `${product.discountPercent}%` : '-',
      'Dibuat Pada': new Date(product.createdAt).toLocaleString('id-ID'),
      'Diperbarui Pada': new Date(product.updatedAt).toLocaleString('id-ID')
    }))

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const wscols = [
      { wch: 25 },  // ID
      { wch: 30 },  // Nama Produk
      { wch: 15 },  // Kategori
      { wch: 15 },  // Harga
      { wch: 15 },  // Harga Diskon
      { wch: 10 },  // Stok
      { wch: 15 },  // Barcode
      { wch: 10 },  // Promo
      { wch: 15 },  // Persentase Diskon
      { wch: 25 },  // Dibuat Pada
      { wch: 25 },  // Diperbarui Pada
    ]
    worksheet['!cols'] = wscols

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produk')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `produk_${timestamp}.xlsx`

    // Return response with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error exporting products:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor produk' },
      { status: 500 }
    )
  }
}
