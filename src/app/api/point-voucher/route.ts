import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// POST - Validate and apply point voucher
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

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Kode voucher harus diisi' },
        { status: 400 }
      )
    }

    // Find the point voucher
    const voucher = await db.pointVoucher.findUnique({
      where: { code },
      include: { user: true },
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

    // Get product details
    const product = await db.product.findUnique({
      where: { id: voucher.productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      voucher: {
        code: voucher.code,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        isFree: true,
      },
    })
  } catch (error) {
    console.error('Error validating voucher:', error)
    return NextResponse.json(
      { error: 'Gagal memvalidasi voucher' },
      { status: 500 }
    )
  }
}
