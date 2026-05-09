import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// PUT - Update point redemption option (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if redemption exists
    const existingRedemption = await db.pointRedemption.findUnique({
      where: { id: params.id },
    })

    if (!existingRedemption) {
      return NextResponse.json(
        { error: 'Menu penukaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate pointsRequired if provided
    let points = existingRedemption.pointsRequired
    if (pointsRequired !== undefined) {
      points = parseInt(pointsRequired)
      if (isNaN(points) || points <= 0) {
        return NextResponse.json(
          { error: 'Poin harus berupa angka positif' },
          { status: 400 }
        )
      }
    }

    // Validate productId if provided
    if (productId !== undefined && productId !== null) {
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

    // Update point redemption option
    const redemption = await db.pointRedemption.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        pointsRequired: points,
        ...(productId !== undefined && { productId }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(active !== undefined && { active }),
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
    console.error('Error updating point redemption:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate menu penukaran poin' },
      { status: 500 }
    )
  }
}

// DELETE - Delete point redemption option (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if redemption exists
    const existingRedemption = await db.pointRedemption.findUnique({
      where: { id: params.id },
    })

    if (!existingRedemption) {
      return NextResponse.json(
        { error: 'Menu penukaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete point redemption option
    await db.pointRedemption.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Menu penukaran berhasil dihapus',
    })
  } catch (error) {
    console.error('Error deleting point redemption:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus menu penukaran poin' },
      { status: 500 }
    )
  }
}
