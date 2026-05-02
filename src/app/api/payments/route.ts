import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') // all, pending, verified, rejected

    // Build where clause
    const where: any = {
      paymentMethod: 'QRIS',
      paymentStatus: {
        in: ['pending', 'verified', 'rejected'],
      },
    }

    if (statusFilter && statusFilter !== 'all') {
      where.paymentStatus = statusFilter
    }

    // Get all orders with QRIS payment
    const orders = await db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform orders to payment requests format
    const payments = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user?.name || order.customerName || 'Unknown',
      customerPhone: order.user?.phone || order.customerPhone || '-',
      amount: order.finalAmount,
      paymentMethod: order.paymentMethod,
      paymentProof: order.paymentProof || undefined,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      transactionDate: order.transactionDate?.toISOString() || undefined,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      userId: order.userId,
      pointsEarned: order.pointsEarned || 0,
    }))

    return NextResponse.json({
      success: true,
      payments,
      stats: {
        total: payments.length,
        pending: payments.filter((p) => p.paymentStatus === 'pending').length,
        verified: payments.filter((p) => p.paymentStatus === 'verified').length,
        rejected: payments.filter((p) => p.paymentStatus === 'rejected').length,
      },
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pembayaran' },
      { status: 500 }
    )
  }
}
