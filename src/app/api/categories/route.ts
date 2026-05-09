import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      include: {
        products: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Format the response with product count
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      order: category.order,
      productCount: category.products.length
    }))

    return NextResponse.json({
      success: true,
      categories: formattedCategories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil kategori' },
      { status: 500 }
    )
  }
}
