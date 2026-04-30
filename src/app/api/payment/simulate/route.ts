import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// API untuk simulasi pembayaran QRIS berhasil
// Gunakan ini untuk testing saja
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID diperlukan' },
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

    // Simulasi pembayaran berhasil
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
        transactionId: `TRX${Date.now()}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Simulasi pembayaran berhasil',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: 'paid',
        orderStatus: 'processing',
      },
    })
  } catch (error) {
    console.error('Simulate payment error:', error)
    return NextResponse.json(
      { error: 'Gagal mensimulasikan pembayaran' },
      { status: 500 }
    )
  }
}
