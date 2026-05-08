'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Crown, Gift, Activity, Bell, Settings, QrCode, Award, Sparkles, ChevronRight, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from 'sonner'
import Barcode from 'react-barcode'

interface ProfilePageProps {
  user: any
  vouchers?: any[]
  onLogout?: () => void
}

// Batik pattern SVG - moved outside component to avoid recreation during render
const BatikPattern = () => (
  <svg className="absolute inset-0 opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <pattern id="batik" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10 L10 0 L20 10 L10 20 Z" fill="currentColor" className="text-white"/>
        <circle cx="10" cy="10" r="3" fill="currentColor" className="text-white" opacity="0.5"/>
      </pattern>
    </defs>
    <rect width="100" height="100" fill="url(#batik)"/>
  </svg>
)

export default function ProfilePage({ user, vouchers = [], onLogout }: ProfilePageProps) {
  const [showBarcodeModal, setShowBarcodeModal] = useState(false)

  // Get membership level based on points
  const getMembershipLevel = () => {
    const points = user?.points || 0
    if (points >= 5000) return { level: 'VIP', color: 'from-purple-600 to-purple-800', textColor: 'text-purple-600' }
    if (points >= 2500) return { level: 'Platinum', color: 'from-slate-500 to-slate-700', textColor: 'text-slate-600' }
    if (points >= 1000) return { level: 'Gold', color: 'from-amber-500 to-amber-600', textColor: 'text-amber-600' }
    if (points >= 500) return { level: 'Silver', color: 'from-gray-400 to-gray-500', textColor: 'text-gray-600' }
    return { level: 'Bronze', color: 'from-orange-600 to-orange-700', textColor: 'text-orange-600' }
  }

  const membership = getMembershipLevel()

  // Calculate progress
  const calculateProgress = () => {
    const currentPoints = user?.points || 0
    let progress = 0
    if (currentPoints >= 5000) progress = 100
    else if (currentPoints >= 2500) progress = ((currentPoints - 2500) / 2500) * 100
    else if (currentPoints >= 1000) progress = ((currentPoints - 1000) / 1500) * 100
    else if (currentPoints >= 500) progress = ((currentPoints - 500) / 500) * 100
    else progress = (currentPoints / 500) * 100
    return Math.min(Math.max(progress, 5), 100)
  }

  const getNextLevelPoints = () => {
    const currentPoints = user?.points || 0
    const nextLevelPoints = [500, 1000, 2500, 5000].find(p => p > currentPoints)
    return nextLevelPoints || 5000
  }

  const getCurrentLevelStart = () => {
    const currentPoints = user?.points || 0
    const levels = [0, 500, 1000, 2500, 5000]
    let rangeStart = 0
    for (let i = levels.length - 1; i >= 0; i--) {
      if (currentPoints >= levels[i]) {
        rangeStart = levels[i]
        break
      }
    }
    return rangeStart
  }

  const getPointsNeeded = () => {
    const currentPoints = user?.points || 0
    const nextLevelPoints = [500, 1000, 2500, 5000].find(p => p > currentPoints)
    return nextLevelPoints ? `${nextLevelPoints - currentPoints} poin lagi` : 'Level Max'
  }

  // Menu items
  const menuItems = [
    { id: 'account', icon: User, label: 'Akun Saya', color: 'from-red-500 to-orange-500', badge: null },
    { id: 'membership', icon: Crown, label: 'Membership', color: 'from-purple-500 to-purple-600', badge: membership.level },
    { id: 'rewards', icon: Gift, label: 'Reward & Loyalty', color: 'from-amber-500 to-yellow-500', badge: `${vouchers.length} Voucher` },
    { id: 'activity', icon: Activity, label: 'Aktivitas', color: 'from-green-500 to-emerald-500', badge: null },
    { id: 'notification', icon: Bell, label: 'Notifikasi', color: 'from-blue-500 to-cyan-500', badge: null },
    { id: 'settings', icon: Settings, label: 'Pengaturan', color: 'from-gray-500 to-gray-600', badge: null },
  ]

  // Glassmorphism card style
  const glassCardStyle = "bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-black/5"

  // Handle menu click - save data to database
  const handleMenuClick = async (menuId: string) => {
    if (!user) {
      toast.error('Peringatan: Silakan login terlebih dahulu')
      return
    }

    // Track menu access in database
    try {
      const response = await fetch('/api/user/menu-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          menuId,
          menuName: menuItems.find(m => m.id === menuId)?.label || menuId
        })
      })

      if (!response.ok) {
        console.error('Failed to track menu access')
      }
    } catch (error) {
      console.error('Error tracking menu access:', error)
    }

    // Show toast notification
    toast.success(`Anda mengakses menu ${menuItems.find(m => m.id === menuId)?.label || menuId}`)
  }

  const progress = calculateProgress()
  const pointsNeeded = getPointsNeeded()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header with Batik pattern */}
      <div className={`relative bg-gradient-to-br ${membership.color} pt-12 pb-24 px-6 overflow-hidden`}>
        <BatikPattern />
        <div className="relative z-10">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative mb-4"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border-4 border-white/80 shadow-2xl flex items-center justify-center">
                {user?.name ? (
                  <span className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-12 h-12 text-purple-400" />
                )}
              </div>
              {/* Sparkle effects */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-1 drop-shadow-lg"
            >
              {user?.name || 'Guest'}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <Badge className={`bg-gradient-to-r ${membership.color} text-white border-2 border-white/50 px-3 py-1 text-sm font-semibold shadow-lg`}>
                <Crown className="w-4 h-4 mr-1" />
                {membership.level} Member
              </Badge>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 max-w-sm mx-auto"
          >
            {[
              { label: 'Poin', value: user?.points || 0, icon: Award, bg: 'from-yellow-400 to-orange-400' },
              { label: 'Voucher', value: vouchers.length || 0, icon: Gift, bg: 'from-pink-400 to-purple-400' },
              { label: 'Member ID', value: user?.id?.slice(-6) || '------', icon: User, bg: 'from-blue-400 to-cyan-400' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-3 text-center shadow-lg border border-white/60"
              >
                <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-16 relative z-20 pb-24">
        {/* Digital Member Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
          className="mb-6"
        >
          <div className="w-full max-w-sm mx-auto">
            <Card className={`overflow-hidden ${glassCardStyle}`}>
              {/* Card Header */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                <BatikPattern />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-yellow-300">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Member Card</h3>
                        <p className={`text-xs ${membership.textColor} font-semibold`}>
                          {membership.level} Member
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Award className="w-5 h-5 text-yellow-400" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Card Number */}
                  <div className="mb-4">
                    <p className="text-[10px] text-gray-400 mb-1 font-medium">MEMBER NUMBER</p>
                    <p className="text-white font-mono text-lg tracking-widest">
                      {user?.phone ? user.phone.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '**** **** ****'}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-gray-400 mb-1">MEMBER SINCE</p>
                      <p className="text-white text-xs font-semibold">
                        {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2025'}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowBarcodeModal(true)}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                    >
                      <QrCode className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-semibold">Barcode</span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Card Progress */}
              <div className="p-4 bg-white/80 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      Progress ke {membership.level === 'VIP' ? 'MAX' : 'level selanjutnya'}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${membership.textColor}`}>
                    {pointsNeeded}
                  </span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`absolute left-0 top-0 h-full bg-gradient-to-r ${membership.color} rounded-full`}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-gray-400 font-medium">
                    {getCurrentLevelStart()}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">
                    {getNextLevelPoints()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Menu List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-sm mx-auto"
        >
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`${glassCardStyle} p-4 cursor-pointer hover:shadow-2xl transition-all duration-300 group`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors truncate">
                          {item.label}
                        </h3>
                        {item.badge && (
                          <Badge variant="secondary" className="text-[9px] font-semibold ml-2 flex-shrink-0">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-gray-400 group-hover:text-purple-500 transition-colors">
                        <span className="text-xs font-medium">Akses</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="max-w-sm mx-auto mt-6"
        >
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all font-semibold"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Keluar
          </Button>
        </motion.div>
      </div>

      {/* Barcode Modal */}
      <Dialog open={showBarcodeModal} onOpenChange={setShowBarcodeModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto p-0 overflow-hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="p-4 sm:p-6"
          >
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${membership.color} mb-4`}>
                <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Barcode Member</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Scan barcode ini di kasir</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200/50 p-3 sm:p-6 mb-4">
              <div className="w-full flex justify-center">
                <Barcode
                  value={user?.phone || '0000000000'}
                  width={2}
                  height={45}
                  format="CODE128"
                  displayValue={false}
                  background="#fffbf0"
                  lineColor="#ea580c"
                  margin={0}
                />
              </div>
              <div className="text-center mt-2 sm:mt-4">
                <p className="text-[8px] sm:text-[10px] text-orange-400/70 font-semibold tracking-wider mb-1">PHONE NUMBER</p>
                <p className="text-sm sm:text-lg font-mono font-bold text-orange-600 tracking-wider break-all">
                  {user?.phone ? user.phone.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3') : '0000-0000-0000'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 sm:p-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500">{membership.level} Member</p>
                </div>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
