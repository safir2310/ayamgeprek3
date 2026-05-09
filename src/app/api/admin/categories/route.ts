import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all categories
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

    // Fetch all categories
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        order: c.order,
        productCount: c._count.products,
        createdAt: c.createdAt,
      })),
    })
  } catch (error) {
    console.error('[API] Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data kategori' },
      { status: 500 }
    )
  }
}

// POST - Create or update category
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
    const { id, name, description, icon, order } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nama kategori wajib diisi' },
        { status: 400 }
      )
    }

    if (id) {
      // Update existing category
      const category = await db.category.update({
        where: { id },
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          description: description || null,
          icon: icon || '📦',
          order: order || 0,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Kategori berhasil diperbarui',
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          order: category.order,
          productCount: 0,
          createdAt: category.createdAt,
        },
      })
    } else {
      // Create new category
      const slug = name.toLowerCase().replace(/\s+/g, '-')
      
      const category = await db.category.create({
        data: {
          name,
          slug,
          description: description || null,
          icon: icon || '📦',
          order: order || 0,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Kategori berhasil ditambahkan',
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          order: category.order,
          productCount: 0,
          createdAt: category.createdAt,
        },
      })
    }
  } catch (error) {
    console.error('[API] Error saving category:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan kategori' },
      { status: 500 }
    )
  }
}

// DELETE - Delete category
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
        { success: false, error: 'ID kategori diperlukan' },
        { status: 400 }
      )
    }

    await db.category.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus',
    })
  } catch (error) {
    console.error('[API] Error deleting category:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus kategori' },
      { status: 500 }
    )
  }
}
