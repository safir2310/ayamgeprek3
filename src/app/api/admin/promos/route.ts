import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all promos
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Trust token's role directly instead of querying database
    if (decoded.role !== 'admin') {
      console.log('[API] User is not admin, role from token:', decoded.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all promos with product info
    const promos = await db.product.findMany({
      where: {
        isPromo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      promos: promos.map(p => ({
        id: p.id,
        productId: p.id,
        productName: p.name,
        productImage: p.image || '',
        originalPrice: p.price,
        promoPrice: p.discountPrice || 0,
        discountPercent: p.discountPercent || 0,
        startDate: p.createdAt,
        endDate: p.updatedAt,
        isActive: p.isPromo,
        createdAt: p.createdAt,
      })),
    })
  } catch (error) {
    console.error('[API] Error fetching promos:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data promo' },
      { status: 500 }
    )
  }
}

// POST - Create or update promo
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (decoded.role !== 'admin') {
      console.log('[API] User is not admin, role from token:', decoded.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      productId,
      originalPrice,
      promoPrice,
      startDate,
      endDate,
      isActive = true,
    } = body

    if (!productId || !originalPrice || !promoPrice) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    if (promoPrice >= originalPrice) {
      return NextResponse.json(
        { success: false, error: 'Harga promo harus lebih rendah dari harga asli' },
        { status: 400 }
      )
    }

    const discountPercent = Math.round(((originalPrice - promoPrice) / originalPrice) * 100)

    const product = await db.product.update({
      where: { id: productId },
      data: {
        discountPrice: promoPrice,
        discountPercent: discountPercent,
        isPromo: isActive,
        updatedAt: new Date(endDate),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Promo berhasil disimpan',
      promo: {
        id: product.id,
        productId: product.id,
        productName: product.name,
        productImage: product.image || '',
        originalPrice,
        promoPrice,
        discountPercent,
        startDate: product.createdAt,
        endDate: product.updatedAt,
        isActive: product.isPromo,
        createdAt: product.createdAt,
      },
    })
  } catch (error) {
    console.error('[API] Error saving promo:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan promo' },
      { status: 500 }
    )
  }
}

// DELETE - Delete promo
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (decoded.role !== 'admin') {
      console.log('[API] User is not admin, role from token:', decoded.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID promo diperlukan' },
        { status: 400 }
      )
    }

    await db.product.update({
      where: { id },
      data: {
        isPromo: false,
        discountPrice: null,
        discountPercent: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Promo berhasil dihapus',
    })
  } catch (error) {
    console.error('[API] Error deleting promo:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus promo' },
      { status: 500 }
    )
  }
}
