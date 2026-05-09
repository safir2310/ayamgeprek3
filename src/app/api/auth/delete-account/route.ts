import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jwtPayload = await verifyToken(token)

    if (!jwtPayload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: jwtPayload.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete all orders associated with the user
    await db.order.deleteMany({
      where: { userId: jwtPayload.userId },
    })

    // Delete the user
    await db.user.delete({
      where: { id: jwtPayload.userId },
    })

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dihapus'
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Gagal menghapus akun' }, { status: 500 })
  }
}
