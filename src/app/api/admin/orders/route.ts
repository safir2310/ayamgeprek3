import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all orders for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}

    if (status && status !== 'all') {
      where.orderStatus = status
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch orders from database
    const orders = await db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.user?.email,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.product?.name || item.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
          image: item.product?.image
        })),
        subtotal: order.totalAmount,
        tax: Math.round(order.totalAmount * 0.1),
        total: order.finalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil pesanan' },
      { status: 500 }
    )
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, orderStatus, paymentStatus } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pesanan wajib diisi' },
        { status: 400 }
      )
    }

    // Validate status values
    const validOrderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled']
    const validPaymentStatuses = ['pending', 'paid', 'verified', 'rejected', 'failed']

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { success: false, error: 'Status pesanan tidak valid' },
        { status: 400 }
      )
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, error: 'Status pembayaran tidak valid' },
        { status: 400 }
      )
    }

    // Get current order for comparison
    const currentOrder = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!currentOrder) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update order
    const order = await db.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    // If order is completed and wasn't before, update product sold count
    if (orderStatus && (orderStatus === 'completed' || orderStatus === 'shipped') && currentOrder.orderStatus !== orderStatus) {
      for (const item of order.items) {
        if (item.product) {
          await db.product.update({
            where: { id: item.product.id },
            data: {
              soldCount: {
                increment: item.quantity
              }
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.user?.email,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.product?.name || item.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
          image: item.product?.image
        })),
        subtotal: order.totalAmount,
        tax: Math.round(order.totalAmount * 0.1),
        total: order.finalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate pesanan' },
      { status: 500 }
    )
  }
}

// DELETE - Delete order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pesanan wajib diisi' },
        { status: 400 }
      )
    }

    await db.order.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus pesanan' },
      { status: 500 }
    )
  }
}
