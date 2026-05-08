import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get user settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        theme: true,
        notificationSound: true,
        profilePrivate: true,
        emailNotifications: true,
        smsNotifications: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      settings: {
        theme: user.theme,
        notificationSound: user.notificationSound,
        profilePrivate: user.profilePrivate,
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
      }
    })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, theme, notificationSound } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user settings
    const updatedSettings = await db.user.update({
      where: { id: userId },
      data: {
        ...(theme !== undefined && { theme }),
        ...(notificationSound !== undefined && { notificationSound }),
        ...(profilePrivate !== undefined && { profilePrivate }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(smsNotifications !== undefined && { smsNotifications }),
      },
      select: {
        id: true,
        theme: true,
        notificationSound: true,
        profilePrivate: true,
        emailNotifications: true,
        smsNotifications: true,
      }
    })

    return NextResponse.json({
      settings: updatedSettings,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
