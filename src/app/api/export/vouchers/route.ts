import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const vouchers = await db.voucher.findMany({
      include: {
        usages: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for Excel export
    const excelData = vouchers.map(voucher => {
      const usageCount = voucher.usages.length

      return {
        ID: voucher.id,
        'Nama Voucher': voucher.name,
        'Tipe Diskon': voucher.discountType === 'percentage' ? 'Persentase' : 'Nominal',
        'Nilai Diskon': voucher.discountType === 'percentage'
          ? `${voucher.discountValue}%`
          : `Rp ${voucher.discountValue.toLocaleString()}`,
        'Minimal Pembelian (Rp)': voucher.minPurchase || '-',
        'Kode Voucher': voucher.code,
        'Berlaku Dari': new Date(voucher.validFrom).toLocaleDateString('id-ID'),
        'Berlaku Sampai': new Date(voucher.validTo).toLocaleDateString('id-ID'),
        'Maksimal Penggunaan': voucher.maxUsage || '∞',
        'Jumlah Digunakan': usageCount,
        'Sisa Kuota': voucher.maxUsage ? (voucher.maxUsage - usageCount) : '∞',
        'Status': voucher.isActive ? 'Aktif' : 'Tidak Aktif',
        'Dibuat Pada': new Date(voucher.createdAt).toLocaleString('id-ID'),
        'Diperbarui Pada': new Date(voucher.updatedAt).toLocaleString('id-ID')
      }
    })

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const wscols = [
      { wch: 25 },  // ID
      { wch: 30 },  // Nama Voucher
      { wch: 15 },  // Tipe Diskon
      { wch: 20 },  // Nilai Diskon
      { wch: 20 },  // Minimal Pembelian
      { wch: 20 },  // Kode Voucher
      { wch: 20 },  // Berlaku Dari
      { wch: 20 },  // Berlaku Sampai
      { wch: 15 },  // Maksimal Penggunaan
      { wch: 15 },  // Jumlah Digunakan
      { wch: 15 },  // Sisa Kuota
      { wch: 10 },  // Status
      { wch: 25 },  // Dibuat Pada
      { wch: 25 },  // Diperbarui Pada
    ]
    worksheet['!cols'] = wscols

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Voucher')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `voucher_${timestamp}.xlsx`

    // Return response with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error exporting vouchers:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor voucher' },
      { status: 500 }
    )
  }
}
