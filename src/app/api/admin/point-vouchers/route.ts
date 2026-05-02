import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all point vouchers (admin only)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all point vouchers with user info
    const vouchers = await db.pointVoucher.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      vouchers: vouchers.map((v) => ({
        ...v,
        userName: v.user.name,
        userEmail: v.user.email,
        user: undefined, // Remove nested user object
      })),
    })
  } catch (error) {
    console.error('Error fetching point vouchers:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data voucher' },
      { status: 500 }
    )
  }
}
