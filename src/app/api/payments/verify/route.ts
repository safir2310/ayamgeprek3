import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { paymentId, status } = await req.json()

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Payment ID dan status wajib diisi' },
        { status: 400 }
      )
    }

    if (status !== 'verified' && status !== 'rejected') {
      return NextResponse.json(
        { error: 'Status tidak valid. Harus "verified" atau "rejected"' },
        { status: 400 }
      )
    }

    // Find order with all related data
    const order = await db.order.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update order status based on payment verification
    const updatedOrder = await db.order.update({
      where: { id: paymentId },
      data: {
        paymentStatus: status,
        orderStatus: status === 'verified' ? 'confirmed' : 'cancelled',
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // If payment is verified, process order fulfillment
    if (status === 'verified') {
      // 1. Award points to user
      if (order.userId) {
        const pointsToAdd = Math.floor(order.finalAmount / 100) // 1 point per 100 IDR

        // Update user points
        await db.user.update({
          where: { id: order.userId },
          data: {
            points: {
              increment: pointsToAdd,
            },
            stampCount: {
              increment: 1, // Add 1 stamp for each order
            },
          },
        })

        // Create point history record
        await db.pointHistory.create({
          data: {
            userId: order.userId,
            type: 'earned',
            points: pointsToAdd,
            orderId: order.id,
            description: `Poin dari pesanan ${order.orderNumber}`,
          },
        })

        // 2. Update product stock and soldCount
        for (const item of order.items) {
          await db.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
              soldCount: {
                increment: item.quantity,
              },
            },
          })
        }

        // 3. Track voucher usage if applicable
        if (order.voucherCode) {
          const voucher = await db.voucher.findFirst({
            where: { code: order.voucherCode },
          })

          if (voucher) {
            await db.voucher.update({
              where: { id: voucher.id },
              data: {
                usageCount: {
                  increment: 1,
                },
              },
            })

            // Create voucher usage record
            await db.voucherUsage.create({
              data: {
                voucherId: voucher.id,
                userId: order.userId || '',
                orderId: order.id,
                discount: order.discountAmount,
              },
            })
          }
        }

        // 4. Update order points record
        await db.order.update({
          where: { id: paymentId },
          data: {
            pointsEarned: pointsToAdd,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: updatedOrder.orderNumber,
      paymentStatus: updatedOrder.paymentStatus,
      orderStatus: updatedOrder.orderStatus,
      message: status === 'verified'
        ? 'Pembayaran berhasil dikonfirmasi'
        : 'Pembayaran ditolak',
      pointsAwarded: status === 'verified' && order.userId
        ? Math.floor(order.finalAmount / 100)
        : 0,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Gagal mengonfirmasi pembayaran' },
      { status: 500 }
    )
  }
}
