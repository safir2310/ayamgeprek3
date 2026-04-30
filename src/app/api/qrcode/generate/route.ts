import { NextRequest, NextResponse } from 'next/server'

const NMID = 'ID1025429162544' // NMID untuk Ayam Geprek Sambal Ijo
const MERCHANT_NAME = 'AYAM GEPREK SAMBAL IJO'
const QRIS_IMAGE_PATH = '/qris-merchant.png' // Path to QRIS image in public folder

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Jumlah pembayaran tidak valid' },
        { status: 400 }
      )
    }

    // Format amount to 2 decimal places
    const formattedAmount = amount.toFixed(2)

    return NextResponse.json({
      success: true,
      qrCode: QRIS_IMAGE_PATH,
      nmId: NMID,
      merchantName: MERCHANT_NAME,
      amount: formattedAmount,
      orderId,
    })
  } catch (error) {
    console.error('QR Code generation error:', error)
    return NextResponse.json(
      { error: 'Gagal generate QR Code' },
      { status: 500 }
    )
  }
}
