import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const debugMode = request.headers.get('x-debug') === 'true'

  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    duration: 0,
    env: {},
    steps: [],
    error: null
  }

  try {
    if (debugMode) {
      debugInfo.env.NODE_ENV = process.env.NODE_ENV
      debugInfo.env.DATABASE_URL = process.env.DATABASE_URL ? 'Found' : 'NOT FOUND'
      debugInfo.env.JWT_SECRET = process.env.JWT_SECRET ? 'Found' : 'NOT FOUND'
      debugInfo.steps.push('Step 1: Started login process')
    }

    const body = await request.json()
    const { email, password } = body

    if (debugMode) {
      debugInfo.steps.push(`Step 2: Email received: ${email}`)
      debugInfo.steps.push(`Step 3: Password provided: ${!!password}`)
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi', debug: debugMode ? debugInfo : undefined },
        { status: 400 }
      )
    }

    if (debugMode) {
      debugInfo.steps.push('Step 4: Looking up user in database...')
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      if (debugMode) {
        debugInfo.steps.push('Step 5: User NOT found')
        debugInfo.error = 'User not found in database'
      }
      return NextResponse.json(
        { error: 'Email atau password salah', debug: debugMode ? debugInfo : undefined },
        { status: 401 }
      )
    }

    if (debugMode) {
      debugInfo.steps.push(`Step 5: User found - ${user.name} (${user.role})`)
      debugInfo.steps.push('Step 6: Verifying password...')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      if (debugMode) {
        debugInfo.steps.push('Step 7: Password invalid')
        debugInfo.error = 'Password does not match'
      }
      return NextResponse.json(
        { error: 'Email atau password salah', debug: debugMode ? debugInfo : undefined },
        { status: 401 }
      )
    }

    if (debugMode) {
      debugInfo.steps.push('Step 7: Password valid')
      debugInfo.steps.push('Step 8: Generating token...')
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    if (debugMode) {
      debugInfo.steps.push(`Step 9: Token generated (length: ${token.length})`)
      debugInfo.steps.push('Step 10: Setting cookie...')
    }

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
      debug: debugMode ? debugInfo : undefined,
    })

    const isProduction = process.env.NODE_ENV === 'production'

    response.cookies.set('auth-token', token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      domain: isProduction ? '.vercel.app' : undefined,
    })

    if (debugMode) {
      debugInfo.duration = Date.now() - startTime
      debugInfo.steps.push(`Step 11: Login successful! (Duration: ${debugInfo.duration}ms)`)
    }

    return response
  } catch (error: any) {
    debugInfo.error = {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack?.substring(0, 500)
    }
    debugInfo.duration = Date.now() - startTime

    console.error('❌ Login error:', error.message)

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

    return NextResponse.json(
      { error: errorMessage, debug: debugMode ? debugInfo : undefined },
      { status: 500 }
    )
  }
}
