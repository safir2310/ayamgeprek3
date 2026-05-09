import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    const photo = formData.get('photo') as File

    if (!photo) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (photo.size > 5 * 1024 * 1024) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
    }

    // Validate file type
    if (!photo.type.startsWith('image/')) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 })
    }

    // Convert image to base64
    const arrayBuffer = await photo.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')

    // Update user profile photo
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        profilePhoto: `data:${photo.type};base64,${base64Image}`,
      },
    })

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'Foto profil berhasil diupdate',
      profilePhoto: `data:${photo.type};base64,${base64Image}`,
    })
  } catch (error) {
    console.error('Profile photo upload error:', error)
    try {
      await prisma.$disconnect()
    } catch (e) {
      // Ignore disconnect error
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate foto profil' },
      { status: 500 }
    )
  }
}
