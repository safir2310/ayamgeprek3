import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, menuId, menuName } = body

    console.log('Menu access request:', { userId, menuId, menuName })

    if (!userId || !menuId) {
      console.error('Missing required fields:', { userId, menuId })
      return NextResponse.json(
        { success: false, error: 'userId and menuId are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.error('User not found:', userId)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('User found, proceeding with upsert...')

    // Use upsert to either create new or update existing menu access
    await db.menuAccess.upsert({
      where: {
        userId_menuId: {
          userId,
          menuId
        }
      },
      update: {
        accessCount: {
          increment: 1
        },
        lastAccessedAt: new Date(),
        menuName: menuName || menuId
      },
      create: {
        userId,
        menuId,
        menuName: menuName || menuId,
        accessCount: 1,
        lastAccessedAt: new Date()
      }
    })

    console.log('Menu access tracked successfully')

    return NextResponse.json({
      success: true,
      message: 'Menu access tracked successfully'
    })
  } catch (error) {
    console.error('Error in menu-access route:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track menu access', details: String(error) },
      { status: 500 }
    )
  }
}
