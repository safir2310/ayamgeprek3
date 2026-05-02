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
      <DialogContent className={`p-0 gap-0 max-w-sm w-[280px] !z-[9999] rounded-2xl ${
        isMinimized ? 'max-h-[50px]' : 'max-h-[400px]'
      }`}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Chat dengan Admin</DialogTitle>

        {/* Header */}
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 px-3 py-2 flex items-center justify-between relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="flex items-center gap-3 text-white relative z-10">
            <div className="relative">
              <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Store className="h-4.5 w-4.5" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs leading-tight">CS Ayam Geprek</h3>
              <p className="text-[9px] text-white/80 leading-tight">Online • Respon cepat</p>
            </div>
          </div>

          <div className="flex items-center gap-1 relative z-10">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-6 w-6 rounded-lg"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-6 w-6 rounded-lg"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <>
            <div className="p-2 bg-gray-50/50">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full animate-pulse mb-3">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Memuat percakapan...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-6 px-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl mb-3">
                    <MessageCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Halo! Ada yang bisa kami bantu?</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">Silakan tanyakan apa saja tentang produk atau pesanan Anda</p>
                </div>
              ) : (
                <ScrollArea className="h-[250px] pr-2">
                  <div className="space-y-2" ref={scrollRef}>
                    <AnimatePresence mode="popLayout">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          layout
                          className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                              message.senderType === 'user'
                                ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-br-lg'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-lg'
                            }`}
                          >
                            <p className="text-xs leading-relaxed break-words">{message.message}</p>
                            <div
                              className={`text-[9px] mt-1 flex items-center gap-1 ${
                                message.senderType === 'user' ? 'text-red-100' : 'text-gray-400'
                              }`}
                            >
                              {formatDate(message.createdAt)}
                              {message.senderType === 'user' && message.isRead && (
                                <span className="flex items-center gap-0.5">
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" opacity="0.5" transform="translate(6,0)"/>
                                  </svg>
                                </span>
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
            <div className="p-2 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tulis pesan..."
                    disabled={isSending || isLoading}
                    className="pr-10 h-9 text-xs border-gray-200 focus:border-red-400 focus:ring-red-400/20 bg-gray-50/50"
                  />
                  {newMessage && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSending || isLoading || !newMessage.trim()}
                  className="h-9 w-9 p-0 bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl shadow-md shadow-red-500/20 flex items-center justify-center"
                >
                  {isSending ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </form>
              <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">
                Admin akan merespons dalam waktu 1x24 jam
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
