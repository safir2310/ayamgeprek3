import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const qrImagePath = join(process.cwd(), 'upload', 'Screenshot_2026_0501_180023.png')
    const imageBuffer = await readFile(qrImagePath)

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year',
      },
    })
  } catch (error) {
    console.error('Error serving QRIS image:', error)
    return NextResponse.json({ error: 'QRIS image not found' }, { status: 404 })
  }
}
