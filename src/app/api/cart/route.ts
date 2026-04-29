import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

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
    })

    return NextResponse.json({ cartItems })
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

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
    const { productId, quantity } = body

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
      cartItem = await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      })
    } else {
      cartItem = await db.cartItem.create({
        data: {
          userId: payload.userId,
          productId,
          quantity,
        },
      })
    }

    return NextResponse.json({ cartItem })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
