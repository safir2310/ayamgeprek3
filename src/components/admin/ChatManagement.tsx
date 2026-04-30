'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MessageCircle, Send, User, Clock, X, Check, MoreVertical, ChevronRight, Archive, XCircle, RefreshCw } from 'lucide-react'
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
          <h2 className="text-2xl font-bold text-gray-800">Chat Pelanggan</h2>
          <p className="text-gray-600">Komunikasi dengan pelanggan</p>
        </div>
        <Button
          onClick={loadConversations}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari nama, email, atau subjek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
                className={statusFilter === 'active' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Aktif
              </Button>
              <Button
                variant={statusFilter === 'closed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('closed')}
                className={statusFilter === 'closed' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
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
          <Card className="h-[600px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Percakapan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-1 p-3">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                      <p className="text-sm">Memuat percakapan...</p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Tidak ada percakapan</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <motion.button
                        key={conv.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedConversation?.id === conv.id
                            ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {conv.user.name}
                              </p>
                              {conv.unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white text-xs h-5 min-w-[20px] flex items-center justify-center px-1">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {conv.subject && (
                              <p className="text-xs text-gray-600 truncate">{conv.subject}</p>
                            )}
                            {conv.lastMessage && (
                              <p className="text-xs text-gray-500 truncate">
                                {conv.lastMessage.message}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              {formatDate(conv.updatedAt)}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              conv.status === 'active'
                                ? 'text-green-600 border-green-200'
                                : 'text-gray-500 border-gray-200'
                            }`}
                          >
                            {conv.status === 'active' ? 'Aktif' : 'Ditutup'}
                          </Badge>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{selectedConversation.user.name}</CardTitle>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.user.email}
                          {selectedConversation.orderId && ` • Order: ${selectedConversation.orderId}`}
                        </p>
                      </div>
                    </div>
                    {selectedConversation.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCloseConversation(selectedConversation.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Tutup
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Messages */}
                  <ScrollArea className="h-[440px] p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      <AnimatePresence>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            layout
                            className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                message.senderType === 'admin'
                                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <div
                                className={`text-xs mt-1 ${
                                  message.senderType === 'admin' ? 'text-red-100' : 'text-gray-400'
                                }`}
                              >
                                {formatDate(message.createdAt)}
                                {message.senderType === 'admin' && (
                                  <Check className="inline h-3 w-3 ml-1" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  {selectedConversation.status === 'active' && (
                    <div className="p-4 border-t">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Tulis pesan..."
                          disabled={isSending}
                          className="flex-1"
                        />
                        <Button
                          type="submit"
                          disabled={isSending || !newMessage.trim()}
                          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Pilih percakapan untuk memulai chat</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
