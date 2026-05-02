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
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ redemptions })
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

    const { name, description, pointsRequired, productId, productImage, active, order } = await request.json()

    // Validate required fields
    if (!name || !description || !pointsRequired || !productId) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Validate pointsRequired
    if (pointsRequired < 0) {
      return NextResponse.json(
        { error: 'Poin harus bernilai positif' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create point redemption option
    const redemption = await db.pointRedemption.create({
      data: {
        name,
        description,
        pointsRequired,
        productId,
        productImage: productImage || product.image || null,
        active: active !== undefined ? active : true,
        order: order || 0,
      },
    })

    return NextResponse.json({
      success: true,
      redemption,
    })
  } catch (error) {
    console.error('Error creating point redemption:', error)
    return NextResponse.json(
      { error: 'Gagal membuat opsi penukaran poin' },
      { status: 500 }
    )
  }
}

// PUT - Update point redemption option (admin only)
export async function PUT(request: NextRequest) {
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

    const { id, name, description, pointsRequired, productId, productImage, active, order } = await request.json()

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'ID opsi penukaran wajib diisi' },
        { status: 400 }
      )
    }

    // Check if redemption option exists
    const existingRedemption = await db.pointRedemption.findUnique({
      where: { id },
    })

    if (!existingRedemption) {
      return NextResponse.json(
        { error: 'Opsi penukaran poin tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate pointsRequired if provided
    if (pointsRequired !== undefined && pointsRequired < 0) {
      return NextResponse.json(
        { error: 'Poin harus bernilai positif' },
        { status: 400 }
      )
    }

    // Check if product exists (if productId is being changed)
    if (productId && productId !== existingRedemption.productId) {
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
    const updatedRedemption = await db.pointRedemption.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(pointsRequired !== undefined && { pointsRequired }),
        ...(productId !== undefined && { productId }),
        ...(productImage !== undefined && { productImage }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({
      success: true,
      redemption: updatedRedemption,
    })
  } catch (error) {
    console.error('Error updating point redemption:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate opsi penukaran poin' },
      { status: 500 }
    )
  }
}

// DELETE - Delete point redemption option (admin only)
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID opsi penukaran wajib diisi' },
        { status: 400 }
      )
    }

    // Check if redemption option exists
    const existingRedemption = await db.pointRedemption.findUnique({
      where: { id },
    })

    if (!existingRedemption) {
      return NextResponse.json(
        { error: 'Opsi penukaran poin tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete point redemption option
    await db.pointRedemption.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Opsi penukaran poin berhasil dihapus',
    })
  } catch (error) {
    console.error('Error deleting point redemption:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus opsi penukaran poin' },
      { status: 500 }
    )
  }
}
