import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Validate token
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user info with point history
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        pointHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate membership level
    const points = user.points || 0
    let memberLevel = 'Bronze'
    let levelColor = 'from-orange-600 to-orange-700'
    let levelTextColor = 'text-orange-600'

    if (points >= 5000) {
      memberLevel = 'VIP'
      levelColor = 'from-purple-600 to-purple-800'
      levelTextColor = 'text-purple-600'
    } else if (points >= 2500) {
      memberLevel = 'Platinum'
      levelColor = 'from-slate-500 to-slate-700'
      levelTextColor = 'text-slate-600'
    } else if (points >= 1000) {
      memberLevel = 'Gold'
      levelColor = 'from-amber-500 to-amber-600'
      levelTextColor = 'text-amber-600'
    } else if (points >= 500) {
      memberLevel = 'Silver'
      levelColor = 'from-gray-400 to-gray-500'
      levelTextColor = 'text-gray-600'
    }

    // Calculate progress to next level
    const levels = [0, 500, 1000, 2500, 5000]
    let currentLevelStart = 0
    let nextLevelPoints = 500

    for (let i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i]) {
        currentLevelStart = levels[i]
        break
      }
    }

    const nextLevel = levels.find(l => l > points)
    if (nextLevel) {
      nextLevelPoints = nextLevel
    } else {
      nextLevelPoints = 5000 // VIP level
    }

    // Calculate progress percentage
    let progress = 0
    if (points >= 5000) {
      progress = 100
    } else if (points >= 2500) {
      progress = ((points - 2500) / 2500) * 100
    } else if (points >= 1000) {
      progress = ((points - 1000) / 1500) * 100
    } else if (points >= 500) {
      progress = ((points - 500) / 500) * 100
    } else {
      progress = (points / 500) * 100
    }

    progress = Math.min(Math.max(progress, 5), 100)

    const pointsNeeded = nextLevelPoints > points
      ? `${nextLevelPoints - points} poin lagi`
      : 'Level Max'

    return NextResponse.json({
      success: true,
      memberData: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        points: user.points,
        stampCount: user.stampCount || 0,
        starCount: user.starCount || 0,
        memberLevel,
        levelColor,
        levelTextColor,
        progress,
        currentLevelStart,
        nextLevelPoints,
        pointsNeeded,
        joinedAt: user.createdAt,
        totalOrders: await db.order.count({
          where: { userId: user.id }
        }),
        totalSpent: await db.order.aggregate({
          where: { userId: user.id },
          _sum: { finalAmount: true }
        }).then(result => result._sum.finalAmount || 0),
        pointHistory: user.pointHistory,
      },
    })
  } catch (error) {
    console.error('Error fetching member card data:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data member' },
      { status: 500 }
    )
  }
}
