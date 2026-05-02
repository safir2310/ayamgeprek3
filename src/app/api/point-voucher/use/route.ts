import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// POST - Mark point voucher as used
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { code, orderId } = await request.json()

    if (!code || !orderId) {
      return NextResponse.json(
        { error: 'Kode voucher dan Order ID harus diisi' },
        { status: 400 }
      )
    }

    // Find and update the voucher
    const voucher = await db.pointVoucher.findUnique({
      where: { code },
    })

    if (!voucher) {
      return NextResponse.json(
        { error: 'Kode voucher tidak valid' },
        { status: 404 }
      )
    }

    // Check if voucher belongs to the user
    if (voucher.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Kode voucher tidak berlaku untuk akun ini' },
        { status: 403 }
      )
    }

    // Check if voucher is already used
    if (voucher.isUsed) {
      return NextResponse.json(
        { error: 'Kode voucher sudah digunakan' },
        { status: 400 }
      )
    }

    // Mark voucher as used
    await db.pointVoucher.update({
      where: { id: voucher.id },
      data: {
        isUsed: true,
        usedOrderId: orderId,
        usedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking voucher as used:', error)
    return NextResponse.json(
      { error: 'Gagal menandai voucher sebagai digunakan' },
      { status: 500 }
    )
  }
}
