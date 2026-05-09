import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// Helper function to convert file to base64 (server-side compatible)
const fileToBase64 = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString('base64')
}

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
    const orderId = formData.get('orderId') as string
    const orderNumber = formData.get('orderNumber') as string
    const expectedAmount = formData.get('expectedAmount') as string
    const proofImage = formData.get('proofImage') as File

    if (!orderId || !orderNumber || !expectedAmount || !proofImage) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (proofImage.size > 5 * 1024 * 1024) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
    }

    // Validate file type
    if (!proofImage.type.startsWith('image/')) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 })
    }

    // Get order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    })

    if (!order) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    if (order.userId !== payload.userId) {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (order.paymentMethod !== 'QRIS') {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Bukan pembayaran QRIS' }, { status: 400 })
    }

    if (order.paymentStatus === 'completed') {
      await prisma.$disconnect()
      return NextResponse.json({ error: 'Pembayaran sudah selesai' }, { status: 400 })
    }

    // Convert image to base64
    const base64Image = await fileToBase64(proofImage)

    // Try to use VLM to validate payment proof (optional, fallback to manual review)
    let validationResult: any = {
      isValid: false,
      notes: 'Perlu verifikasi manual oleh admin',
    }

    try {
      const { vlmAnalyze } = await import('@/lib/vlm-service')

      const prompt = `
Analyze this payment receipt/proof image carefully. Extract the following information:

1. Transaction date (format: DD/MM/YYYY or similar)
2. Order number or transaction reference number
3. Total amount paid (in Indonesian Rupiah)

Expected order number: ${orderNumber}
Expected amount: Rp ${parseInt(expectedAmount).toLocaleString('id-ID')}

Respond with a JSON object:
{
  "isValid": true/false,
  "extractedDate": "date string or null",
  "extractedOrderNumber": "order number or null",
  "extractedAmount": number or null,
  "matchScore": 0-100 (how well it matches expected data),
  "notes": "any additional observations"
}

Check if:
- The date is reasonable (not too old or in the future)
- The order number matches or is similar to: ${orderNumber}
- The amount matches or is very close to: Rp ${parseInt(expectedAmount).toLocaleString('id-ID')}
`

      try {
        const analysisResult = await vlmAnalyze(base64Image, prompt)
        try {
          validationResult = JSON.parse(analysisResult)
        } catch (parseError) {
          console.error('Failed to parse VLM response:', parseError)
          validationResult = {
            isValid: false,
            notes: 'Gagal memproses validasi otomatis. Silakan hubungi admin untuk verifikasi manual.',
          }
        }
      } catch (vlmError) {
        console.error('VLM Analysis error (non-fatal):', vlmError)
        // Continue with manual review
      }
    } catch (importError) {
      console.error('VLM import error (non-fatal):', importError)
      // Continue with manual review
    }

    // Check if paymentProof model exists
    try {
      // Save proof image to database using raw query if needed
      await prisma.$executeRaw`
        INSERT INTO PaymentProof (id, orderId, userId, imageUrl, validationData, isValidated, notes, createdAt, updatedAt)
        VALUES (${uuidv4()}, ${order.id}, ${order.userId}, ${`data:${proofImage.type};base64,${base64Image}`}, ${JSON.stringify(validationResult)}, ${validationResult.isValid || false}, ${validationResult.notes || ''}, datetime('now'), datetime('now'))
      `
    } catch (rawError) {
      console.error('Raw SQL error, trying Prisma create:', rawError)
      // Try Prisma create as fallback
      await prisma.paymentProof.create({
        data: {
          id: uuidv4(),
          orderId: order.id,
          userId: order.userId,
          imageUrl: `data:${proofImage.type};base64,${base64Image}`,
          validationData: JSON.stringify(validationResult),
          isValidated: validationResult.isValid || false,
          notes: validationResult.notes || '',
        },
      })
    }

    // If validation passed, update order status to completed
    if (validationResult.isValid) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'completed',
          orderStatus: 'processing',
        },
      })

      await prisma.payment.updateMany({
        where: { orderId: order.id },
        data: {
          paymentStatus: 'completed',
        },
      })

      await prisma.$disconnect()
      return NextResponse.json({
        success: true,
        message: 'Bukti pembayaran divalidasi berhasil! Order sedang diproses.',
        validation: validationResult,
      })
    } else {
      // If validation failed or manual review needed, still save the proof
      await prisma.order.update({
        where: { id: order.id },
        data: {
          notes: `Bukti pembayaran diupload. Perlu verifikasi manual. ${validationResult.notes || ''}`,
        },
      })

      await prisma.$disconnect()
      return NextResponse.json({
        success: true,
        message: 'Bukti pembayaran berhasil diupload. Sedang menunggu verifikasi admin.',
        validation: validationResult,
        requiresManualReview: true,
      })
    }
  } catch (error) {
    console.error('Payment proof upload error:', error)
    try {
      await prisma.$disconnect()
    } catch (e) {
      // Ignore disconnect error
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload bukti pembayaran' },
      { status: 500 }
    )
  }
}
