import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Get all orders with QRIS payment and pending/verified status
    const orders = await db.order.findMany({
      where: {
        paymentMethod: 'QRIS',
        paymentStatus: {
          in: ['pending', 'verified', 'rejected'],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform orders to payment requests format
    const payments = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer?.name || order.customerName || 'Unknown',
      customerPhone: order.customer?.phone || order.customerPhone || '-',
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
        price: item.product.price,
      })),
    }))

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
