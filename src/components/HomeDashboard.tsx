'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, Bell, MapPin, Phone, Mail, CreditCard, BarChart3, QrCode, Award, TrendingUp, Zap, Tag, Calendar, ChevronRight, Gift, Percent } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MemberCard } from './MemberCard'
import { toast } from 'sonner'

interface HomeDashboardProps {
  user?: any
  points?: number
}

export function HomeDashboard({ user, points }: HomeDashboardProps) {
  const [showBarcode, setShowBarcode] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(2)
  const [activeOrders, setActiveOrders] = useState(0)
  const [cashbackToday, setCashbackToday] = useState(0)
  const [activePromos, setActivePromos] = useState(0)

  useEffect(() => {
    // Simulate loading cart count from store or API
    setCartCount(3)
    setActiveOrders(2)
    setCashbackToday(5000)
    setActivePromos(3)
  }, [])

  const getMembershipStatus = () => {
    if (points && points >= 10000) return { level: 'VIP Exclusive', color: 'bg-purple-600', gradient: 'from-purple-600 to-violet-600' }
    if (points && points >= 5000) return { level: 'Platinum', color: 'bg-slate-600', gradient: 'from-slate-600 to-gray-600' }
    if (points && points >= 1000) return { level: 'Gold', color: 'bg-yellow-500', gradient: 'from-yellow-500 to-amber-500' }
    return { level: 'Silver', color: 'bg-gray-500', gradient: 'from-gray-400 to-gray-500' }
  }

  const membership = getMembershipStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Premium Header with Background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        {/* Background Gradient Premium */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 opacity-95"></div>

        {/* Batik Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 border-4 border-white/20 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-white/15 rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-56 h-56 border-4 border-white/10 rounded-full"></div>
        </div>

        {/* Glassmorphism Effect */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 text-white placeholder-white/70 focus:outline-none focus:border-white/40 transition-all"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border-2 border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <ShoppingCart className="w-6 h-6 text-white" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
                    {cartCount}
                  </Badge>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border-2 border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <Bell className="w-6 h-6 text-white" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
                    {notificationCount}
                  </Badge>
                )}
              </motion.button>
            </div>
          </div>

          {/* Member Card Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <MemberCard
              user={user}
              points={points}
              onBarcodeClick={() => setShowBarcode(!showBarcode)}
              onQRClick={() => setShowQR(!showQR)}
              showBarcode={showBarcode}
              showQR={showQR}
            />
          </motion.div>

          {/* Quick Access Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex gap-3 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBarcode(true)}
              className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition-all group"
            >
              <BarChart3 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white font-semibold">Scan</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition-all group"
            >
              <Award className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white font-semibold">Reward</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition-all group"
            >
              <Tag className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white font-semibold">Promo</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition-all group"
            >
              <Calendar className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white font-semibold">History</span>
            </motion.button>
          </motion.div>

          {/* Statistics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {/* Cashback Today */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/80 text-sm">Cashback Hari Ini</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                Rp {cashbackToday.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-green-300 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12% dari kemarin</span>
              </div>
            </motion.div>

            {/* Active Orders */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/80 text-sm">Pesanan Aktif</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {activeOrders}
              </p>
              <div className="flex items-center gap-1 text-blue-300 text-sm">
                <Gift className="w-4 h-4" />
                <span>Dalam proses pengiriman</span>
              </div>
            </motion.div>

            {/* Active Promotions */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/80 text-sm">Promo Member</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {activePromos}
              </p>
              <div className="flex items-center gap-1 text-orange-300 text-sm">
                <Gift className="w-4 h-4" />
                <span>Promo eksklusif aktif</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Member Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Phone */}
            <Card className="bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Nomor HP</p>
                    <p className="text-white font-semibold">
                      {user?.phone || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Email</p>
                    <p className="text-white font-semibold text-sm truncate">
                      {user?.email || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Alamat</p>
                    <p className="text-white font-semibold text-sm truncate">
                      {user?.address || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100 to-transparent"></div>
      </motion.div>
    </div>
  )
}
