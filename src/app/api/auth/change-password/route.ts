import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jwtPayload = await verifyToken(token)

    if (!jwtPayload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Password saat ini dan baru wajib diisi' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: jwtPayload.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Password saat ini salah' }, { status: 401 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db.user.update({
      where: { id: jwtPayload.userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah'
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Gagal mengubah password' }, { status: 500 })
  }
}
