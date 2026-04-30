import { NextRequest, NextResponse } from 'next/server'
import ZAI, { VisionMessage } from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('orderId') as string
    const orderDate = formData.get('orderDate') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!orderId || !orderDate) {
      return NextResponse.json({ error: 'Missing order information' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Extract transaction date from image using VLM
    const zai = await ZAI.create()

    const messages: VisionMessage[] = [
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Output only JSON, no markdown.' }
        ]
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please analyze this payment receipt/bukti pembayaran QRIS image and extract the following information in JSON format:
{
  "transactionDate": "YYYY-MM-DD",
  "transactionTime": "HH:MM:SS",
  "amount": number,
  "merchant": string,
  "rawText": string
}

Only return the JSON, no additional text. The date format should be ISO format (YYYY-MM-DD).`
          },
          {
            type: 'image_url',
            image_url: { url: dataUrl }
          }
        ]
      }
    ]

    const response = await zai.chat.completions.createVision({
      model: 'glm-4.6v',
      messages,
      thinking: { type: 'disabled' }
    })

    const content = response.choices?.[0]?.message?.content || '{}'

    // Parse the JSON response
    let extractedData
    try {
      // Extract JSON from the content (in case there's additional text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (error) {
      console.error('Failed to parse VLM response:', content)
      return NextResponse.json({ error: 'Failed to parse extracted data' }, { status: 500 })
    }

    // Compare transaction date with order date
    const orderDateTime = new Date(orderDate)
    const transactionDateTime = new Date(extractedData.transactionDate)

    // Calculate date difference in milliseconds
    const dateDiff = Math.abs(orderDateTime.getTime() - transactionDateTime.getTime())
    const daysDiff = dateDiff / (1000 * 60 * 60 * 24)

    // Payment is considered valid if dates match or within 1 day
    const isPaymentValid = daysDiff <= 1

    // If payment is valid, update order status
    let orderUpdated = false
    if (isPaymentValid) {
      try {
        // Update order to paid status
        const { db } = await import('@/lib/db')

        // Update order status
        await db.order.update({
          where: { orderNumber: orderId },
          data: {
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
          },
        })

        orderUpdated = true
      } catch (error) {
        console.error('Failed to update order:', error)
      }
    }

    return NextResponse.json({
      success: true,
      extractedData,
      isPaymentValid,
      orderUpdated,
      orderDate: orderDate,
      transactionDate: extractedData.transactionDate,
      daysDiff,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
