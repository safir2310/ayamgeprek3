import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'

const ADMIN_PIN = '1234' // Default admin PIN

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pin } = body

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN wajib diisi' },
        { status: 400 }
      )
    }

    if (pin !== ADMIN_PIN) {
      return NextResponse.json(
        { error: 'PIN salah' },
        { status: 401 }
      )
    }

    // Generate admin token
    const token = await signToken({
      userId: 'admin',
      email: 'admin@ayamgeprek.com',
      role: 'admin',
    })

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: 'admin',
        email: 'admin@ayamgeprek.com',
        name: 'Administrator',
        role: 'admin',
        memberLevel: 'Platinum',
        points: 0,
        stampCount: 0,
        starCount: 0,
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Admin PIN error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
