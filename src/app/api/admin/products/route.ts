import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all products for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}

    if (category && category !== 'all') {
      where.category = {
        slug: category.toLowerCase()
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch products from database with category
    const products = await db.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        discountPercent: product.discountPercent,
        stock: product.stock,
        barcode: product.barcode,
        image: product.image,
        category: product.category?.name || 'Umum',
        categoryId: product.categoryId,
        featured: product.featured,
        soldCount: product.soldCount,
        rating: product.rating,
        isPromo: !!product.discountPrice,
        promoPrice: product.discountPrice || undefined,
        createdAt: product.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil produk' },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      description,
      price,
      discountPrice,
      stock,
      category,
      image,
      barcode,
      featured
    } = body

    // Validate required fields
    if (!name || !price || stock === undefined || !category) {
      return NextResponse.json(
        { success: false, error: 'Nama, harga, stok, dan kategori wajib diisi' },
        { status: 400 }
      )
    }

    // Find or create category (check both name and slug for case-insensitive match)
    const categoryName = category.toLowerCase().trim()
    const categorySlug = categoryName.replace(/\s+/g, '-')

    let categoryRecord = await db.category.findFirst({
      where: {
        OR: [
          { name: categoryName },
          { slug: categorySlug }
        ]
      }
    })

    if (!categoryRecord) {
      // Try to create category, handle potential duplicate slug error
      try {
        categoryRecord = await db.category.create({
          data: {
            name: categoryName,
            slug: categorySlug,
            icon: '📦'
          }
        })
      } catch (createError: any) {
        // If unique constraint error, try to find by slug again
        if (createError.code === 'P2002' || createError.code === 'P2003') {
          categoryRecord = await db.category.findFirst({
            where: { slug: categorySlug }
          })
          if (!categoryRecord) {
            throw createError
          }
        } else {
          throw createError
        }
      }
    }

    // Create product
    const product = await db.product.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: description || '',
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        discountPercent: discountPrice ? Math.round(((parseFloat(price) - parseFloat(discountPrice)) / parseFloat(price)) * 100) : null,
        stock: parseInt(stock),
        barcode: barcode || null,
        image: image || null,
        featured: featured || false,
        categoryId: categoryRecord.id,
        soldCount: 0,
        rating: 0
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        discountPercent: product.discountPercent,
        stock: product.stock,
        barcode: product.barcode,
        image: product.image,
        category: product.category?.name,
        categoryId: product.categoryId,
        featured: product.featured,
        soldCount: product.soldCount,
        rating: product.rating,
        isPromo: !!product.discountPrice,
        promoPrice: product.discountPrice || undefined,
        createdAt: product.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat produk' },
      { status: 500 }
    )
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      id,
      name,
      description,
      price,
      discountPrice,
      stock,
      category,
      image,
      barcode,
      featured
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID produk wajib diisi' },
        { status: 400 }
      )
    }

    // Find or create category (check both name and slug for case-insensitive match)
    const categoryName = category.toLowerCase().trim()
    const categorySlug = categoryName.replace(/\s+/g, '-')

    let categoryRecord = await db.category.findFirst({
      where: {
        OR: [
          { name: categoryName },
          { slug: categorySlug }
        ]
      }
    })

    if (!categoryRecord) {
      // Try to create category, handle potential duplicate slug error
      try {
        categoryRecord = await db.category.create({
          data: {
            name: categoryName,
            slug: categorySlug,
            icon: '📦'
          }
        })
      } catch (createError: any) {
        // If unique constraint error, try to find by slug again
        if (createError.code === 'P2002' || createError.code === 'P2003') {
          categoryRecord = await db.category.findFirst({
            where: { slug: categorySlug }
          })
          if (!categoryRecord) {
            throw createError
          }
        } else {
          throw createError
        }
      }
    }

    // Update product
    const product = await db.product.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: name ? name.toLowerCase().replace(/\s+/g, '-') : undefined,
        description: description !== undefined ? description : undefined,
        price: price ? parseFloat(price) : undefined,
        discountPrice: discountPrice !== undefined ? (discountPrice ? parseFloat(discountPrice) : null) : undefined,
        discountPercent: discountPrice !== undefined && price
          ? Math.round(((parseFloat(price) - parseFloat(discountPrice)) / parseFloat(price)) * 100)
          : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        barcode: barcode !== undefined ? barcode : undefined,
        image: image !== undefined ? image : undefined,
        featured: featured !== undefined ? featured : undefined,
        categoryId: categoryRecord.id
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        discountPercent: product.discountPercent,
        stock: product.stock,
        barcode: product.barcode,
        image: product.image,
        category: product.category?.name,
        categoryId: product.categoryId,
        featured: product.featured,
        soldCount: product.soldCount,
        rating: product.rating,
        isPromo: !!product.discountPrice,
        promoPrice: product.discountPrice || undefined,
        createdAt: product.createdAt
      }
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate produk' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID produk wajib diisi' },
        { status: 400 }
      )
    }

    await db.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus produk' },
      { status: 500 }
    )
  }
}
