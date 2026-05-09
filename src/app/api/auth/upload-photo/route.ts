import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const filename = `profile_${decoded.userId}_${timestamp}_${random}.${file.type.split('/')[1]}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file to public/uploads directory
    await mkdir('public/uploads', { recursive: true })
    await writeFile(`public/uploads/${filename}`, buffer)

    // Update user photoUrl in database
    const photoUrl = `/uploads/${filename}`
    await db.user.update({
      where: { id: decoded.userId },
      data: { photoUrl }
    })

    return NextResponse.json({
      success: true,
      message: 'Foto profil berhasil diupload',
      photoUrl
    })
  } catch (error) {
    console.error('Upload photo error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload foto' },
      { status: 500 }
    )
  }
}
