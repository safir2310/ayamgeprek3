import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    env: {},
    steps: [],
    errors: []
  }

  try {
    debugInfo.steps.push('1. Start login debug')
    debugInfo.env.NODE_ENV = process.env.NODE_ENV
    debugInfo.env.DATABASE_URL = process.env.DATABASE_URL ? 'Found' : 'NOT FOUND'
    debugInfo.env.JWT_SECRET = process.env.JWT_SECRET ? 'Found' : 'NOT FOUND'

    const body = await request.json()
    const { email, password } = body

    debugInfo.steps.push(`2. Email: ${email}`)
    debugInfo.steps.push(`3. Password: ${password ? 'Provided' : 'NOT PROVIDED'}`)

    if (!email || !password) {
      debugInfo.errors.push('Email or password missing')
      return NextResponse.json({
        error: 'Email dan password wajib diisi',
        debug: debugInfo
      }, { status: 400 })
    }

    debugInfo.steps.push('4. Looking up user in database...')

    try {
      const user = await db.user.findUnique({
        where: { email }
      })

      if (!user) {
        debugInfo.errors.push('User not found')
        debugInfo.steps.push('5. User NOT found')
        return NextResponse.json({
          error: 'Email atau password salah',
          debug: debugInfo
        }, { status: 401 })
      }

      debugInfo.steps.push(`5. User found: ${user.name} (${user.role})`)
      debugInfo.steps.push('6. Verifying password...')

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        debugInfo.errors.push('Invalid password')
        debugInfo.steps.push('7. Password invalid')
        return NextResponse.json({
          error: 'Email atau password salah',
          debug: debugInfo
        }, { status: 401 })
      }

      debugInfo.steps.push('7. Password valid')
      debugInfo.steps.push('8. Generating token...')

      const token = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      debugInfo.steps.push('9. Token generated successfully')

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token,
        debug: debugInfo
      })

      debugInfo.steps.push('10. Setting cookie...')
      debugInfo.steps.push('11. Login successful!')

      return response

    } catch (dbError: any) {
      debugInfo.errors.push(`Database error: ${dbError.message}`)
      debugInfo.errors.push(`Error name: ${dbError.name}`)
      debugInfo.errors.push(`Error code: ${dbError.code}`)

      if (dbError.stack) {
        debugInfo.errors.push(`Stack: ${dbError.stack.substring(0, 500)}`)
      }

      return NextResponse.json({
        error: 'Database error',
        debug: debugInfo
      }, { status: 500 })
    }

  } catch (error: any) {
    debugInfo.errors.push(`General error: ${error.message}`)
    debugInfo.errors.push(`Error name: ${error.name}`)
    debugInfo.errors.push(`Error code: ${error.code}`)

    if (error.stack) {
      debugInfo.errors.push(`Stack: ${error.stack.substring(0, 500)}`)
    }

    return NextResponse.json({
      error: 'General error',
      debug: debugInfo
    }, { status: 500 })
  }
}
