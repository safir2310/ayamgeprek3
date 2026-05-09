import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all point redemption options (admin only)
export async function GET(request: NextRequest) {
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

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all point redemption options
    const redemptions = await db.pointRedemption.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json({
      redemptions: redemptions.map((r) => ({
        ...r,
        product: r.product,
      })),
    })
  } catch (error) {
    console.error('Error fetching point redemptions:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data penukaran poin' },
      { status: 500 }
    )
  }
}

// POST - Create new point redemption option (admin only)
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

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, pointsRequired, productId, order, active } = body

    // Validate required fields
    if (!name || !pointsRequired) {
      return NextResponse.json(
        { error: 'Nama dan poin yang dibutuhkan harus diisi' },
        { status: 400 }
      )
    }

    // Validate pointsRequired
    const points = parseInt(pointsRequired)
    if (isNaN(points) || points <= 0) {
      return NextResponse.json(
        { error: 'Poin harus berupa angka positif' },
        { status: 400 }
      )
    }

    // Validate productId if provided
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId },
      })
      if (!product) {
        return NextResponse.json(
          { error: 'Produk tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    // Create point redemption option
    const redemption = await db.pointRedemption.create({
      data: {
        name,
        description: description || '',
        pointsRequired: points,
        productId: productId || null,
        order: order ? parseInt(order) : 0,
        active: active !== undefined ? active : true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      redemption: {
        ...redemption,
        product: redemption.product,
      },
    })
  } catch (error) {
    console.error('Error creating point redemption:', error)
    return NextResponse.json(
      { error: 'Gagal membuat menu penukaran poin' },
      { status: 500 }
    )
  }
}
