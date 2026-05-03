'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MessageCircle, Send, User, Clock, X, Check, MoreVertical, ChevronRight, Archive, XCircle, RefreshCw, Sparkles, Shield, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface ChatUser {
  id: string
  name: string
  email: string
  phone: string
}

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
  user: ChatUser
  lastMessage: ChatMessage | null
  unreadCount: number
}

export function ChatManagement() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Mock admin ID (in real app, get from auth)
  const adminId = 'admin-123'

  useEffect(() => {
    loadConversations()
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation.id)
      }
      loadConversations()
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedConversation, statusFilter])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadConversations = async () => {
    try {
      const res = await fetch(`/api/chat?status=${statusFilter}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}`)
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

    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/chat/conversations/${selectedConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          senderId: adminId,
          senderType: 'admin' as const,
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

  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation)
    loadMessages(conversation.id)
  }

  const handleCloseConversation = async (conversationId: string) => {
    try {
      await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: adminId,
          senderType: 'admin' as const,
          message: 'Percakapan ditutup oleh admin.',
        }),
      })

      // Update local status
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, status: 'closed' } : c
        )
      )
      toast.success('Percakapan ditutup')
    } catch (error) {
      console.error('Error closing conversation:', error)
      toast.error('Gagal menutup percakapan')
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="h-7 w-7 text-red-500" />
            Chat Pelanggan
          </h2>
          <p className="text-gray-600 mt-1">Komunikasi dengan pelanggan secara real-time</p>
        </div>
        <Button
          onClick={loadConversations}
          variant="outline"
          className="flex items-center gap-2 border-2 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-lg border-2 border-gray-100 rounded-3xl">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari nama, email, atau subjek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={`rounded-2xl font-medium ${statusFilter === 'all' ? 'bg-gradient-to-r from-red-500 to-orange-500 border-0' : 'border-2'}`}
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
                className={`rounded-2xl font-medium ${statusFilter === 'active' ? 'bg-gradient-to-r from-red-500 to-orange-500 border-0' : 'border-2'}`}
              >
                Aktif
              </Button>
              <Button
                variant={statusFilter === 'closed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('closed')}
                className={`rounded-2xl font-medium ${statusFilter === 'closed' ? 'bg-gradient-to-r from-red-500 to-orange-500 border-0' : 'border-2'}`}
              >
                Ditutup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-[650px] shadow-xl border-2 border-gray-100 rounded-3xl">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-red-500" />
                Percakapan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[550px]">
                <div className="space-y-2 p-4">
                  {isLoading ? (
                    <div className="text-center py-12 text-gray-500">
                      <RefreshCw className="h-10 w-10 mx-auto mb-3 animate-spin text-red-400" />
                      <p className="text-sm font-medium">Memuat percakapan...</p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-3"
                      >
                        <MessageCircle className="h-8 w-8 text-gray-400" />
                      </motion.div>
                      <p className="text-sm font-medium">Tidak ada percakapan</p>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {filteredConversations.map((conv) => (
                        <motion.button
                          key={conv.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectConversation(conv)}
                          className={`w-full text-left p-4 rounded-2xl transition-all ${
                            selectedConversation?.id === conv.id
                              ? 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 shadow-lg shadow-red-100/50'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shadow-red-500/20">
                                  {conv.user.name.charAt(0).toUpperCase()}
                                </div>
                                <p className="font-semibold text-sm text-gray-900 truncate">
                                  {conv.user.name}
                                </p>
                                {conv.unreadCount > 0 && (
                                  <Badge className="bg-red-500 text-white text-xs h-5 min-w-[20px] flex items-center justify-center px-1.5 rounded-full shadow-md shadow-red-500/30">
                                    {conv.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              {conv.subject && (
                                <p className="text-xs text-gray-600 truncate mb-1 font-medium">{conv.subject}</p>
                              )}
                              {conv.lastMessage && (
                                <p className="text-xs text-gray-500 truncate leading-relaxed">
                                  {conv.lastMessage.message}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                {formatDate(conv.updatedAt)}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs rounded-full border-2 ${
                                conv.status === 'active'
                                  ? 'text-green-600 border-green-200 bg-green-50'
                                  : 'text-gray-500 border-gray-200 bg-gray-50'
                              }`}
                            >
                              {conv.status === 'active' ? (
                                <span className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                  Aktif
                                </span>
                              ) : (
                                'Ditutup'
                              )}
                            </Badge>
                          </div>
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          <Card className="h-[650px] shadow-xl border-2 border-gray-100 rounded-3xl">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-red-500/30">
                        {selectedConversation.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{selectedConversation.user.name}</CardTitle>
                        <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-2">
                          <span>{selectedConversation.user.email}</span>
                          {selectedConversation.orderId && (
                            <Badge variant="outline" className="text-xs rounded-full border-2">
                              Order: {selectedConversation.orderId}
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    {selectedConversation.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCloseConversation(selectedConversation.id)}
                        className="text-red-600 hover:bg-red-50 hover:border-red-200 border-2 rounded-2xl font-medium transition-all"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Tutup
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Messages */}
                  <ScrollArea className="h-[460px] p-5" ref={scrollRef}>
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            layout
                            className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="flex items-end gap-2 max-w-[70%]">
                              {message.senderType === 'user' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
                                  {selectedConversation.user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div
                                className={`px-4 py-3 shadow-md ${
                                  message.senderType === 'admin'
                                    ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-[24px] rounded-br-md shadow-lg shadow-red-500/20'
                                    : 'bg-white text-gray-900 rounded-[24px] rounded-bl-md shadow-md border-2 border-gray-100'
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{message.message}</p>
                                <div
                                  className={`text-[10px] mt-2 flex items-center justify-end gap-1.5 ${
                                    message.senderType === 'admin' ? 'text-red-100' : 'text-gray-400'
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  {formatDate(message.createdAt)}
                                  {message.senderType === 'admin' && (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  {selectedConversation.status === 'active' && (
                    <div className="p-5 border-t border-gray-100 bg-gradient-to-b from-white to-red-50/30">
                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <div className="flex-1 relative">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Tulis pesan balasan..."
                            disabled={isSending}
                            className="pr-12 h-12 rounded-2xl border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                          />
                          {newMessage && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                        <Button
                          type="submit"
                          disabled={isSending || !newMessage.trim()}
                          className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-2xl shadow-lg shadow-red-500/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        >
                          {isSending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                      <p className="text-[10px] text-gray-400 mt-3 text-center font-medium flex items-center justify-center gap-2">
                        <Shield className="w-3 h-3" />
                        Pesan tersimpan dan terenkripsi dengan aman
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="h-full flex items-center justify-center bg-gradient-to-br from-red-50/30 to-orange-50/30">
                <div className="text-center text-gray-500">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl mb-4 shadow-lg"
                  >
                    <MessageCircle className="h-12 w-12 text-red-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Pilih Percakapan</h3>
                  <p className="text-sm">Klik pada salah satu percakapan untuk memulai chat</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
