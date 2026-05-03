'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Store, Minimize2, Maximize2, Sparkles, Clock } from 'lucide-react'
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
      <DialogContent className={`p-0 gap-0 max-w-md w-[320px] !z-[9999] rounded-[32px] overflow-hidden shadow-2xl shadow-red-900/20 border-2 border-red-100 ${
        isMinimized ? 'max-h-[64px]' : 'max-h-[500px]'
      }`}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Chat dengan Admin</DialogTitle>

        {/* Header - Modern Design */}
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 px-5 py-4 flex items-center justify-between relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 backdrop-blur-sm"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 backdrop-blur-sm"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-yellow-300/40 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-yellow-300/40 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>

          <div className="flex items-center gap-4 text-white relative z-10">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                <Store className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-3 border-white shadow-md shadow-green-400/30"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm tracking-wide">CS Ayam Geprek</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-[10px] text-white/90 font-medium">Online & Respon Cepat</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative z-10">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8 rounded-xl transition-all hover:scale-105"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 rounded-xl transition-all hover:scale-105 hover:rotate-90"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        {!isMinimized && (
          <>
            <div className="p-4 bg-gradient-to-b from-red-50/50 to-orange-50/30">
              {isLoading ? (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl shadow-xl shadow-red-500/30 mb-4"
                  >
                    <MessageCircle className="h-7 w-7 text-white" />
                  </motion.div>
                  <p className="text-sm text-gray-600 font-semibold">Memuat percakapan...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl shadow-lg mb-4 relative"
                  >
                    <Sparkles className="h-8 w-8 text-red-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  </motion.div>
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Halo! Ada yang bisa kami bantu?</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                    Silakan tanyakan apa saja tentang produk atau pesanan Anda
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-2">
                  <div className="space-y-3" ref={scrollRef}>
                    <AnimatePresence mode="popLayout">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          layout
                          className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-3 shadow-md ${
                              message.senderType === 'user'
                                ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-[24px] rounded-br-md shadow-lg shadow-red-500/20'
                                : 'bg-white text-gray-900 rounded-[24px] rounded-bl-md shadow-md border border-gray-100'
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words">{message.message}</p>
                            <div
                              className={`text-[10px] mt-2 flex items-center justify-end gap-1.5 ${
                                message.senderType === 'user' ? 'text-red-100' : 'text-gray-400'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {formatDate(message.createdAt)}
                              {message.senderType === 'user' && message.isRead && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex items-center gap-0.5"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" opacity="0.5" transform="translate(6,0)"/>
                                  </svg>
                                </motion.span>
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

            {/* Message Input - Modern Design */}
            <div className="p-4 bg-white border-t border-gray-100/80">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan Anda..."
                    disabled={isSending || isLoading}
                    className="pr-12 h-11 text-sm border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 bg-gray-50/50 rounded-2xl transition-all"
                  />
                  {newMessage && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSending || isLoading || !newMessage.trim()}
                  className="h-11 w-11 p-0 bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-2xl shadow-lg shadow-red-500/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Clock className="w-3 h-3 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-medium">Admin akan merespons dalam waktu 1x24 jam</p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
