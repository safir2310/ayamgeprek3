import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all vouchers
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

    // Fetch all vouchers
    const vouchers = await db.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      vouchers: vouchers.map(v => ({
        id: v.id,
        code: v.code,
        name: v.name,
        description: v.description,
        discountType: v.discountType,
        discountValue: v.discountValue,
        minOrderAmount: v.minPurchase,
        maxDiscountAmount: v.maxDiscount,
        startDate: v.startDate,
        endDate: v.endDate,
        usageLimit: v.usageLimit,
        usageCount: v.usageCount,
        isActive: v.status === 'active',
        createdAt: v.createdAt,
      })),
    })
  } catch (error) {
    console.error('[API] Error fetching vouchers:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data voucher' },
      { status: 500 }
    )
  }
}

// POST - Create or update voucher
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
      id,
      code,
      name,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      isActive
    } = body

    if (!code || !name || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Mohon lengkapi semua data yang diperlukan' },
        { status: 400 }
      )
    }

    if (id) {
      // Update existing voucher
      const voucher = await db.voucher.update({
        where: { id },
        data: {
          code: code.toUpperCase(),
          name,
          description: description || null,
          discountType,
          discountValue: parseInt(discountValue),
          minPurchase: minOrderAmount ? parseInt(minOrderAmount) : 0,
          maxDiscount: maxDiscountAmount ? parseInt(maxDiscountAmount) : null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          status: isActive ? 'active' : 'inactive',
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Voucher berhasil diperbarui',
        voucher: {
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          description: voucher.description,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          minOrderAmount: voucher.minPurchase,
          maxDiscountAmount: voucher.maxDiscount,
          startDate: voucher.startDate,
          endDate: voucher.endDate,
          usageLimit: voucher.usageLimit,
          usageCount: voucher.usageCount,
          isActive: voucher.status === 'active',
          createdAt: voucher.createdAt,
        },
      })
    } else {
      // Create new voucher
      const voucher = await db.voucher.create({
        data: {
          code: code.toUpperCase(),
          name,
          description: description || null,
          discountType,
          discountValue: parseInt(discountValue),
          minPurchase: minOrderAmount ? parseInt(minOrderAmount) : 0,
          maxDiscount: maxDiscountAmount ? parseInt(maxDiscountAmount) : null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          usageCount: 0,
          status: isActive ? 'active' : 'inactive',
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Voucher berhasil ditambahkan',
        voucher: {
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          description: voucher.description,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          minOrderAmount: voucher.minPurchase,
          maxDiscountAmount: voucher.maxDiscount,
          startDate: voucher.startDate,
          endDate: voucher.endDate,
          usageLimit: voucher.usageLimit,
          usageCount: voucher.usageCount,
          isActive: voucher.status === 'active',
          createdAt: voucher.createdAt,
        },
      })
    }
  } catch (error) {
    console.error('[API] Error saving voucher:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan voucher' },
      { status: 500 }
    )
  }
}

// DELETE - Delete voucher
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
        { success: false, error: 'ID voucher diperlukan' },
        { status: 400 }
      )
    }

    await db.voucher.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Voucher berhasil dihapus',
    })
  } catch (error) {
    console.error('[API] Error deleting voucher:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus voucher' },
      { status: 500 }
    )
  }
}
