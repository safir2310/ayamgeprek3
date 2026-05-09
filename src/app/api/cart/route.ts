import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// GET - Fetch user's cart items
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: payload.userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform cart items to match frontend format
    const formattedCartItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      discountPrice: item.product.discountPrice,
      quantity: item.quantity,
      image: item.product.image,
      barcode: item.product.barcode,
      category: item.product.category?.name,
    }))

    return NextResponse.json({
      success: true,
      cartItems: formattedCartItems,
    })
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// POST - Add item to cart or update quantity
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const existingCartItem = await db.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: payload.userId,
          productId,
        },
      },
    })

    let cartItem
    if (existingCartItem) {
      // Update quantity
      cartItem = await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: {
          product: true,
        },
      })
    } else {
      // Create new cart item
      cartItem = await db.cartItem.create({
        data: {
          userId: payload.userId,
          productId,
          quantity,
        },
        include: {
          product: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      cartItem: {
        id: cartItem.id,
        productId: cartItem.productId,
        name: cartItem.product.name,
        price: cartItem.product.price,
        discountPrice: cartItem.product.discountPrice,
        quantity: cartItem.quantity,
        image: cartItem.product.image,
        barcode: cartItem.product.barcode,
      },
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (quantity < 0) {
      return NextResponse.json({ error: 'Quantity must be at least 0' }, { status: 400 })
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await db.cartItem.deleteMany({
        where: {
          userId: payload.userId,
          productId,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart',
      })
    }

    // Update quantity
    const cartItem = await db.cartItem.updateMany({
      where: {
        userId: payload.userId,
        productId,
      },
      data: { quantity },
    })

    if (cartItem.count === 0) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Cart item updated',
    })
  } catch (error) {
    console.error('Update cart error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE - Remove item from cart or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (productId) {
      // Remove specific item
      await db.cartItem.deleteMany({
        where: {
          userId: payload.userId,
          productId,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart',
      })
    } else {
      // Clear entire cart
      await db.cartItem.deleteMany({
        where: { userId: payload.userId },
      })

      return NextResponse.json({
        success: true,
        message: 'Cart cleared',
      })
    }
  } catch (error) {
    console.error('Delete cart error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
