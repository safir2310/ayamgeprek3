import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Daftar reward yang bisa ditukar dengan poin
// Menggunakan barcode untuk mencocokkan produk di database
const REWARD_CONFIG = [
  {
    id: 'reward_1',
    name: 'Ayam Geprek Sambal Ijo',
    description: 'Gratis 1x Ayam Geprek',
    points: 1000,
    barcode: 'REWARD-AG-SI-1000', // Barcode produk reward
  },
  {
    id: 'reward_2',
    name: 'Es Teh Manis',
    description: 'Gratis 1x Es Teh Manis',
    points: 500,
    barcode: 'REWARD-ETM-500', // Barcode produk reward
  },
  {
    id: 'reward_3',
    name: 'Sambal Ijo Botol',
    description: 'Gratis 1x Sambal Ijo Botol',
    points: 1500,
    barcode: 'REWARD-SIB-1500', // Barcode produk reward
  },
  {
    id: 'reward_4',
    name: 'Nasi Pecel Ayam',
    description: 'Gratis 1x Nasi Pecel Ayam',
    points: 2000,
    barcode: 'REWARD-NPA-2000', // Barcode produk reward
  },
  {
    id: 'reward_5',
    name: 'Diskon 50%',
    description: 'Diskon 50% untuk belanja apapun',
    points: 3000,
    discount: 50,
    discountType: 'percentage',
  },
]

export async function GET() {
  try {
    // Fetch all reward products from database based on barcodes
    const barcodes = REWARD_CONFIG
      .filter(r => r.barcode)
      .map(r => r.barcode)

    const products = await db.product.findMany({
      where: {
        barcode: {
          in: barcodes,
        },
      },
    })

    // Create a map of barcode to product ID
    const productMap = new Map()
    products.forEach(product => {
      productMap.set(product.barcode, product.id)
    })

    // Build rewards list with actual product IDs
    const rewards = REWARD_CONFIG.map(reward => ({
      ...reward,
      productId: reward.barcode ? productMap.get(reward.barcode) || null : undefined,
    }))

    return NextResponse.json({
      success: true,
      rewards,
    })
  } catch (error) {
    console.error('Get rewards error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat reward' },
      { status: 500 }
    )
  }
}
