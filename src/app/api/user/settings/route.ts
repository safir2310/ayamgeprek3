// API Routes for User Settings
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
        language: user.language,
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
    const { userId, theme, notificationSound, profilePrivate, emailNotifications, smsNotifications, language } = body

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
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(theme !== undefined && { theme }),
        ...(notificationSound !== undefined && { notificationSound }),
        ...(profilePrivate !== undefined && { profilePrivate }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(smsNotifications !== undefined && { smsNotifications }),
        ...(language !== undefined && { language }),
      },
    })

    return NextResponse.json({
      settings: {
        theme: updatedUser.theme,
        notificationSound: updatedUser.notificationSound,
        profilePrivate: updatedUser.profilePrivate,
        emailNotifications: updatedUser.emailNotifications,
        smsNotifications: updatedUser.smsNotifications,
        language: updatedUser.language,
      },
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
