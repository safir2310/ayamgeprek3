import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { cart, customerName, customerPhone, customerAddress, paymentMethod, voucherCode, pointVoucherCode } = body

    // Get user info
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate total
    let totalAmount = cart.reduce((sum: number, item: any) => {
      const price = item.discountPrice || item.price
      return sum + price * item.quantity
    }, 0)

    let discountAmount = 0
    let voucher = null
    let pointVoucher = null
    let freeProductId = null

    // Apply point voucher if provided
    if (pointVoucherCode) {
      pointVoucher = await db.pointVoucher.findUnique({
        where: { code: pointVoucherCode },
      })

      if (!pointVoucher) {
        return NextResponse.json(
          { error: 'Kode voucher poin tidak valid' },
          { status: 404 }
        )
      }

      // Check if voucher belongs to the user
      if (pointVoucher.userId !== payload.userId) {
        return NextResponse.json(
          { error: 'Kode voucher poin tidak berlaku untuk akun ini' },
          { status: 403 }
        )
      }

      // Check if voucher is already used
      if (pointVoucher.isUsed) {
        return NextResponse.json(
          { error: 'Kode voucher poin sudah digunakan' },
          { status: 400 }
        )
      }

      // Point voucher gives a free product (no discount on total)
      // Voucher will be marked as used by the frontend after successful checkout
      freeProductId = pointVoucher.productId
    }

    // Apply regular voucher if provided
    if (voucherCode && !pointVoucherCode) {
      voucher = await db.voucher.findUnique({
        where: { code: voucherCode },
      })

      if (!voucher) {
        return NextResponse.json(
          { error: 'Kode voucher tidak ditemukan' },
          { status: 404 }
        )
      }

      if (voucher.status !== 'active') {
        return NextResponse.json(
          { error: 'Voucher tidak aktif' },
          { status: 400 }
        )
      }

      const now = new Date()
      if (now < voucher.startDate || now > voucher.endDate) {
        return NextResponse.json(
          { error: 'Voucher sudah kadaluarsa atau belum aktif' },
          { status: 400 }
        )
      }

      if (totalAmount < voucher.minPurchase) {
        return NextResponse.json(
          { error: `Minimum belanja Rp ${voucher.minPurchase.toLocaleString()} untuk menggunakan voucher ini` },
          { status: 400 }
        )
      }

      if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
        return NextResponse.json(
          { error: 'Voucher sudah mencapai batas penggunaan' },
          { status: 400 }
        )
      }

      // Calculate discount
      if (voucher.discountType === 'percentage') {
        discountAmount = Math.floor(totalAmount * (voucher.discountValue / 100))
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount
        }
      } else {
        discountAmount = voucher.discountValue
      }
    }

    // Calculate points
    const pointsEarned = Math.floor(totalAmount / 1000) // 1 point per Rp 1,000
    const finalAmount = totalAmount - discountAmount

    // Generate order number
    const orderNumber = `ORD${Date.now()}`
    const qrCode = paymentMethod === 'QRIS' ? `QR${Date.now()}` : null

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: user.id,
        customerName: customerName || user.name || 'Pelanggan',
        customerPhone: customerPhone || user.phone || '-',
        customerAddress: customerAddress || user.address || '-',
        totalAmount,
        discountAmount,
        finalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'QRIS' ? 'pending' : 'pending',
        orderStatus: 'pending',
        voucherCode: voucher?.code,
        pointVoucherCode: pointVoucher?.code || null,
        pointsEarned,
        qrCode,
      },
    })

    // Create order items and update products
    const validItems: any[] = []
    for (const item of cart) {
      const price = item.discountPrice || item.price
      const discount = item.discountPrice ? item.price - item.discountPrice : 0

      // Check if product exists
      const product = await db.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        console.warn(`Product ${item.productId} not found, skipping`)
        continue
      }

      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          discount,
          subtotal: price * item.quantity,
        },
      })

      // Update product sold count
      await db.product.update({
        where: { id: item.productId },
        data: {
          soldCount: { increment: item.quantity },
          stock: { decrement: item.quantity },
        },
      })

      validItems.push(item)
    }

    // Check if there are any valid items
    if (validItems.length === 0) {
      // Delete the order if no valid items
      await db.order.delete({
        where: { id: order.id },
      })
      return NextResponse.json(
        { error: 'Tidak ada produk valid di keranjang. Silakan tambahkan produk ulang.' },
        { status: 400 }
      )
    }

    // Update user points
    await db.user.update({
      where: { id: user.id },
      data: {
        points: { increment: pointsEarned },
      },
    })

    // Create point history
    await db.pointHistory.create({
      data: {
        userId: user.id,
        type: 'earned',
        points: pointsEarned,
        orderId: order.id,
        description: `Poin dari order #${orderNumber}`,
      },
    })

    // Update voucher usage
    if (voucher && discountAmount > 0) {
      await db.voucher.update({
        where: { id: voucher.id },
        data: {
          usageCount: { increment: 1 },
        },
      })

      await db.voucherUsage.create({
        data: {
          voucherId: voucher.id,
          userId: user.id,
          orderId: order.id,
          discount: discountAmount,
        },
      })
    }

    // Create payment record
    await db.payment.create({
      data: {
        orderId: order.id,
        amount: finalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'QRIS' ? 'pending' : 'pending',
        qrCode,
        expiryDate: paymentMethod === 'QRIS' ? new Date(Date.now() + 30 * 60 * 1000) : null, // 30 min expiry
      },
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        discountAmount: order.discountAmount,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        qrCode: order.qrCode,
        pointsEarned: order.pointsEarned,
      },
    })
  } catch (error) {
    console.error('Checkout error:', error)
    
    // Provide more detailed error messages
    if (error instanceof Error) {
      // Check for specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Gagal membuat order. Silakan coba lagi.' },
          { status: 400 }
        )
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Data produk tidak valid. Silakan refresh halaman.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: error.message || 'Terjadi kesalahan saat checkout' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat checkout' },
      { status: 500 }
    )
  }
}
