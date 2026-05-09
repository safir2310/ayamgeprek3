import { NextResponse } from 'next/server'
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

    const { rewardId } = await request.json()

    if (!rewardId) {
      return NextResponse.json({ error: 'Reward ID wajib diisi' }, { status: 400 })
    }

    // Get reward configuration
    const rewardResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/rewards`)
    const rewardData = await rewardResponse.json()
    const reward = rewardData.rewards.find((r: any) => r.id === rewardId)

    if (!reward) {
      return NextResponse.json({ error: 'Reward tidak ditemukan' }, { status: 404 })
    }

    // Get user and check points
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    if (user.points < reward.points) {
      return NextResponse.json(
        { error: `Poin tidak cukup. Anda punya ${user.points} poin, butuh ${reward.points} poin` },
        { status: 400 }
      )
    }

    // Generate unique voucher code
    const code = `REWARD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create voucher
    const voucher = await db.voucher.create({
      data: {
        code,
        name: `Reward: ${reward.name}`,
        description: reward.description,
        discountType: reward.discountType || 'fixed',
        discountValue: reward.discount || 0,
        minPurchase: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari berlaku
        usageLimit: 1,
        status: 'active',
        isPointReward: true,
        rewardProduct: reward.productId,
        pointsRequired: reward.points,
      },
    })

    // Deduct user points
    await db.user.update({
      where: { id: decoded.userId },
      data: { points: user.points - reward.points },
    })

    // Record point history
    await db.pointHistory.create({
      data: {
        userId: decoded.userId,
        type: 'redeemed',
        points: -reward.points,
        description: `Tukar poin untuk reward: ${reward.name}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Berhasil tukar poin!',
      voucher: voucher,
    })
  } catch (error) {
    console.error('Redeem points error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat tukar poin' },
      { status: 500 }
    )
  }
}
