import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Accept terms and conditions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update terms acceptance
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { termsAcceptedAt: new Date() }
    })

    return NextResponse.json({ message: 'Terms accepted successfully' })
  } catch (error) {
    console.error('Error accepting terms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
