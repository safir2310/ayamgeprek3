'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Camera, Phone, Mail, MapPin, CreditCard, BarChart3, QrCode, TrendingUp, History, ShoppingBag, Heart, Star, Bell, Gift, Settings, Moon, Sun, Globe, Shield, LogOut, ChevronRight, Edit, Crown, Zap, Calendar, Award, Copy, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { MemberCard } from './MemberCard'

interface ProfilePageProps {
  user?: any
  points?: number
}

interface MenuItem {
  id: string
  icon: any
  title: string
  description?: string
  color: string
  badge?: string
  onClick: () => void
}

export function ProfilePage({ user, points }: ProfilePageProps) {
  const [showBarcodePopup, setShowBarcodePopup] = useState(false)
  const [showQRPopup, setShowQRPopup] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  })
  const [newPassword, setNewPassword] = useState('')

  // Get membership status based on points
  const getMembershipStatus = () => {
    if (points && points >= 10000) return { level: 'VIP Exclusive', color: 'bg-purple-600', textColor: 'text-white' }
    if (points && points >= 5000) return { level: 'Platinum', color: 'bg-slate-600', textColor: 'text-white' }
    if (points && points >= 1000) return { level: 'Gold', color: 'bg-yellow-500', textColor: 'text-white' }
    return { level: 'Silver', color: 'bg-gray-500', textColor: 'text-white' }
  }

  const membership = getMembershipStatus()

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
      })
    }
  }, [user])

  const menuItems: MenuItem[] = [
    {
      id: 'account',
      icon: User,
      title: 'Akun Saya',
      description: 'Kelola informasi akun',
      color: 'bg-blue-500',
      onClick: () => setIsEditProfileOpen(true),
    },
    {
      id: 'membership',
      icon: CreditCard,
      title: 'Membership',
      description: 'Kartu member digital',
      color: 'bg-yellow-500',
      onClick: () => {},
    },
    {
      id: 'rewards',
      icon: Gift,
      title: 'Reward & Loyalty',
      description: `${points || 0} poin reward`,
      color: 'bg-purple-500',
      badge: points && points > 0 ? `${points} Poin` : undefined,
      onClick: () => {},
    },
    {
      id: 'activity',
      icon: History,
      title: 'Aktivitas',
      description: 'Riwayat & pesanan',
      color: 'bg-green-500',
      onClick: () => {},
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifikasi',
      description: 'Promo & event',
      color: 'bg-orange-500',
      badge: '2',
      onClick: () => {},
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Pengaturan',
      description: 'Preferensi akun',
      color: 'bg-gray-600',
      onClick: () => {},
    },
  ]

  const subMenuItems = {
    account: [
      { icon: Edit, title: 'Edit Profile', description: 'Ubah nama & foto' },
      { icon: Camera, title: 'Ubah Foto', description: 'Ganti foto profil' },
      { icon: Phone, title: 'Nomor HP', description: profileData.phone || '-' },
      { icon: Mail, title: 'Email', description: profileData.email || '-' },
      { icon: MapPin, title: 'Alamat', description: profileData.address || '-' },
    ],
    membership: [
      { icon: BarChart3, title: 'Kartu Member', description: 'Lihat kartu digital' },
      { icon: QrCode, title: 'QR Code Member', description: 'Scan untuk poin' },
      { icon: TrendingUp, title: 'Upgrade Membership', description: 'Ke VIP Exclusive' },
      { icon: Calendar, title: 'Riwayat Poin', description: 'Histori poin' },
    ],
    rewards: [
      { icon: Gift, title: 'Tukar Poin', description: 'Penukaran poin' },
      { icon: Award, title: 'Voucher Hadiah', description: `${points ? Math.floor(points / 500) : 0} voucher` },
      { icon: Star, title: 'Promo Spesial', description: 'Diskon eksklusif' },
      { icon: Zap, title: 'Cashback', description: 'Cashback & rebate' },
    ],
    activity: [
      { icon: History, title: 'Riwayat Transaksi', description: 'Semua transaksi' },
      { icon: ShoppingBag, title: 'Pesanan Aktif', description: 'Pesanan berjalan' },
      { icon: Heart, title: 'Favorite Menu', description: 'Menu favorit' },
      { icon: Star, title: 'Review Pembelian', description: 'Ulasan produk' },
    ],
    notifications: [
      { icon: Bell, title: 'Promo Terbaru', description: 'Promo terhangat' },
      { icon: Gift, title: 'Event Member', description: 'Event eksklusif' },
      { icon: Calendar, title: 'Reminder Reward', description: 'Poin kadaluarsa' },
    ],
    settings: [
      { icon: isDarkMode ? Moon : Sun, title: 'Dark Mode', description: isDarkMode ? 'Aktif' : 'Nonaktif' },
      { icon: Globe, title: 'Bahasa', description: 'Bahasa Indonesia' },
      { icon: Shield, title: 'Keamanan Akun', description: 'Ubah password' },
      { icon: LogOut, title: 'Logout', description: 'Keluar akun', color: 'text-red-600' },
    ],
  }

  const handleCopyMemberNumber = () => {
    const memberNumber = `AYM${String(user?.id || '').padStart(6, '0')}`
    navigator.clipboard.writeText(memberNumber)
    toast.success('Nomor member berhasil disalin!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        {/* Background Gradient Premium */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 opacity-90"></div>

        {/* Batik Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white/20 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white/15 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 border-4 border-white/10 rounded-full"></div>
        </div>

        {/* Glassmorphism Effect */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Photo */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-28 h-28 bg-gradient-to-br from-white to-gray-100 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center">
                      <User className="w-14 h-14 text-white" />
                    </div>
                  )}
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-xl"></div>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 space-y-3">
                {/* Name & Membership Status */}
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold text-white">
                    {user?.name || 'Member'}
                  </h1>
                  <Badge className={`px-4 py-1.5 ${membership.color} ${membership.textColor} text-sm font-semibold border-2 border-white/30 shadow-lg`}>
                    <Crown className="w-4 h-4 mr-1" />
                    {membership.level}
                  </Badge>
                </div>

                {/* Member Number */}
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/30">
                    <span className="font-mono text-xl tracking-widest text-white font-bold">
                      AYM{String(user?.id || '').padStart(6, '0')}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyMemberNumber}
                    className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all"
                  >
                    <Copy className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Total Points */}
                <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/30 inline-block">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-semibold">
                      Total Reward Points: <span className="text-2xl font-bold ml-1">{points || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Menu Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-6">
            <AnimatePresence>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={item.onClick}
                  className="relative group"
                >
                  <Card className="h-full bg-white rounded-2xl border-2 border-transparent hover:border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
                    <CardContent className="p-6">
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>

                      {/* Icon */}
                      <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <Badge className="absolute top-4 right-4 bg-red-500 text-white text-xs font-semibold">
                          {item.badge}
                        </Badge>
                      )}

                      {/* Arrow */}
                      <ChevronRight className="absolute top-1/2 right-4 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="email@contoh.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nomor HP</label>
              <Input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Alamat Lengkap</label>
              <Textarea
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password Baru (Opsional)</label>
              <div className="relative">
                <Input
                  type={showPasswordFields ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Biarkan kosong jika tidak ingin mengubah"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswordFields ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                toast.success('Profil berhasil diperbarui!')
                setIsEditProfileOpen(false)
              }}
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
