import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

const QRIS_DATA = '00020101021126610014COM.GO-JEK.WWW01189360091434825225980210G4825225980303UMI51440014ID.CO.QRIS.WWW0215ID10254291625440303UMI5204581253033605802ID5925Ayam Geprek Sambal Ijo , 6005PIDIE61052416462070703A0163042A7C'

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Jumlah pembayaran tidak valid' },
        { status: 400 }
      )
    }

    // Generate QR code from QRIS data string
    const qrCodeImage = await QRCode.toDataURL(QRIS_DATA, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M', // Medium error correction
    })

    // Format amount to 2 decimal places
    const formattedAmount = amount.toFixed(2)

    return NextResponse.json({
      success: true,
      qrCode: qrCodeImage,
      nmId: 'ID1025429162544',
      merchantName: 'AYAM GEPREK SAMBAL IJO',
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
