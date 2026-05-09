import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    console.log('[GET /api/admin/check-auth] Checking auth status...')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        authenticated: false,
        reason: 'No auth header'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({
        authenticated: false,
        reason: 'Invalid token'
      })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        reason: 'User not found in database'
      })
    }

    console.log('[GET /api/admin/check-auth] User:', { email: user.email, role: user.role })

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokenRole: decoded.role
    })
  } catch (error) {
    console.error('[GET /api/admin/check-auth] Error:', error)
    return NextResponse.json({
      authenticated: false,
      reason: 'Server error'
    })
  }
}
