import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Update user profile and preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      name,
      phone,
      address,
      profilePhoto,
      theme,
      notificationSound
    } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID diperlukan' },
        { status: 400 }
      )
    }

    // Update user
    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(profilePhoto !== undefined && { profilePhoto }),
        ...(theme !== undefined && { theme }),
        ...(notificationSound !== undefined && { notificationSound }),
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePhoto: user.profilePhoto,
        theme: user.theme,
        notificationSound: user.notificationSound,
        memberLevel: user.memberLevel,
        points: user.points,
        stampCount: user.stampCount,
        starCount: user.starCount,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate profile' },
      { status: 500 }
    )
  }
}
