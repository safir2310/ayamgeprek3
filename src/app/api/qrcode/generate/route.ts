import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

const NMID = 'ID1025429162544' // NMID untuk Ayam Geprek Sambal Ijo
const MERCHANT_NAME = 'AYAM GEPREK SAMBAL IJO'
const CURRENCY = 'IDR'

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

    // Create QRIS QR code string (following QRIS standard)
    // Simplified format for Indonesia QRIS
    const qrData = `000201010212${NMID}514400${CURRENCY}${formattedAmount}5802ID59${MERCHANT_NAME}6304`

    // Generate QR code
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    return NextResponse.json({
      success: true,
      qrCode: qrCodeImage,
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
