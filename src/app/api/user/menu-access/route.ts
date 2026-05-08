import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, menuId, menuName } = body

    if (!userId || !menuId) {
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
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if menu access tracking already exists
    const existingAccess = await db.menuAccess.findFirst({
      where: {
        userId_menuId: {
          userId,
          menuId
        }
      }
    })

    if (existingAccess) {
      // Update access count and last accessed time
      await db.menuAccess.update({
        where: { id: existingAccess.id },
        data: {
          accessCount: existingAccess.accessCount + 1,
          lastAccessedAt: new Date()
        }
      })
    } else {
      // Create new menu access record
      await db.menuAccess.create({
        data: {
          userId,
          menuId,
          menuName: menuName || menuId,
          accessCount: 1,
          lastAccessedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Menu access tracked successfully'
    })
  } catch (error) {
    console.error('Error tracking menu access:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track menu access' },
      { status: 500 }
    )
  }
}
