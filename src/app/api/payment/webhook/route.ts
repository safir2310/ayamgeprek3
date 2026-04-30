import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simulasi webhook pembayaran QRIS
// Di sistem nyata, ini akan dipanggil oleh payment gateway setelah pembayaran berhasil
export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentStatus, transactionId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID diperlukan' },
        { status: 400 }
      )
    }

    // Validasi status pembayaran
    if (paymentStatus !== 'paid' && paymentStatus !== 'failed') {
      return NextResponse.json(
        { error: 'Status pembayaran tidak valid' },
        { status: 400 }
      )
    }

    // Cari order berdasarkan orderNumber
    const order = await db.order.findUnique({
      where: { orderNumber: orderId },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update status pembayaran
    if (paymentStatus === 'paid') {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          orderStatus: 'processing',
        },
      })

      // Update payment record
      await db.payment.updateMany({
        where: { orderId: order.id },
        data: {
          paymentStatus: 'paid',
          paymentDate: new Date(),
          transactionId: transactionId || null,
        },
      })

      console.log(`Order ${order.orderNumber} berhasil dibayar`)
    } else if (paymentStatus === 'failed') {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed',
          orderStatus: 'cancelled',
        },
      })

      await db.payment.updateMany({
        where: { orderId: order.id },
        data: {
          paymentStatus: 'failed',
        },
      })

      console.log(`Order ${order.orderNumber} pembayaran gagal`)
    }

    return NextResponse.json({
      success: true,
      message: paymentStatus === 'paid' 
        ? 'Pembayaran berhasil dikonfirmasi' 
        : 'Pembayaran gagal',
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Gagal memproses notifikasi pembayaran' },
      { status: 500 }
    )
  }
}
