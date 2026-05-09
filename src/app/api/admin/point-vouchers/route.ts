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
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Trust the token's role directly instead of querying database
    // This allows auto-login to work without modifying the database user role
    if (decoded.role !== 'admin') {
      console.log('[API] User is not admin, role from token:', decoded.role)
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
