import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    const where: any = {}
    if (userId) {
      where.userId = userId
    }
    if (status && status !== 'all') {
      where.status = status
    }

    const conversations = await db.chatConversation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Count unread messages for admin
    const unreadCount = await db.chatMessage.count({
      where: {
        senderType: 'user',
        isRead: false,
      },
    })

    return NextResponse.json({
      conversations: conversations.map(conv => ({
        ...conv,
        lastMessage: conv.messages[0] || null,
        unreadCount: conv.messages.filter(m => m.senderType === 'user' && !m.isRead).length,
      })),
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, subject, orderId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if conversation already exists for this order
    if (orderId) {
      const existing = await db.chatConversation.findFirst({
        where: { orderId },
      })

      if (existing) {
        return NextResponse.json({
          conversation: existing,
          message: 'Conversation already exists for this order',
        })
      }
    }

    const conversation = await db.chatConversation.create({
      data: {
        userId,
        subject: subject || `Chat with ${orderId ? `Order ${orderId}` : 'Customer'}`,
        orderId,
        status: 'active',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
