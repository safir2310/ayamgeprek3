import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Fetch featured products
    const featuredProducts = await db.product.findMany({
      where: {
        featured: true
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Fetch all categories
    const categories = await db.category.findMany({
      orderBy: {
        order: 'asc'
      },
      take: 8
    })

    // Fetch new arrivals (latest products)
    const newProducts = await db.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 8
    })

    // Fetch best selling products
    const bestSelling = await db.product.findMany({
      where: {
        stock: {
          gt: 0
        }
      },
      include: {
        category: true
      },
      orderBy: {
        soldCount: 'desc'
      },
      take: 8
    })

    // Fetch active vouchers
    const now = new Date()
    const vouchers = await db.voucher.findMany({
      where: {
        status: 'active',
        startDate: {
          lte: now
        },
        endDate: {
          gte: now
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({
      success: true,
      data: {
        featuredProducts: featuredProducts.map(product => ({
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
        })),
        categories: categories.map(category => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          order: category.order
        })),
        newProducts: newProducts.map(product => ({
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
        })),
        bestSelling: bestSelling.map(product => ({
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
        })),
        vouchers: vouchers.map(voucher => ({
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          description: voucher.description,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          minPurchase: voucher.minPurchase,
          maxDiscount: voucher.maxDiscount,
          startDate: voucher.startDate.toISOString(),
          endDate: voucher.endDate.toISOString(),
          usageLimit: voucher.usageLimit,
          usageCount: voucher.usageCount
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching home data:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data beranda' },
      { status: 500 }
    )
  }
}
