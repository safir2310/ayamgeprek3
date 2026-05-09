import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password)
    if (!isValidPassword) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Password lama salah' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        password: hashedPassword,
      },
    })

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah',
    })
  } catch (error) {
    console.error('Change password error:', error)
    try {
      await prisma.$disconnect()
    } catch (e) {
      // Ignore disconnect error
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah password' },
      { status: 500 }
    )
  }
}
