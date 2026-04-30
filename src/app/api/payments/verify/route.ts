import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { paymentId, status } = await req.json()

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Payment ID and status are required' },
        { status: 400 }
      )
    }

    if (status !== 'verified' && status !== 'rejected') {
      return NextResponse.json(
        { error: 'Invalid status. Must be "verified" or "rejected"' },
        { status: 400 }
      )
    }

    // Find the order
    const order = await db.order.findUnique({
      where: { id: paymentId },
      include: { user: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update payment status
    const updatedOrder = await db.order.update({
      where: { id: paymentId },
      data: {
        paymentStatus: status,
        orderStatus: status === 'verified' ? 'confirmed' : 'cancelled',
      },
      include: { user: true },
    })

    // If payment is verified, update user points
    if (status === 'verified' && order.userId) {
      const pointsToAdd = Math.floor(order.finalAmount / 100) // 1 point per 100 IDR
      await db.user.update({
        where: { id: order.userId },
        data: {
          points: {
            increment: pointsToAdd,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      orderNumber: updatedOrder.orderNumber,
      paymentStatus: updatedOrder.paymentStatus,
      orderStatus: updatedOrder.orderStatus,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
