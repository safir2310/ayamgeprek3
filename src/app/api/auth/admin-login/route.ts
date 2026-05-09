import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { compare } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Find admin user
    const adminUser = await db.user.findFirst({
      where: {
        role: 'admin',
        email: email,
      }
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify password
    const isPasswordValid = await compare(password, adminUser.password || '')

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      )
    }

    // Generate admin token
    const token = await signToken({
      userId: adminUser.id,
      email: adminUser.email || '',
      role: adminUser.role,
    })

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        memberLevel: adminUser.memberLevel,
        points: adminUser.points,
        stampCount: adminUser.stampCount,
        starCount: adminUser.starCount,
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
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
