'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Crown, Gift, Activity, Bell, Settings, QrCode, Award, Sparkles, ChevronRight, LogOut, Mail, Phone, MapPin, Lock, Volume2, Globe, History, Ticket, Edit2, Shield, Sun, Moon, Music, FileText, HelpCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import Barcode from 'react-barcode'
import { ScrollArea } from '@/components/ui/scroll-area'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

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
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showMembershipModal, setShowMembershipModal] = useState(false)
  const [showRewardsModal, setShowRewardsModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [showNotificationToneModal, setShowNotificationToneModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false)

  // Edit profile form state
  const [editProfile, setEditProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Notification tone state
  const [selectedTone, setSelectedTone] = useState('chime')

  // Privacy settings state
  const [profilePrivate, setProfilePrivate] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  // Load user settings from database
  useEffect(() => {
    if (user?.id) {
      // Load settings
      fetch(`/api/user/settings?userId=${user.id}`)
        .then(async (res) => {
          if (res.status === 404) {
            console.error('User not found in database')
            toast.error('Sesi kedaluwarsa, silakan login kembali')
            return null
          }
          return res.json()
        })
        .then((data) => {
          if (data && data.settings) {
            setIsDarkMode(data.settings.theme === 'dark')
            setSelectedTone(data.settings.notificationSound || 'chime')
            setProfilePrivate(data.settings.profilePrivate || false)
            setEmailNotifications(data.settings.emailNotifications ?? true)
            setSmsNotifications(data.settings.smsNotifications ?? false)
          }
        })
        .catch((error) => {
          console.error('Error loading settings:', error)
        })

      // Load profile data for edit form
      fetch(`/api/user/profile?userId=${user.id}`)
        .then(async (res) => {
          if (res.status === 404) {
            console.error('User not found in database')
            toast.error('Sesi kedaluwarsa, silakan login kembali')
            return null
          }
          return res.json()
        })
        .then((data) => {
          if (data && data.user) {
            setEditProfile({
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
              address: data.user.address || ''
            })
          }
        })
        .catch((error) => {
          console.error('Error loading profile:', error)
        })
    }
  }, [user?.id])

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

  // Handle menu click - open corresponding modal and track access
  const handleMenuClick = async (menuId: string) => {
    if (!user || !user.id) {
      toast.error('Peringatan: Silakan login terlebih dahulu')
      return
    }

    const menuLabel = menuItems.find(m => m.id === menuId)?.label || menuId

    // Track menu access in database (non-blocking - modal opens even if tracking fails)
    if (user.id && user.id.length > 0) {
      fetch('/api/user/menu-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          menuId,
          menuName: menuLabel
        })
      })
        .then(async (response) => {
          if (response.ok) {
            const result = await response.json()
            console.log('Menu access tracked successfully:', menuLabel, result)
          } else {
            const error = await response.json().catch(() => ({}))
            console.error('Failed to track menu access:', error.error || 'Unknown error')
            // Silently fail - don't show toast to user, just log
          }
        })
        .catch((error) => {
          console.error('Error tracking menu access:', error)
          // Silently fail - don't block the modal from opening
        })
    }

    // Open corresponding modal based on menu ID (always open modal)
    switch (menuId) {
      case 'account':
        setShowAccountModal(true)
        break
      case 'membership':
        setShowMembershipModal(true)
        break
      case 'rewards':
        setShowRewardsModal(true)
        break
      case 'activity':
        setShowActivityModal(true)
        break
      case 'notification':
        setShowNotificationModal(true)
        break
      case 'settings':
        setShowSettingsModal(true)
        break
      default:
        toast.success(`Anda membuka ${menuLabel}`)
    }
  }

  const progress = calculateProgress()
  const pointsNeeded = getPointsNeeded()

  // Edit profile handler
  const handleEditProfile = async () => {
    if (!user?.id) {
      toast.error('User ID tidak ditemukan')
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...editProfile
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui profil')
      }

      toast.success('Profil berhasil diperbarui')
      setShowEditProfileModal(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Gagal memperbarui profil')
    }
  }

  // Security handler
  const handleSecurityUpdate = async () => {
    if (!user?.id) {
      toast.error('User ID tidak ditemukan')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Password baru tidak cocok')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    try {
      const response = await fetch('/api/user/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui password')
      }

      toast.success('Password berhasil diperbarui')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowSecurityModal(false)
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui password')
    }
  }

  // Theme toggle handler
  const toggleTheme = async () => {
    if (!user?.id) {
      toast.error('User ID tidak ditemukan')
      return
    }

    const newTheme = !isDarkMode ? 'dark' : 'light'

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          theme: newTheme
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengubah tema')
      }

      setIsDarkMode(!isDarkMode)
      toast.success(!isDarkMode ? 'Tema gelap diaktifkan' : 'Tema terang diaktifkan')
    } catch (error) {
      console.error('Error updating theme:', error)
      toast.error('Gagal mengubah tema')
    }
  }

  // Notification tone handler
  const handleToneSelect = async (tone: string) => {
    if (!user?.id) {
      toast.error('User ID tidak ditemukan')
      return
    }

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          notificationSound: tone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengubah nada notifikasi')
      }

      setSelectedTone(tone)
      toast.success(`Nada notifikasi: ${tone}`)
    } catch (error) {
      console.error('Error updating notification tone:', error)
      toast.error('Gagal mengubah nada notifikasi')
    }
  }

  // Privacy toggle handler
  const handlePrivacyToggle = async (setting: 'profilePrivate' | 'emailNotifications' | 'smsNotifications', value: boolean) => {
    if (!user?.id) {
      toast.error('User ID tidak ditemukan')
      return
    }

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          [setting]: value
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui pengaturan')
      }

      // Update local state
      if (setting === 'profilePrivate') setProfilePrivate(value)
      if (setting === 'emailNotifications') setEmailNotifications(value)
      if (setting === 'smsNotifications') setSmsNotifications(value)

      toast.success('Pengaturan berhasil diperbarui')
    } catch (error) {
      console.error('Error updating privacy settings:', error)
      toast.error('Gagal memperbarui pengaturan')
    }
  }

  // Terms accept handler
  const handleTermsAccept = async () => {
    if (!user?.id) {
      toast.error('User ID tidak ditemukan')
      return
    }

    try {
      const response = await fetch('/api/user/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyetujui persyaratan')
      }

      toast.success('Syarat dan ketentuan disetujui')
      setShowTermsModal(false)
    } catch (error) {
      console.error('Error accepting terms:', error)
      toast.error('Gagal menyetujui persyaratan')
    }
  }

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
                        <span className="text-xs font-medium">Buka</span>
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
        <VisuallyHidden.Root>
          <DialogTitle>Barcode Member</DialogTitle>
        </VisuallyHidden.Root>
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

      {/* Account Modal */}
      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              Akun Saya
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <User className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500">Nama Lengkap</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{user?.email || 'email@example.com'}</p>
                  <p className="text-xs text-gray-500">Email</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{user?.phone || '08123456789'}</p>
                  <p className="text-xs text-gray-500">Nomor Telepon</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{user?.address || 'Alamat belum diisi'}</p>
                  <p className="text-xs text-gray-500">Alamat</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Membership Modal */}
      <Dialog open={showMembershipModal} onOpenChange={setShowMembershipModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Membership
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 mt-4">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${membership.color} text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{membership.level} Member</h3>
                  <Crown className="w-8 h-8" />
                </div>
                <p className="text-sm opacity-90">Level membership Anda saat ini</p>
              </div>
              <div className="p-4 rounded-xl bg-white border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3">Progress Membership</h4>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1 }}
                    className={`absolute left-0 top-0 h-full bg-gradient-to-r ${membership.color} rounded-full`}
                  />
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{getCurrentLevelStart()} poin</span>
                  <span className="text-gray-600">{getNextLevelPoints()} poin</span>
                </div>
                <p className="text-center text-sm font-semibold text-gray-700">
                  {pointsNeeded} ke level selanjutnya
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {['Bronze', 'Silver', 'Gold', 'Platinum', 'VIP'].map((level) => {
                  const levelColor = {
                    Bronze: 'from-orange-600 to-orange-700',
                    Silver: 'from-gray-400 to-gray-500',
                    Gold: 'from-amber-500 to-amber-600',
                    Platinum: 'from-slate-500 to-slate-700',
                    VIP: 'from-purple-600 to-purple-800'
                  }[level]
                  const levelPoints = { Bronze: 0, Silver: 500, Gold: 1000, Platinum: 2500, VIP: 5000 }[level]
                  return (
                    <div
                      key={level}
                      className={`p-3 rounded-lg border-2 ${
                        membership.level === level
                          ? `bg-gradient-to-r border-white ${levelColor} text-white`
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <p className="font-bold text-sm">{level}</p>
                      <p className="text-xs opacity-90">{levelPoints} poin</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Rewards Modal */}
      <Dialog open={showRewardsModal} onOpenChange={setShowRewardsModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-600" />
              Reward & Loyalty
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 mt-4">
              {vouchers.length > 0 ? (
                vouchers.map((voucher: any) => (
                  <div key={voucher.id} className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-gray-800">{voucher.name || 'Voucher'}</h4>
                      </div>
                      <Badge className="bg-amber-600 text-white">{voucher.discount || 'Diskon'}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{voucher.description || 'Voucher khusus member'}</p>
                    <p className="text-xs text-gray-500">Berlaku hingga: {voucher.expiry || '31 Des 2025'}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Belum ada voucher</p>
                  <p className="text-xs text-gray-400 mt-1">Kumpulkan poin untuk mendapatkan voucher</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Activity Modal */}
      <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Aktivitas
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <History className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Login Terakhir</p>
                  <p className="text-xs text-gray-500">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Total Poin</p>
                  <p className="text-xs text-gray-500">{user?.points || 0} poin terkumpul</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Gift className="w-5 h-5 text-pink-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Voucher Terpakai</p>
                  <p className="text-xs text-gray-500">Riwayat penggunaan voucher</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Notification Modal */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notifikasi
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Gift className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Bonus Poin</p>
                  <p className="text-xs text-gray-500">Anda mendapatkan 10 poin dari pembelian</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Crown className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Upgrade Membership</p>
                  <p className="text-xs text-gray-500">Selamat! Level membership naik ke {membership.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Ticket className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Voucher Baru</p>
                  <p className="text-xs text-gray-500">Voucher spesial telah tersedia</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Pengaturan
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 mt-4">
              {/* Edit Profile */}
              <div
                onClick={() => setShowEditProfileModal(true)}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Edit2 className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Edit Profile</p>
                    <p className="text-xs text-gray-500">Ubah informasi profil</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Security & Privacy */}
              <div
                onClick={() => setShowSecurityModal(true)}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Keamanan & Privasi</p>
                    <p className="text-xs text-gray-500">Password dan privasi</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Theme */}
              <div
                onClick={() => setShowThemeModal(true)}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    {isDarkMode ? <Moon className="w-5 h-5 text-amber-600" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Tema</p>
                    <p className="text-xs text-gray-500">{isDarkMode ? 'Tema Gelap' : 'Tema Terang'}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Notification Tone */}
              <div
                onClick={() => setShowNotificationToneModal(true)}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Music className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Nada Notifikasi</p>
                    <p className="text-xs text-gray-500">Pilih nada pesan masuk</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Language */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Globe className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Bahasa</p>
                    <p className="text-xs text-gray-500">Pilih bahasa aplikasi</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-600">Bahasa Indonesia</span>
              </div>

              {/* Terms & Conditions */}
              <div
                onClick={() => setShowTermsModal(true)}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Persyaratan & Persetujuan</p>
                    <p className="text-xs text-gray-500">Syarat dan ketentuan</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Help Center */}
              <div
                onClick={() => setShowHelpCenterModal(true)}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Pusat Bantuan</p>
                    <p className="text-xs text-gray-500">FAQ dan dukungan</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-red-600" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={editProfile.name}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-sm"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={editProfile.email}
                  onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-sm"
                  placeholder="Masukkan email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nomor Telepon</label>
                <input
                  type="tel"
                  value={editProfile.phone}
                  onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-sm"
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Alamat</label>
                <textarea
                  value={editProfile.address}
                  onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-sm resize-none"
                  rows={3}
                  placeholder="Masukkan alamat"
                />
              </div>
              <Button
                onClick={handleEditProfile}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold"
              >
                Simpan Perubahan
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Security & Privacy Modal */}
      <Dialog open={showSecurityModal} onOpenChange={setShowSecurityModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Keamanan & Privasi
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 mt-4">
              {/* Password Change Section */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                <h4 className="font-bold text-gray-800 mb-3">Ubah Password</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">Password Saat Ini</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">Password Baru</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">Konfirmasi Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <Button
                    onClick={handleSecurityUpdate}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                  >
                    Update Password
                  </Button>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800">Pengaturan Privasi</h4>
                <div
                  onClick={() => handlePrivacyToggle('profilePrivate', !profilePrivate)}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Profil Privat</p>
                      <p className="text-xs text-gray-500">Sembunyikan profil dari orang lain</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${profilePrivate ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <div
                  onClick={() => handlePrivacyToggle('emailNotifications', !emailNotifications)}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Notifikasi Email</p>
                      <p className="text-xs text-gray-500">Terima update via email</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${emailNotifications ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <div
                  onClick={() => handlePrivacyToggle('smsNotifications', !smsNotifications)}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Notifikasi SMS</p>
                      <p className="text-xs text-gray-500">Terima update via SMS</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${smsNotifications ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Theme Modal */}
      <Dialog open={showThemeModal} onOpenChange={setShowThemeModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-600" />
              Tema
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-600">Pilih tema untuk tampilan aplikasi</p>
              
              <div
                onClick={toggleTheme}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  !isDarkMode
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-400'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-xl flex items-center justify-center shadow-md">
                    <Sun className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">Tema Terang</h4>
                    <p className="text-xs text-gray-500">Tampilan terang dan cerah</p>
                  </div>
                  {!isDarkMode && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>

              <div
                onClick={toggleTheme}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 border-slate-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-md">
                    <Moon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Tema Gelap</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tampilan gelap dan nyaman di mata</p>
                  </div>
                  {isDarkMode && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Notification Tone Modal */}
      <Dialog open={showNotificationToneModal} onOpenChange={setShowNotificationToneModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="w-5 h-5 text-green-600" />
              Nada Notifikasi
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-600">Pilih nada notifikasi untuk pesan masuk</p>

              {[
                { id: 'chime', name: 'Chime', description: 'Nada notifikasi standar' },
                { id: 'bell', name: 'Bell', description: 'Nada lonceng klasik' },
                { id: 'whistle', name: 'Whistle', description: 'Nada peluit' },
                { id: 'pop', name: 'Pop', description: 'Nada pop ringan' },
                { id: 'cheer', name: 'Cheer', description: 'Nada semangat' },
                { id: 'melody', name: 'Melody', description: 'Melodi musik' },
              ].map((tone) => (
                <div
                  key={tone.id}
                  onClick={() => handleToneSelect(tone.name)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedTone === tone.name
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-md">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{tone.name}</h4>
                      <p className="text-xs text-gray-500">{tone.description}</p>
                    </div>
                    {selectedTone === tone.name && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toast.success(`Memutar: ${tone.name}`)
                      }}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Putar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Persyaratan & Persetujuan
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3">Syarat dan Ketentuan</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    Selamat datang di aplikasi membership kami. Dengan menggunakan aplikasi ini, Anda menyetujui syarat dan ketentuan berikut:
                  </p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      <strong>Pendaftaran Member:</strong> Setiap pendaftaran member berlaku selamanya dan tidak dapat dipindahtangankan.
                    </li>
                    <li>
                      <strong>Pengumpulan Poin:</strong> Poin dapat dikumpulkan dari setiap transaksi pembelian. 1 poin = Rp 1.000.
                    </li>
                    <li>
                      <strong>Membership Level:</strong> Level membership ditentukan berdasarkan total poin yang terkumpul.
                    </li>
                    <li>
                      <strong>Voucher dan Reward:</strong> Voucher yang diterima memiliki masa berlaku tertentu dan tidak dapat digabungkan.
                    </li>
                    <li>
                      <strong>Privasi Data:</strong> Kami menjaga kerahasiaan data pribadi Anda dan tidak akan membagikannya kepada pihak ketiga tanpa izin.
                    </li>
                    <li>
                      <strong>Penggunaan Aplikasi:</strong> Penggunaan aplikasi yang melanggar hukum dapat mengakibatkan pemblokiran akun.
                    </li>
                    <li>
                      <strong>Perubahan Ketentuan:</strong> Kami berhak mengubah syarat dan ketentuan sewaktu-waktu dengan pemberitahuan sebelumnya.
                    </li>
                  </ol>
                  <p className="text-xs text-gray-500 mt-4">
                    Terakhir diperbarui: 1 Januari 2025
                  </p>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-semibold"
                onClick={handleTermsAccept}
              >
                Saya Setuju
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Help Center Modal */}
      <Dialog open={showHelpCenterModal} onOpenChange={setShowHelpCenterModal}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-600" />
              Pusat Bantuan
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 mt-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari bantuan..."
                  className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-all text-sm"
                />
                <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* FAQ Section */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Pertanyaan Umum (FAQ)</h4>
                <div className="space-y-2">
                  {[
                    { q: 'Bagaimana cara mengumpulkan poin?', a: 'Setiap pembelian Rp 1.000 = 1 poin. Tunjukkan barcode member Anda di kasir untuk mendapatkan poin.' },
                    { q: 'Bagaimana cara upgrade membership?', a: 'Kumpulkan poin untuk mencapai level berikutnya: Bronze (0), Silver (500), Gold (1000), Platinum (2500), VIP (5000).' },
                    { q: 'Bagaimana cara menggunakan voucher?', a: 'Pilih voucher yang ingin digunakan dan tunjukkan ke kasir saat checkout. Voucher tidak dapat digabungkan.' },
                    { q: 'Berapa lama masa berlaku voucher?', a: 'Masa berlaku voucher bervariasi tergantung jenis voucher. Cek detail voucher untuk informasi lebih lanjut.' },
                    { q: 'Bagaimana cara mengubah password?', a: 'Buka menu Pengaturan > Keamanan & Privasi > Ubah Password.' },
                    { q: 'Bagaimana cara menghubungi dukungan?', a: 'Anda dapat menghubungi kami melalui email support@example.com atau WhatsApp 0812-3456-7890.' },
                  ].map((faq, index) => (
                    <div key={index} className="p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{faq.q}</p>
                      <p className="text-xs text-gray-600">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Support */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                <h4 className="font-bold text-gray-800 mb-3">Butuh Bantuan Lebih?</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.success('Membuka WhatsApp...')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp: 0812-3456-7890
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.success('Membuka email...')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email: support@example.com
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
