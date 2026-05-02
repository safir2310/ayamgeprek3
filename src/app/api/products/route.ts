import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
        rating: product.rating
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
