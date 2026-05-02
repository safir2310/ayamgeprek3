import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newAddress, currentPassword } = body

    if (!userId || !newAddress || !currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Password saat ini salah' },
        { status: 401 }
      )
    }

    // Update address
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { address: newAddress }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        memberLevel: updatedUser.memberLevel,
        points: updatedUser.points,
        stampCount: updatedUser.stampCount,
        starCount: updatedUser.starCount,
        role: updatedUser.role,
        profilePhoto: updatedUser.profilePhoto,
        theme: updatedUser.theme,
        notificationSound: updatedUser.notificationSound,
      }
    })
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengubah alamat' },
      { status: 500 }
    )
  }
}
