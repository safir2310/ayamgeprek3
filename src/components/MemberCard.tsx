'use client'

import { motion } from 'framer-motion'
import { CreditCard, QrCode, BarChart3, Award, Zap, Calendar, Clock, Shield, User, MapPin, Phone, Mail, Settings, Bell, Gift, History, Heart, Star, ChevronRight, Copy, Eye, EyeOff } from 'lucide-react'

interface MemberCardProps {
  user: any
  points?: number
  onBarcodeClick?: () => void
  onQRClick?: () => void
  showBarcode?: boolean
  showQR?: boolean
}

export function MemberCard({ user, points, onBarcodeClick, onQRClick, showBarcode, showQR }: MemberCardProps) {
  // Get membership status based on points
  const getMembershipStatus = () => {
    if (points && points >= 10000) return { level: 'VIP Exclusive', color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-600 to-violet-600' }
    if (points && points >= 5000) return { level: 'Platinum', color: 'text-slate-700', bg: 'bg-slate-100', gradient: 'from-slate-600 to-gray-600' }
    if (points && points >= 1000) return { level: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-100', gradient: 'from-yellow-500 to-amber-500' }
    return { level: 'Silver', color: 'text-gray-600', bg: 'bg-gray-100', gradient: 'from-gray-400 to-gray-500' }
  }

  const membership = getMembershipStatus()

  // Generate member number automatically
  const memberNumber = user?.memberNumber || `AYM${String(user?.id || '').padStart(6, '0')}`

  // Calculate expiration (1 year from now)
  const expirationDate = new Date()
  expirationDate.setFullYear(expirationDate.getFullYear() + 1)

  return (
    <>
      {/* Member Digital Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.94, 0.98] }}
        className="relative w-full max-w-md mx-auto"
      >
        {/* Card Container with Credit Card Size */}
        <div className={`relative rounded-3xl overflow-hidden p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl bg-gradient-to-br ${membership.gradient} shadow-2xl`}>
          {/* Glassmorphism Effect */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

          {/* Batik Watermark Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
            <div className="absolute top-4 left-4 w-32 h-32 border border-white/30 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-24 h-24 border border-white/30 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full"></div>
          </div>

          {/* Floating Light Effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/15 rounded-full blur-2xl"></div>

          {/* Card Content */}
          <div className="relative z-10 space-y-4">
            {/* Top Section - Logo & Status */}
            <div className="flex justify-between items-start">
              {/* Logo & Status */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${membership.bg} ${membership.color} border border-white/40`}>
                  {membership.level}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBarcodeClick}
                  className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all"
                >
                  <BarChart3 className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onQRClick}
                  className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all"
                >
                  <QrCode className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Middle Section - Member Info */}
            <div className="space-y-3">
              {/* Member Number */}
              <div className="font-mono text-xl tracking-widest text-white/90 font-bold">
                {memberNumber}
              </div>

              {/* Member Name & Expiry */}
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-xs text-white/70 uppercase tracking-wider">Member Name</p>
                  <p className="text-white font-semibold text-lg">
                    {user?.name || 'Member'}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs text-white/70 uppercase tracking-wider">Valid Thru</p>
                  <p className="text-white font-mono font-semibold">
                    {expirationDate.toLocaleDateString('id-ID', { month: '2-digit', year: '2-digit' }).replace('/', '/')}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Section - Points & Chip */}
            <div className="flex justify-between items-center">
              {/* Chip */}
              <div className="relative">
                <div className="w-14 h-10 bg-gradient-to-br from-yellow-300/40 to-yellow-500/40 rounded-lg border border-yellow-300/30">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="w-1.5 h-1.5 bg-yellow-200/50 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-yellow-200/50 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-yellow-200/50 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-yellow-200/50 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-yellow-200/50 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-yellow-200/50 rounded-full"></div>
                    </div>
                  </div>
                </div>
                {/* NFC Icon */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                  <Zap className="w-2 h-2 text-white" />
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="text-xs text-white/70 uppercase tracking-wider">Reward Points</p>
                <p className="text-2xl font-bold text-white flex items-center justify-end gap-1">
                  <Award className="w-5 h-5" />
                  {points || user?.points || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Glossy Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Phone Number Below Card */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <Phone className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {user?.phone || '-'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Barcode Popup */}
      {showBarcode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => onBarcodeClick?.()}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Barcode Member</h3>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="font-mono text-2xl tracking-widest text-gray-800">
                  {memberNumber}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Scan barcode ini saat checkout untuk mendapatkan poin reward
              </p>
              <button
                onClick={() => onBarcodeClick?.()}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-600 transition-all"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* QR Popup */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => onQRClick?.()}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
                <QrCode className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">QR Code Member</h3>
              <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block">
                {/* Dynamic QR Code Simulation */}
                <div className="w-48 h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-10 gap-0.5 p-4">
                    {[...Array(100)].map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-white"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Scan QR Code ini saat checkout untuk mendapatkan poin reward
              </p>
              <button
                onClick={() => onQRClick?.()}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-600 transition-all"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
