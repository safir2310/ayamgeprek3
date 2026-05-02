import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST - Reset password with token
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword, userId } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token dan password baru harus diisi' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // If userId is provided, use it to find the user
    // Otherwise, we would need to validate the token against the database
    let user
    if (userId) {
      user = await db.user.findUnique({
        where: { id: userId },
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Gagal mengubah password' },
      { status: 500 }
    )
  }
}
