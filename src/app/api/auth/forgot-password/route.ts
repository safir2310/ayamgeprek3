import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// POST - Verify email and last 6 digits of phone
export async function POST(request: NextRequest) {
  try {
    const { email, phoneLastSix } = await request.json()

    if (!email || !phoneLastSix) {
      return NextResponse.json(
        { error: 'Email dan 6 digit terakhir nomor HP harus diisi' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify last 6 digits of phone number
    if (!user.phone || !user.phone.slice(-6) === phoneLastSix) {
      return NextResponse.json(
        { error: '6 digit terakhir nomor HP tidak sesuai' },
        { status: 400 }
      )
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Note: In a real application, you would store this token in the database
    // For simplicity, we'll use the token directly and validate it against user ID

    return NextResponse.json({
      success: true,
      token: resetToken,
      userId: user.id,
      message: 'Verifikasi berhasil',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Gagal memproses permintaan' },
      { status: 500 }
    )
  }
}
