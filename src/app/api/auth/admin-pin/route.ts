import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

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

    // Get or create the admin user from database
    let adminUser = await db.user.findFirst({
      where: {
        role: 'admin',
        email: 'admin@ayamgeprek.com'
      }
    })

    console.log('[AdminPIN] Found admin user:', adminUser ? 'Yes' : 'No')

    // Create admin user if doesn't exist
    if (!adminUser) {
      console.log('[AdminPIN] Creating new admin user...')
      const hashedPassword = await hash('admin123', 10)

      adminUser = await db.user.create({
        data: {
          email: 'admin@ayamgeprek.com',
          password: hashedPassword,
          name: 'Administrator',
          role: 'admin',
          memberLevel: 'Platinum',
          points: 0,
          stampCount: 0,
          starCount: 0,
          phone: '085260812758',
          address: 'Jl. Medan – Banda Aceh, Simpang Camat, Gampong Tijue, 24151',
        }
      })
      console.log('[AdminPIN] Created admin user, ID:', adminUser.id)
    } else {
      console.log('[AdminPIN] Existing admin user, ID:', adminUser.id, 'Role:', adminUser.role)
    }

    // Generate admin token with real user ID
    const token = await signToken({
      userId: adminUser.id,
      email: adminUser.email || 'admin@ayamgeprek.com',
      role: 'admin',
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
    console.error('Admin PIN error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
