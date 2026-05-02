'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Store, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  senderId: string
  senderType: 'user' | 'admin'
  message: string
  isRead: boolean
  createdAt: Date
}

interface ChatConversation {
  id: string
  userId: string
  orderId?: string
  subject?: string
  status: string
  createdAt: Date
  updatedAt: Date
  lastMessage: ChatMessage | null
  unreadCount: number
}

export function UserChatDialog({ isOpen, onClose, userId, userName }: {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName?: string
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && userId) {
      loadOrCreateConversation()
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        if (conversationId) {
          loadMessages(conversationId)
        }
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isOpen, userId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadOrCreateConversation = async () => {
    setIsLoading(true)
    try {
      // Try to find existing conversation for this user
      const res = await fetch('/api/chat')
      if (res.ok) {
        const data = await res.json()
        const userConversation = (data.conversations || []).find((c: ChatConversation) => c.userId === userId)

        if (userConversation) {
          setConversationId(userConversation.id)
          await loadMessages(userConversation.id)
        } else {
          // Create new conversation
          const createRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              subject: `Chat with ${userName || 'Customer'}`,
            }),
          })

          if (createRes.ok) {
            const createData = await createRes.json()
            setConversationId(createData.conversation.id)
          }
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !conversationId || isSending) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: userId,
          senderType: 'user' as const,
          message: newMessage.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        toast.success('Pesan terkirim')
      } else {
        toast.error('Gagal mengirim pesan')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Gagal mengirim pesan')
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`p-0 gap-0 max-w-md w-full !z-[9999] ${
        isMinimized ? 'max-h-12' : 'max-h-[600px]'
      }`}>
        <DialogTitle className="sr-only">Chat dengan Admin</DialogTitle>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Chat dengan Admin</h3>
              <p className="text-xs text-white/80">Butuh bantuan? Tanyakan di sini</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <>
            <div className="p-4">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Memuat percakapan...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Mulai percakapan dengan admin</p>
                  <p className="text-xs mt-1">Kami akan merespons secepat mungkin</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4 pr-4" ref={scrollRef}>
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          layout
                          className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              message.senderType === 'user'
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div
                              className={`text-xs mt-1 ${
                                message.senderType === 'user' ? 'text-red-100' : 'text-gray-400'
                              }`}
                            >
                              {formatDate(message.createdAt)}
                              {message.senderType === 'user' && message.isRead && (
                                <span className="ml-1">✓✓</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tulis pesan Anda..."
                  disabled={isSending || isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isSending || isLoading || !newMessage.trim()}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Admin akan merespons dalam waktu 1x24 jam
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
