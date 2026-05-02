import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Find conversation for this user
    const conversation = await db.chatConversation.findFirst({
      where: { userId },
      include: {
        messages: true,
      },
    })

    if (!conversation) {
      return NextResponse.json({ unreadCount: 0 })
    }

    // Count unread messages (messages from admin that are not read)
    const unreadCount = conversation.messages.filter(
      (m) => m.senderType === 'admin' && !m.isRead
    ).length

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}
