import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface MessageData {
  conversationId: string
  senderId: string
  senderType: 'user' | 'admin'
  message: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id

    const messages = await db.chatMessage.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Mark user messages as read if they're not already read
    await db.chatMessage.updateMany({
      where: {
        conversationId,
        senderType: 'user',
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    // Update conversation timestamp
    await db.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    const body = await req.json()
    const { senderId, senderType, message } = body as MessageData

    if (!senderId || !senderType || !message) {
      return NextResponse.json(
        { error: 'senderId, senderType, and message are required' },
        { status: 400 }
      )
    }

    if (senderType !== 'user' && senderType !== 'admin') {
      return NextResponse.json(
        { error: 'senderType must be either "user" or "admin"' },
        { status: 400 }
      )
    }

    // Create message
    const newMessage = await db.chatMessage.create({
      data: {
        conversationId,
        senderId,
        senderType,
        message,
        isRead: false,
      },
    })

    // Update conversation timestamp
    await db.chatConversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
        status: 'active',
      },
    })

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
