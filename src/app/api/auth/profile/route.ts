import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jwtPayload = await verifyToken(token)

    if (!jwtPayload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, address } = body

    if (!name && !phone && !address) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (address) updateData.address = address

    const updatedUser = await db.user.update({
      where: { id: jwtPayload.userId },
      data: updateData,
    })

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        points: updatedUser.points,
        stampCount: updatedUser.stampCount,
        starCount: updatedUser.starCount,
        memberLevel: updatedUser.memberLevel,
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
