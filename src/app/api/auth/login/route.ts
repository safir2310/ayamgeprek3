import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  console.log('🔐 Login attempt started...')
  
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('📧 Login email:', email)

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking up user in database...')
    
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('❌ User not found:', email)
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    console.log('✅ User found:', user.name, '-', user.role)
    console.log('🔑 Verifying password...')

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log('❌ Invalid password')
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    console.log('✅ Password valid')
    console.log('🔐 Generating token...')

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    console.log('✅ Token generated successfully, length:', token.length)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        memberLevel: user.memberLevel,
        points: user.points,
        stampCount: user.stampCount,
        starCount: user.starCount,
      },
      token,
    })

    console.log('🍪 Setting cookie...')
    console.log('   Secure:', process.env.NODE_ENV === 'production')
    console.log('   SameSite: lax')
    console.log('   MaxAge: 7 days')
    
    // Get the domain for production
    const isProduction = process.env.NODE_ENV === 'production'
    const domain = isProduction ? '.vercel.app' : undefined

    response.cookies.set('auth-token', token, {
      httpOnly: false, // Set to false for development debugging
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      domain: isProduction ? '.vercel.app' : undefined,
    })

    console.log('✅ Cookie set successfully')
    console.log('🎉 Login successful!')
    console.log('================================')

    return response
  } catch (error: any) {
    console.error('❌ Login error:', error)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code,
    })
    
    // Provide more specific error messages
    let errorMessage = 'Terjadi kesalahan saat login'
    
    if (error.message?.includes('connect') || error.code === 'ECONNREFUSED') {
      errorMessage = 'Gagal menghubungi database. Silakan coba lagi.'
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Koneksi database timeout. Silakan coba lagi.'
    } else if (error.message?.includes('P1001') || error.message?.includes('P2002')) {
      errorMessage = 'Database sedang sibuk. Silakan coba lagi.'
    } else if (error.message?.includes('EPIPE')) {
      errorMessage = 'Koneksi database terputus. Silakan coba lagi.'
    }
    
    console.log('Returning error to client:', errorMessage)
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
