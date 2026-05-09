'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Search, User, Clock, CheckCircle2, X, MoreVertical, Archive, Trash2, Star, Bell, Minimize2, Maximize2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  userName?: string
  orderId?: string
  subject?: string
  status: string
  createdAt: Date
  updatedAt: Date
  lastMessage: ChatMessage | null
  unreadCount: number
}

interface AdminChatProps {
  onBack?: () => void
}

export function AdminChat({ onBack }: AdminChatProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const conversationScrollRef = useRef<HTMLDivElement>(null)

  // Load conversations
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
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/chat')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
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

  const handleSelectConversation = async (conversation: ChatConversation) => {
    setSelectedConversation(conversation)
    setIsLoading(true)
    setIsMinimized(false)
    try {
      await loadMessages(conversation.id)
      
      // Mark as read
      await fetch(`/api/chat/conversations/${conversation.id}/read`, {
        method: 'POST',
      })
      
      // Update unread count
      setConversations(prev => 
        prev.map(c => 
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        )
      )
    } catch (error) {
      console.error('Error selecting conversation:', error)
    } finally {
      setIsLoading(false)
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
          senderId: 'admin',
          senderType: 'admin',
          message: newMessage.trim(),
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        toast.success('Pesan terkirim')
        
        // Update conversation last message
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConversation.id
              ? { ...c, lastMessage: data.message, updatedAt: new Date() }
              : c
          )
        )
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

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      })
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
        setMessages([])
      }
      toast.success('Percakapan diarsipkan')
    } catch (error) {
      console.error('Error archiving conversation:', error)
      toast.error('Gagal mengarsipkan percakapan')
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes}m yang lalu`
    if (hours < 24) return `${hours}j yang lalu`
    if (days < 7) return `${days} hari yang lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filteredConversations = conversations.filter(c => {
    const userName = c.userName?.toLowerCase() || ''
    const subject = c.subject?.toLowerCase() || ''
    const lastMessage = c.lastMessage?.message.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    
    return userName.includes(query) || subject.includes(query) || lastMessage.includes(query)
  })

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 p-4 md:p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Chat</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Kelola percakapan dengan pelanggan
              </p>
            </div>
          </div>
          {totalUnread > 0 && (
            <Badge className="bg-red-500 text-white px-3 py-1">
              {totalUnread} pesan baru
            </Badge>
          )}
        </div>

        {/* Search Bar */}
        <Card className="mb-6 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-400" />
              <Input
                placeholder="Cari percakapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 focus:ring-0 focus:ring-offset-0"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Percakapan
                <Badge variant="secondary" className="ml-auto">
                  {filteredConversations.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-2 space-y-1">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm">Tidak ada percakapan</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {searchQuery ? 'Coba kata kunci lain' : 'Percakapan baru akan muncul di sini'}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => {
                      const isSelected = selectedConversation?.id === conversation.id
                      
                      return (
                        <motion.button
                          key={conversation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleSelectConversation(conversation)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className={`${isSelected ? 'bg-white/20' : 'bg-orange-100 text-orange-600'} font-semibold`}>
                                  {conversation.userName?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                                  {conversation.unreadCount}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                                  {conversation.userName || 'Pelanggan'}
                                </p>
                                <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                  {formatDate(conversation.updatedAt)}
                                </p>
                              </div>
                              {conversation.lastMessage && (
                                <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'}`}>
                                  {conversation.lastMessage.message}
                                </p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 ${isSelected ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleArchiveConversation(conversation.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus Percakapan
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.button>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 overflow-hidden">
            {!selectedConversation ? (
              <div className="h-[600px] flex flex-col items-center justify-center text-slate-400">
                <MessageCircle className="h-20 w-20 mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Pilih percakapan
                </h3>
                <p className="text-sm">
                  Klik pada salah satu percakapan untuk memulai chat
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-orange-400 to-amber-400 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                          {selectedConversation.userName?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-white text-lg">
                          {selectedConversation.userName || 'Pelanggan'}
                        </CardTitle>
                        <p className="text-white/80 text-sm">
                          {selectedConversation.subject || 'Percakapan Pelanggan'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="text-white hover:bg-white/20 h-8 w-8"
                      >
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedConversation(null)}
                        className="text-white hover:bg-white/20 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {!isMinimized && (
                  <>
                    {/* Messages */}
                    <CardContent className="p-0">
                      <ScrollArea className="h-[450px]" ref={conversationScrollRef}>
                        <div className="p-4 space-y-4" ref={scrollRef}>
                          {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : messages.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                              <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                              <p className="text-sm">Belum ada pesan</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Mulailah percakapan dengan mengirim pesan
                              </p>
                            </div>
                          ) : (
                            messages.map((message, index) => {
                              const isAdmin = message.senderType === 'admin'
                              
                              return (
                                <motion.div
                                  key={message.id}
                                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                  className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className="flex items-end gap-2 max-w-[80%]">
                                    {!isAdmin && (
                                      <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                                          {selectedConversation.userName?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    <div
                                      className={`px-4 py-3 rounded-2xl shadow-md ${
                                        isAdmin
                                          ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
                                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                                      }`}
                                    >
                                      <p className="text-sm leading-relaxed">{message.message}</p>
                                      <div className="flex items-center gap-1.5 mt-1.5">
                                        <Clock className="w-3 h-3 opacity-60" />
                                        <span className="text-[10px] opacity-60">
                                          {formatDate(message.createdAt)}
                                        </span>
                                        {isAdmin && message.isRead && (
                                          <CheckCircle2 className="w-3 h-3 opacity-60" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>

                    {/* Message Input */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <div className="flex-1 relative">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Tulis pesan Anda..."
                            disabled={isSending || isLoading}
                            className="h-12 text-sm border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 bg-slate-50 dark:bg-slate-800"
                          />
                          {newMessage && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          )}
                        </div>
                        <Button
                          type="submit"
                          disabled={isSending || isLoading || !newMessage.trim()}
                          className="h-12 w-12 px-0 bg-gradient-to-br from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-lg shadow-orange-400/25 transition-all hover:scale-105 active:scale-95"
                        >
                          {isSending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </>
            )}
          </Card>
        </div>
      </motion.div>
    </>
  )
}
