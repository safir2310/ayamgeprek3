'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import Barcode from 'react-barcode'
import {
  Search,
  ShoppingCart,
  Bell,
  User,
  UserPlus,
  X,
  Home,
  Package,
  Flame,
  FileText,
  Settings,
  Minus,
  Plus,
  Trash2,
  Star,
  CreditCard,
  MapPin,
  Phone,
  User as UserIcon,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  Store,
  LogOut,
  QrCode,
  ArrowRight,
  Percent,
  MessageCircle,
  Gift,
  Mail,
  Lock,
  UserCircle,
  Shield,
  Save,
  Volume2,
  RefreshCw,
  AlertCircle,
  Printer,
  LayoutDashboard,
  Crown,
  Globe,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { POS } from '@/components/admin/POS'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { UserChatDialog } from '@/components/UserChatDialog'
import ProfilePage from '@/components/ProfilePage'

// Batik pattern SVG for member card
const BatikPattern = () => (
  <svg className="absolute inset-0 opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <pattern id="batik-home" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10 L10 0 L20 10 L10 20 Z" fill="currentColor" className="text-white"/>
        <circle cx="10" cy="10" r="3" fill="currentColor" className="text-white" opacity="0.5"/>
      </pattern>
    </defs>
    <rect width="100" height="100" fill="url(#batik-home)"/>
  </svg>
)

// Mock data removed - products are fetched from database via /api/products

const categories = [
  { id: 'all', name: 'Semua', icon: '🛒' },
  { id: 'makanan', name: 'Makanan', icon: '🍽️' },
  { id: 'minuman', name: 'Minuman', icon: '🥤' },
  { id: 'snack', name: 'Snack', icon: '🍿' },
  { id: 'bumbu', name: 'Bumbu', icon: '🌶️' },
  { id: 'kebutuhan-rumah', name: 'Kebutuhan Rumah', icon: '🏠' },
]

// Mock data removed - orders are fetched from database via /api/orders

// Mock data removed - vouchers are fetched from database via /api/user/vouchers

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isQRISModalOpen, setIsQRISModalOpen] = useState(false)
  const [showFloatingBarcode, setShowFloatingBarcode] = useState(false)
  const [showMemberBarcode, setShowMemberBarcode] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [qrisData, setQrisData] = useState<any>(null)
  const [uploadedPaymentProof, setUploadedPaymentProof] = useState<File | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isPaymentUploadModalOpen, setIsPaymentUploadModalOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadChatCount, setUnreadChatCount] = useState(0)
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false)
  const [redeemedVoucherCode, setRedeemedVoucherCode] = useState('')
  const [redeemedRedemption, setRedeemedRedemption] = useState<any>(null)
  const [pointRedemptions, setPointRedemptions] = useState<any[]>([])
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [pointVoucher, setPointVoucher] = useState<any>(null)
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [forgotPasswordData, setForgotPasswordData] = useState({ email: '', phoneLastSix: '', userId: '' })
  const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmPassword: '' })
  const [resetToken, setResetToken] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [hasInitialRender, setHasInitialRender] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    theme: 'light',
    notificationSound: 'default'
  })
  const [vouchers, setVouchers] = useState<any[]>([])
  const [pointVouchers, setPointVouchers] = useState<any[]>([])

  // Glassmorphism card style
  const glassCardStyle = "bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-black/5"

  // Security & Privacy modals state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [isUpdateAddressModal, setIsUpdateAddressModal] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)

  // Security update form data
  const [emailUpdateData, setEmailUpdateData] = useState({ newEmail: '', currentPassword: '' })
  const [phoneUpdateData, setPhoneUpdateData] = useState({ newPhone: '', currentPassword: '' })
  const [addressUpdateData, setAddressUpdateData] = useState({ newAddress: '', currentPassword: '' })

  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false)
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false)

  const {
    user,
    token,
    setUser,
    setToken,
    logout,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    currentTab,
    setCurrentTab,
    _hasHydrated,
  } = useStore()

  // Member Card Helper Functions (after user is defined)
  const getMembershipLevel = (user: any) => {
    const points = user?.points || 0
    if (points >= 5000) return { level: 'VIP', color: 'from-purple-600 to-purple-800', textColor: 'text-purple-600' }
    if (points >= 2500) return { level: 'Platinum', color: 'from-slate-500 to-slate-700', textColor: 'text-slate-600' }
    if (points >= 1000) return { level: 'Gold', color: 'from-amber-500 to-amber-600', textColor: 'text-amber-600' }
    if (points >= 500) return { level: 'Silver', color: 'from-gray-400 to-gray-500', textColor: 'text-gray-600' }
    return { level: 'Bronze', color: 'from-orange-600 to-orange-700', textColor: 'text-orange-600' }
  }

  const calculateProgress = (user: any) => {
    const currentPoints = user?.points || 0
    let progress = 0
    if (currentPoints >= 5000) progress = 100
    else if (currentPoints >= 2500) progress = ((currentPoints - 2500) / 2500) * 100
    else if (currentPoints >= 1000) progress = ((currentPoints - 1000) / 1500) * 100
    else if (currentPoints >= 500) progress = ((currentPoints - 500) / 500) * 100
    else progress = (currentPoints / 500) * 100
    return Math.min(Math.max(progress, 5), 100)
  }

  const getNextLevelPoints = (user: any) => {
    const currentPoints = user?.points || 0
    const nextLevelPoints = [500, 1000, 2500, 5000].find(p => p > currentPoints)
    return nextLevelPoints || 5000
  }

  const getCurrentLevelStart = (user: any) => {
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

  const getPointsNeeded = (user: any) => {
    const currentPoints = user?.points || 0
    const nextLevelPoints = [500, 1000, 2500, 5000].find(p => p > currentPoints)
    return nextLevelPoints ? `${nextLevelPoints - currentPoints} poin lagi` : 'Level Max'
  }

  const membership = getMembershipLevel(user)
  const progress = calculateProgress(user)
  const pointsNeeded = getPointsNeeded(user)
  const currentLevelStart = getCurrentLevelStart(user)
  const nextLevelPoints = getNextLevelPoints(user)

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  // Play notification sound for testing
  const playNotificationSound = (sound: string) => {
    if (sound === 'silent') return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    if (sound === 'default') {
      // Default notification: Ding-ding!
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    } else if (sound === 'chime') {
      // Chime: Three pleasant tones
      const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
      frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator()
        const gain = audioContext.createGain()
        osc.connect(gain)
        gain.connect(audioContext.destination)
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15)
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3)
        osc.start(audioContext.currentTime + i * 0.15)
        osc.stop(audioContext.currentTime + i * 0.15 + 0.3)
      })
    }
  }

  // Apply theme from user settings to document
  useEffect(() => {
    if (user && (user as any).theme) {
      const theme = (user as any).theme
      const root = document.documentElement
      if (theme === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }
  }, [user])

  useEffect(() => {
    try {
      setMounted(true)
      setHasInitialRender(true)
      checkAuth()
    } catch (error) {
      console.error('Error during mount:', error)
      setMounted(true) // Ensure mounted is set even on error
    }
  }, [])

  // Calculate notifications
  const cartNotification = cart.length
  const pendingOrders = orders.filter((order: any) =>
    order.orderStatus === 'pending' || order.orderStatus === 'processing'
  ).length
  const completedOrders = orders.filter((order: any) => order.orderStatus === 'completed').length

  // Total notification count for orders tab
  const orderNotifications = pendingOrders

  // Fetch products from database
  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory)
      }
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Gagal memuat produk')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchQuery])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin
        ? { email: authData.email, password: authData.password }
        : {
            email: authData.email,
            password: authData.password,
            name: authData.name,
            phone: authData.phone,
            address: authData.address,
          }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
        setToken(data.token)
        setIsAuthModalOpen(false)
        toast.success(isLogin ? 'Login berhasil!' : 'Registrasi berhasil!')
        setAuthData({ email: '', password: '', name: '', phone: '', address: '' })
      } else {
        toast.error(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
    }
  }

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true)
  }

  const confirmLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' })
      logout()
      toast.success('Logout berhasil')
      setOrders([])
      setIsLogoutConfirmOpen(false)
    } catch (error) {
      logout()
      setOrders([])
      setIsLogoutConfirmOpen(false)
    }
  }

  // Handle profile photo upload
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Open edit profile modal
  const handleOpenEditProfile = () => {
    if (user) {
      setEditProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        theme: (user as any).theme || 'light',
        notificationSound: (user as any).notificationSound || 'default'
      })
      setProfilePhotoPreview((user as any).profilePhoto || null)
      setIsEditProfileOpen(true)
    }
  }

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...editProfileData,
          profilePhoto: profilePhotoPreview
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setUser(data.user)
        toast.success('Profil berhasil diperbarui!')
        setIsEditProfileOpen(false)
        setProfilePhotoPreview(null)
      } else {
        toast.error(data.error || 'Gagal memperbarui profil')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Gagal memperbarui profil')
    }
  }

  // Fetch user vouchers
  const fetchUserVouchers = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/user/vouchers?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setVouchers(data.vouchers || [])
          setPointVouchers(data.pointVouchers || [])
        }
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    }
  }

  // Fetch vouchers when account tab is active
  useEffect(() => {
    if (currentTab === 'account' && user) {
      fetchUserVouchers()
    }
  }, [currentTab, user])

  // Handle forgot password verification
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          phoneLastSix: forgotPasswordData.phoneLastSix,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setResetToken(data.token)
        setForgotPasswordData({ ...forgotPasswordData, userId: data.userId })
        setIsForgotPasswordOpen(false)
        setIsResetPasswordOpen(true)
        toast.success('Verifikasi berhasil! Silakan ganti password.')
        setForgotPasswordData({ email: '', phoneLastSix: '', userId: '' })
      } else {
        toast.error(data.error || 'Gagal memverifikasi data')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error('Password baru tidak cocok!')
      return
    }

    if (resetPasswordData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter!')
      return
    }

    setIsResetting(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword: resetPasswordData.newPassword,
          userId: forgotPasswordData.userId,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsResetPasswordOpen(false)
        setResetToken('')
        setResetPasswordData({ newPassword: '', confirmPassword: '' })
        toast.success('Password berhasil diubah! Silakan login dengan password baru.')
      } else {
        toast.error(data.error || 'Gagal mengubah password')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsResetting(false)
    }
  }

  // Handle voucher "Pakai" button - Navigate to checkout with voucher code
  const handleUseVoucher = (voucherCode: string) => {
    setSelectedVoucher(voucherCode)
    setCurrentTab('home')
    setIsCheckoutOpen(true)
    toast.success(`Voucher ${voucherCode} ditambahkan!`)
  }

  // Handle email update
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsUpdatingEmail(true)

    try {
      const res = await fetch('/api/user/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newEmail: emailUpdateData.newEmail,
          currentPassword: emailUpdateData.currentPassword,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setUser(data.user)
        setIsEmailModalOpen(false)
        setEmailUpdateData({ newEmail: '', currentPassword: '' })
        toast.success('Email berhasil diubah!')
      } else {
        toast.error(data.error || 'Gagal mengubah email')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  // Handle phone update
  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsUpdatingPhone(true)

    try {
      const res = await fetch('/api/user/phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newPhone: phoneUpdateData.newPhone,
          currentPassword: phoneUpdateData.currentPassword,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setUser(data.user)
        setIsPhoneModalOpen(false)
        setPhoneUpdateData({ newPhone: '', currentPassword: '' })
        toast.success('Nomor telepon berhasil diubah!')
      } else {
        toast.error(data.error || 'Gagal mengubah nomor telepon')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsUpdatingPhone(false)
    }
  }

  // Handle address update
  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsUpdatingAddress(true)

    try {
      const res = await fetch('/api/user/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newAddress: addressUpdateData.newAddress,
          currentPassword: addressUpdateData.currentPassword,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setUser(data.user)
        setIsUpdateAddressModal(false)
        setAddressUpdateData({ newAddress: '', currentPassword: '' })
        toast.success('Alamat berhasil diubah!')
      } else {
        toast.error(data.error || 'Gagal mengubah alamat')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsUpdatingAddress(false)
    }
  }

  // Print receipt function
  const handlePrintReceipt = () => {
    if (!selectedOrder) return

    const printWindow = window.open('', '', 'height=600,width=400')
    if (!printWindow) {
      toast.error('Gagal membuka jendela cetak')
      return
    }

    const itemsHtml = selectedOrder.items.map((item: any) => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px;">
        <span>${item.name} x${item.quantity}</span>
        <span>Rp ${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    `).join('')

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pesanan ${selectedOrder.orderNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 3mm;
            }
            @media print {
              body {
                margin: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              padding: 10px;
              margin: 0;
              font-size: 11px;
              line-height: 1.3;
            }
            .header {
              text-align: center;
              margin-bottom: 12px;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
            }
            .store-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 3px;
            }
            .store-address {
              font-size: 9px;
              margin-bottom: 6px;
            }
            .order-info {
              margin-bottom: 12px;
            }
            .order-info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
            }
            .items {
              margin-bottom: 12px;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
            }
            .items-header {
              font-weight: bold;
              margin-bottom: 8px;
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
              font-size: 10px;
            }
            .total {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 8px;
              border-top: 1px dashed #000;
              padding-top: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 12px;
              border-top: 1px dashed #000;
              padding-top: 8px;
              font-size: 9px;
            }
            .status {
              padding: 4px;
              border-radius: 3px;
              text-align: center;
              font-weight: bold;
              margin-bottom: 12px;
              font-size: 10px;
            }
            .status.completed { background-color: #d4edda; color: #155724; }
            .status.shipped { background-color: #cce5ff; color: #004085; }
            .status.paid { background-color: #d4edda; color: #155724; }
            .status.processing { background-color: #fff3cd; color: #856404; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">AYAM GEPREK SAMBAL IJO</div>
            <div class="store-address">Jl. Medan - Banda Aceh, Simpang Camat, Gampong Tijue, 24151</div>
          </div>

          <div class="order-info">
            <div class="order-info-row">
              <span>No. Order:</span>
              <span>${selectedOrder.orderNumber}</span>
            </div>
            <div class="order-info-row">
              <span>Tanggal:</span>
              <span>${new Date(selectedOrder.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div class="order-info-row">
              <span>Pembayaran:</span>
              <span>${selectedOrder.paymentMethod}</span>
            </div>
          </div>

          <div class="status ${selectedOrder.orderStatus}">
            ${selectedOrder.orderStatus === 'completed' ? 'SELESAI ✅' : selectedOrder.orderStatus === 'shipped' ? 'DIKIRIM 🚚' : selectedOrder.paymentStatus === 'paid' ? 'SUDAH BAYAR 💰' : 'DIPROSES ⏳'}
          </div>

          <div class="items">
            <div class="items-header">ITEM PESANAN</div>
            ${itemsHtml}
          </div>

          <div class="total">
            <span>TOTAL</span>
            <span>Rp ${selectedOrder.finalAmount.toLocaleString()}</span>
          </div>

          <div class="order-info-row">
            <span>Poin didapat:</span>
            <span>+${Math.floor(selectedOrder.finalAmount / 1000)} Poin</span>
          </div>

          <div class="footer">
            <div>Terima kasih atas pesanan Anda!</div>
            <div>Silakan kunjungi kami kembali</div>
            <div style="margin-top: 8px;">⭐⭐⭐⭐⭐</div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()

    toast.success('Struk berhasil dicetak')
  }

  const generateQRIS = async (amount: number, orderId: string) => {
    try {
      const res = await fetch('/api/qrcode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, orderId }),
      })

      if (res.ok) {
        const data = await res.json()
        setQrisData(data)
        setIsQRISModalOpen(true)
      } else {
        toast.error('Gagal generate QR Code')
      }
    } catch (error) {
      console.error('QRIS generation error:', error)
      toast.error('Gagal generate QR Code')
    }
  }
  const [authData, setAuthData] = useState({ email: '', password: '', name: '', phone: '', address: '' })
  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'COD',
    notes: '',
  })
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [adminTapCount, setAdminTapCount] = useState(0)
  const [adminTapTimeout, setAdminTapTimeout] = useState<NodeJS.Timeout | null>(null)
  const [logoPressTimer, setLogoPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isPressing, setIsPressing] = useState(false)
  const [showAdminPinModal, setShowAdminPinModal] = useState(false)
  const [adminPin, setAdminPin] = useState('')
  const [selectedVoucher, setSelectedVoucher] = useState<string>('')

  // Mobile admin access - double tap on logo (easier than triple tap)
  const handleLogoTap = () => {
    if (typeof window === 'undefined') return

    // Only enable on mobile
    if (window.innerWidth >= 768) return

    const newTapCount = adminTapCount + 1
    setAdminTapCount(newTapCount)

    // Clear existing timeout
    if (adminTapTimeout) {
      clearTimeout(adminTapTimeout)
    }

    // Check if double-tap within 1 second (changed from triple to double)
    const timeout = setTimeout(() => {
      if (newTapCount >= 2) {
        setShowAdminPinModal(true)
        setAdminTapCount(0)
      } else {
        setAdminTapCount(0)
      }
    }, 1000)

    setAdminTapTimeout(timeout)
  }

  // Long-press handler for admin access (2 seconds)
  const handleLogoPressStart = () => {
    if (typeof window === 'undefined') return
    if (window.innerWidth >= 768) return

    setIsPressing(true)
    const timer = setTimeout(() => {
      setShowAdminPinModal(true)
      setIsPressing(false)
    }, 2000)
    setLogoPressTimer(timer)
  }

  const handleLogoPressEnd = () => {
    setIsPressing(false)
    if (logoPressTimer) {
      clearTimeout(logoPressTimer)
      setLogoPressTimer(null)
    }
  }

  const handleAdminPinSubmit = async () => {
    if (!adminPin) {
      toast.error('PIN wajib diisi')
      return
    }

    try {
      const res = await fetch('/api/auth/admin-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: adminPin }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Update user and token in store
        setUser(data.user)
        setToken(data.token)

        setShowAdminPinModal(false)
        setShowAdminDashboard(true)
        setAdminPin('')
        toast.success('🔓 Admin panel terbuka!')
      } else {
        toast.error(data.error || '❌ PIN salah!')
        setAdminPin('')
      }
    } catch (error) {
      console.error('Admin login error:', error)
      toast.error('Terjadi kesalahan saat login admin')
      setAdminPin('')
    }
  }

  // Cleanup admin tap timeout on unmount
  useEffect(() => {
    return () => {
      if (adminTapTimeout) {
        clearTimeout(adminTapTimeout)
      }
      if (logoPressTimer) {
        clearTimeout(logoPressTimer)
      }
    }
  }, [])

  // Check URL parameter for admin access
  useEffect(() => {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'true') {
      setShowAdminDashboard(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  async function fetchOrdersFromApi(signal?: AbortSignal) {
    if (!user || !token) return

    try {
      const res = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      })

      if (res.ok && (!signal || !signal.aborted)) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error: any) {
      if (!signal || error.name !== 'AbortError') {
        console.error('Failed to fetch orders:', error)
      }
    }
  }

  // Fetch unread chat messages count
  const fetchUnreadChatCount = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/chat/unread?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setUnreadChatCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread chat count:', error)
    }
  }

  // Poll for unread messages
  useEffect(() => {
    if (!user || isChatOpen) return

    // Fetch initial count
    fetchUnreadChatCount()

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchUnreadChatCount()
    }, 5000)

    return () => clearInterval(interval)
  }, [user, isChatOpen])

  // Clear unread count when chat is opened
  useEffect(() => {
    if (isChatOpen && user) {
      setUnreadChatCount(0)
    }
  }, [isChatOpen, user])

  // Refresh unread count when chat is closed (after initial render)
  useEffect(() => {
    if (!isChatOpen && user && hasInitialRender) {
      // Fetch immediately after closing chat
      fetchUnreadChatCount()
    }
  }, [isChatOpen, user, hasInitialRender])

  const handlePaymentProofUpload = async (file: File) => {
    if (!qrisData) return

    setIsProcessingPayment(true)
    setUploadedPaymentProof(file)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('orderId', qrisData.orderId)
      formData.append('orderDate', new Date().toISOString())

      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        if (data.isPaymentValid && data.orderUpdated) {
          toast.success('✅ Pembayaran berhasil dikonfirmasi!')
          setIsPaymentUploadModalOpen(false)
          setIsQRISModalOpen(false)
          fetchOrdersFromApi()
        } else if (data.isPaymentValid) {
          toast.success('✅ Tanggal transaksi sesuai!')
          setIsPaymentUploadModalOpen(false)
          setIsQRISModalOpen(false)
          fetchOrdersFromApi()
        } else {
          toast.warning(
            `⚠️ Tanggal tidak sesuai (${data.transactionDate} vs ${data.orderDate})`
          )
        }
      } else {
        toast.error(data.error || 'Gagal memverifikasi pembayaran')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error('Gagal memverifikasi pembayaran')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Start/stop polling ketika QRIS modal terbuka/tutup
  useEffect(() => {
    if (!isQRISModalOpen || !qrisData) {
      return () => {
        // Cleanup function
      }
    }

    let intervalId: NodeJS.Timeout | null = null

    const checkPaymentStatus = async () => {
      if (!qrisData || !qrisData.orderId) return

      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          const updatedOrder = data.orders?.find((o: any) => o.orderNumber === qrisData.orderId)

          if (updatedOrder && updatedOrder.paymentStatus === 'paid') {
            // Pembayaran berhasil
            if (intervalId) clearInterval(intervalId)
            setIsQRISModalOpen(false)
            toast.success('✅ Pembayaran berhasil dikonfirmasi otomatis!')
            fetchOrdersFromApi()
          } else if (updatedOrder && updatedOrder.paymentStatus === 'failed') {
            // Pembayaran gagal
            if (intervalId) clearInterval(intervalId)
            setIsQRISModalOpen(false)
            toast.error('❌ Pembayaran gagal')
            fetchOrdersFromApi()
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    // Start polling using setTimeout to avoid setState in effect
    setTimeout(() => {
      intervalId = setInterval(checkPaymentStatus, 3000)
    }, 0)

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isQRISModalOpen, qrisData])

  const handleCheckout = async () => {
    if (!user) {
      setIsCheckoutOpen(false)
      setIsAuthModalOpen(true)
      toast.error('Silakan login terlebih dahulu')
      return
    }

    if (cart.length === 0) {
      toast.error('Keranjang masih kosong')
      return
    }

    try {
      // If point voucher exists, add free product to cart
      let checkoutCart = [...cart]
      if (pointVoucher) {
        const freeProduct = {
          productId: pointVoucher.productId,
          name: pointVoucher.productName,
          price: 0,
          discountPrice: 0,
          quantity: 1,
          image: pointVoucher.productImage || '🎁',
          isFree: true,
          voucherCode: pointVoucher.code,
        }
        checkoutCart = [...checkoutCart, freeProduct]
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart: checkoutCart,
          ...checkoutData,
          voucherCode: selectedVoucher || pointVoucher?.code || undefined,
          pointVoucherCode: pointVoucher?.code,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        clearCart()
        setIsCheckoutOpen(false)
        setPointVoucher(null)
        const orderData = data.order
        toast.success(`Order ${orderData.orderNumber} berhasil dibuat!`)

        // Mark point voucher as used
        if (pointVoucher && orderData.orderNumber) {
          await fetch('/api/point-voucher/use', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              code: pointVoucher.code,
              orderId: orderData.id,
            }),
          })
        }

        if (checkoutData.paymentMethod === 'QRIS') {
          // Generate QRIS QR code
          await generateQRIS(orderData.finalAmount, orderData.orderNumber)
        }

        setCurrentTab('orders')
        // Refresh orders after checkout
        setTimeout(() => {
          if (user && token) {
            fetchOrdersFromApi()
          }
        }, 500)
      } else {
        toast.error(data.error || 'Terjadi kesalahan saat checkout')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
    }
  }

  const filteredProducts = products

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.discountPrice || item.price
    return sum + price * item.quantity
  }, 0)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate discount from validated voucher
  let discountAmount = 0
  if (selectedVoucher && !pointVoucher) {
    const voucher = vouchers.find((v) => v.code === selectedVoucher)
    if (voucher) {
      // Check minimum purchase from voucher data
      if (cartTotal >= voucher.minPurchase) {
        if (voucher.discountType === 'fixed') {
          discountAmount = voucher.discountValue
        } else if (voucher.discountType === 'percentage') {
          discountAmount = Math.floor(cartTotal * (voucher.discountValue / 100))
        }
        // Apply max discount if set
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount
        }
      }
    }
  }

  const finalAmount = cartTotal - discountAmount

  // Handle opening checkout modal
  const handleOpenCheckout = () => {
    if (user) {
      setCheckoutData({
        customerName: user.name || '',
        customerPhone: user.phone || '',
        customerAddress: user.address || '',
        paymentMethod: 'COD',
        notes: '',
      })
    }
    setIsCheckoutOpen(true)
  }

  // Fetch point redemption options
  const fetchPointRedemptions = async () => {
    try {
      const res = await fetch('/api/point-redemption')
      if (res.ok) {
        const data = await res.json()
        setPointRedemptions(data.redemptions || [])
      }
    } catch (error) {
      console.error('Failed to fetch point redemptions:', error)
    }
  }

  // Handle redeem points
  const handleRedeemPoints = async (redemptionId: string) => {
    if (!user || !token) {
      toast.error('Silakan login terlebih dahulu')
      return
    }

    setIsRedeeming(true)
    try {
      const res = await fetch('/api/point-redemption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ redemptionId }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setRedeemedVoucherCode(data.voucherCode)
        setRedeemedRedemption(data.redemption)
        setIsRedeemModalOpen(true)
        toast.success(`Berhasil menukar ${data.redemption.pointsUsed} poin!`)
        // Refresh user data
        const meRes = await fetch('/api/auth/me')
        if (meRes.ok) {
          const meData = await meRes.json()
          setUser(meData.user)
        }
      } else {
        toast.error(data.error || 'Gagal menukar poin')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsRedeeming(false)
    }
  }

  // Fetch orders when user changes or tab changes to orders
  useEffect(() => {
    if (user && currentTab === 'orders' && !showAdminDashboard) {
      const controller = new AbortController()
      const signal = controller.signal

      // Wrap in setTimeout to avoid synchronous setState
      setTimeout(() => fetchOrdersFromApi(signal), 0)

      return () => {
        controller.abort()
      }
    }
  }, [user, currentTab, showAdminDashboard])

  // Fetch point redemptions when tab changes to redeem
  useEffect(() => {
    if (currentTab === 'redeem' && !showAdminDashboard) {
      setTimeout(() => fetchPointRedemptions(), 0)
    }
  }, [currentTab, showAdminDashboard])

  if (!mounted || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (showAdminDashboard) {
    return <AdminDashboard onBack={() => setShowAdminDashboard(false)} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-orange-50 to-white">
      {/* Header - Brand New Design */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl shadow-xl shadow-gray-900/10 border-b border-gray-100">
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-gradient-x"></div>

        <div className="container mx-auto px-3 sm:px-5">
          <div className="py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* Logo Section */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
                <div
                  className="relative group"
                  onClick={handleLogoTap}
                  onTouchStart={handleLogoPressStart}
                  onMouseDown={handleLogoPressStart}
                  onTouchEnd={handleLogoPressEnd}
                  onMouseUp={handleLogoPressEnd}
                  onMouseLeave={handleLogoPressEnd}
                >
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>

                  {/* Logo Container */}
                  <div className="relative w-12 h-12 sm:w-13 sm:h-13 lg:w-14 lg:h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200/50 border-2 border-gray-200 group-hover:border-red-300 transition-all duration-300 group-hover:scale-105 active:scale-95 cursor-pointer select-none">
                    <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10">
                      <defs>
                        <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#DC2626" stopOpacity={1} />
                          <stop offset="100%" stopColor="#F97316" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="chickenGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FCD34D" stopOpacity={1} />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="flameGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                          <stop offset="100%" stopColor="#DC2626" stopOpacity={1} />
                        </linearGradient>
                        <filter id="glow2">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <circle cx="50" cy="50" r="46" fill="url(#logoGrad2)" filter="url(#glow2)" opacity="0.15" />
                      <circle cx="50" cy="50" r="44" fill="url(#logoGrad2)" />

                      {/* Spicy flames background */}
                      <path d="M25 55 Q20 45 28 35 Q35 40 32 55 Z" fill="#F97316" opacity="0.3" />
                      <path d="M75 55 Q80 45 72 35 Q65 40 68 55 Z" fill="#F97316" opacity="0.3" />

                      {/* Spicy droplets */}
                      <circle cx="22" cy="62" r="4" fill="#DC2626" opacity="0.4" />
                      <circle cx="78" cy="62" r="4" fill="#DC2626" opacity="0.4" />

                      {/* Sambal chili peppers */}
                      <ellipse cx="15" cy="70" rx="6" ry="12" fill="#DC2626" transform="rotate(-30 15 70)" />
                      <ellipse cx="85" cy="70" rx="6" ry="12" fill="#DC2626" transform="rotate(30 85 70)" />
                      <ellipse cx="20" cy="75" rx="4" ry="10" fill="#EF4444" transform="rotate(-45 20 75)" />
                      <ellipse cx="80" cy="75" rx="4" ry="10" fill="#EF4444" transform="rotate(45 80 75)" />

                      {/* Chicken body - main */}
                      <ellipse cx="50" cy="52" rx="20" ry="18" fill="url(#chickenGrad2)" stroke="#B45309" strokeWidth="1.5" />

                      {/* Crispy effect */}
                      <ellipse cx="50" cy="52" rx="18" ry="16" fill="none" stroke="#FCD34D" strokeWidth="2" strokeDasharray="3 3" opacity="0.3" />

                      {/* Head */}
                      <circle cx="50" cy="42" r="11" fill="url(#chickenGrad2)" stroke="#B45309" strokeWidth="1.5" />

                      {/* Comb */}
                      <path d="M50 31 Q45 25 48 28 Q50 26 52 28 Q55 25 50 31 Z" fill="#DC2626" />
                      <path d="M45 28 L40 26 L47 29 Z" fill="#F97316" opacity="0.8" />
                      <path d="M55 28 L60 26 L53 29 Z" fill="#F97316" opacity="0.8" />

                      {/* Eyes */}
                      <ellipse cx="46" cy="40" rx="3" ry="3.5" fill="#FFF" />
                      <ellipse cx="54" cy="40" rx="3" ry="3.5" fill="#FFF" />
                      <circle cx="46" cy="40" r="1.5" fill="#1F2937" />
                      <circle cx="54" cy="40" r="1.5" fill="#1F2937" />

                      {/* Beak */}
                      <path d="M50 44 L47 48 L53 48 Z" fill="#F97316" stroke="#B45309" strokeWidth="0.5" />
                      <path d="M48 48 L50 46 L52 48 Z" fill="#FBBF24" opacity="0.5" />

                      {/* Wattle */}
                      <ellipse cx="50" cy="51" rx="3" ry="4" fill="#EF4444" opacity="0.8" />

                      {/* Wings */}
                      <path d="M30 48 Q25 42 28 50 Q32 48 30 48 Z" fill="url(#chickenGrad2)" stroke="#B45309" strokeWidth="1" />
                      <path d="M70 48 Q75 42 72 50 Q68 48 70 48 Z" fill="url(#chickenGrad2)" stroke="#B45309" strokeWidth="1" />

                      {/* Feet */}
                      <path d="M42 68 L40 75 L44 75 L42 68 Z" fill="#F97316" />
                      <path d="M58 68 L56 75 L60 75 L58 68 Z" fill="#F97316" />

                      {/* Spicy accent glow */}
                      <circle cx="50" cy="52" r="25" fill="url(#flameGrad2)" opacity="0.08" />

                      {/* Small spice particles */}
                      <circle cx="35" cy="35" r="2" fill="#FCD34D" opacity="0.6" />
                      <circle cx="65" cy="35" r="2" fill="#FCD34D" opacity="0.6" />
                      <circle cx="42" cy="30" r="1.5" fill="#F97316" opacity="0.5" />
                      <circle cx="58" cy="30" r="1.5" fill="#F97316" opacity="0.5" />
                    </svg>
                  </div>

                  {/* Press indicator */}
                  {isPressing && (
                    <div className="absolute -inset-1 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h1 className="text-sm sm:text-base lg:text-lg font-black bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent tracking-tight leading-none whitespace-nowrap">
                    AYAM GEPREK
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline"> </span>
                    SAMBAL IJO
                  </h1>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="flex items-center gap-1.5 text-gray-600 text-[10px] sm:text-xs hover:text-red-600 transition-colors cursor-pointer truncate group mt-0.5"
                  >
                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />
                    <span className="truncate max-w-[130px] sm:max-w-[170px] lg:max-w-[220px] font-medium">
                      Jl. Medan - Banda Aceh, Simpang Camat
                    </span>
                  </button>
                  {/* Mobile Admin Tap Indicator */}
                  {adminTapCount > 0 && (
                    <div className="md:hidden flex items-center gap-1.5 mt-1.5">
                      <div className="flex gap-1">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className={`w-4 h-0.5 rounded-full transition-all duration-200 ${
                              i <= adminTapCount ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] text-gray-500 font-medium">
                        {2 - adminTapCount} lagi...
                      </span>
                    </div>
                  )}
                  {/* Long-press hint */}
                  {isPressing && (
                    <div className="md:hidden flex items-center gap-2 mt-1.5">
                      <div className="w-16 h-1 bg-gray-300 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 animate-[width_2s_ease-in-out_forwards]" style={{ width: '100%' }} />
                      </div>
                      <span className="text-[9px] text-gray-500 font-medium">Tahan...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Cart Button */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl border-2 border-gray-200 hover:border-red-300 transition-all duration-300 group-hover:scale-105 active:scale-95"
                    onClick={() => setIsCartOpen(true)}
                  >
                    <ShoppingCart className="h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6" />
                  </Button>
                  {cartCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] sm:text-[11px] font-bold rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-center ring-2 ring-white">
                      {cartCount}
                    </div>
                  )}
                </div>

                {/* Chat Button */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-300 group-hover:scale-105 active:scale-95"
                    onClick={() => {
                      if (user) {
                        setIsChatOpen(true)
                      } else {
                        toast.info('Silakan login untuk menggunakan fitur chat')
                        setIsAuthModalOpen(true)
                      }
                    }}
                  >
                    <MessageCircle className="h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6" />
                  </Button>
                  {unreadChatCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6 bg-gradient-to-br from-orange-500 to-red-500 text-white text-[10px] sm:text-[11px] font-bold rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center ring-2 ring-white animate-pulse">
                      {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </div>
                  )}
                </div>

                {/* User Button */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 bg-gray-50 hover:bg-yellow-50 text-gray-700 hover:text-yellow-600 rounded-xl border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 group-hover:scale-105 active:scale-95"
                    onClick={() => (user ? handleLogout() : setIsAuthModalOpen(true))}
                  >
                    <User className="h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6" />
                  </Button>
                  {user && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </header>

      {/* Search Bar - Below Header (Home & Products tabs only) */}
      {(currentTab === 'home' || currentTab === 'products') && (
        <div className="bg-white/80 backdrop-blur-md shadow-md shadow-gray-200/50 border-b border-gray-100/50">
          <div className="container mx-auto px-3 py-3 sm:px-5 sm:py-3.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-10 bg-gray-50/80 border-2 border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all shadow-sm focus:shadow-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                  <X className="h-3.5 w-3.5 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 py-4 pb-20 sm:px-4 sm:py-6">
        {currentTab === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Digital Member Card - Same as Account Page */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
              className="mb-6"
            >
              <div className="w-full max-w-sm mx-auto">
                <Card className={`overflow-hidden rounded-2xl shadow-xl border-2 ${glassCardStyle}`}>
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
                          <p className="text-[9px] text-gray-400 mb-1">NAMA MEMBER</p>
                          <p className="text-white text-xs font-semibold">
                            {user?.name || 'Guest'}
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowMemberBarcode(true)}
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
                        {currentLevelStart}
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium">
                        {nextLevelPoints}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Member Barcode Modal */}
            <Dialog open={showMemberBarcode} onOpenChange={setShowMemberBarcode}>
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

            {/* Promo Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-r from-red-600 to-orange-500 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="mb-2 bg-yellow-400 text-red-900 font-bold">PROMO SPESIAL</Badge>
                      <h3 className="text-2xl font-bold mb-1">Diskon Hingga 17%!</h3>
                      <p className="text-white/90">Belanja sekarang dan hemat lebih banyak</p>
                    </div>
                    <div className="text-6xl">🔥</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Categories */}
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-white shadow-sm mb-6">
              <ScrollArea className="w-full">
                <div className="flex gap-3 py-3 px-3">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl min-w-[65px] sm:min-w-[70px] transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 shadow hover:shadow-md'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">{category.icon}</span>
                      <span className="text-[10px] sm:text-xs font-medium">{category.name}</span>
                    </motion.button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Products Grid */}
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg aspect-square mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6" rx="8"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" fill="%23dc2626" text="📦" dy="15"/%3E%3C/svg%3E'
                              }}
                            />
                          ) : (
                            <span className="text-6xl">📦</span>
                          )}
                        </div>
                        {product.discountPercent && (
                          <Badge className="absolute top-2 right-2 bg-red-600 text-white font-bold">
                            -{product.discountPercent}%
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-red-600">
                              Rp {(product.discountPrice || product.price).toLocaleString()}
                            </p>
                            {product.discountPrice && (
                              <p className="text-xs text-gray-400 line-through">
                                Rp {product.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                          onClick={() => {
                            addToCart({
                              productId: product.id,
                              name: product.name,
                              price: product.price,
                              discountPrice: product.discountPrice,
                              quantity: 1,
                              image: product.image,
                              category: product.category,
                            })
                            toast.success(`${product.name} ditambahkan ke keranjang`)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Tambah
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            )}

            {filteredProducts.length === 0 && !isLoadingProducts && (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Tidak ada produk ditemukan</p>
              </div>
            )}
          </motion.div>
        )}

        {currentTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Categories */}
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-white shadow-sm mb-6">
              <ScrollArea className="w-full">
                <div className="flex gap-3 py-3 px-3">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl min-w-[65px] sm:min-w-[70px] transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 shadow hover:shadow-md'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">{category.icon}</span>
                      <span className="text-[10px] sm:text-xs font-medium">{category.name}</span>
                    </motion.button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6" rx="8"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" fill="%23dc2626" text="📦" dy="15"/%3E%3C/svg%3E'
                            }}
                          />
                        ) : (
                          <span className="text-6xl sm:text-7xl">📦</span>
                        )}
                      </div>
                      {product.discountPercent && (
                        <Badge className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold">
                          -{product.discountPercent}%
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-2 sm:p-3">
                      <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-red-600 text-base sm:text-lg">
                            Rp {(product.discountPrice || product.price).toLocaleString()}
                          </p>
                          {product.discountPrice && (
                            <p className="text-xs sm:text-sm text-gray-400 line-through">
                              Rp {product.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-xs sm:text-sm h-9 sm:h-10"
                        onClick={() => {
                          addToCart({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            discountPrice: product.discountPrice || undefined,
                            quantity: 1,
                            image: product.image,
                            category: product.category,
                          })
                          toast.success(`${product.name} ditambahkan ke keranjang`)
                        }}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Tambah
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {currentTab === 'promo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Promo Spesial</h2>
            <Card className="bg-gradient-to-r from-red-600 to-orange-500 border-0 shadow-lg mb-6">
              <CardContent className="p-8 text-white text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold mb-2">DISKON BESAR-BESARAN</h3>
                <p className="text-xl mb-4">Dapatkan diskon hingga 20% untuk pembelian di atas Rp 100.000</p>
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                  Belanja Sekarang
                </Button>
              </CardContent>
            </Card>

            <h3 className="text-xl font-bold mb-4 text-gray-800">Voucher Tersedia</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {vouchers.map((voucher) => (
                <Card key={voucher.code} className="border-dashed border-2 border-red-300">
                  <CardContent className="p-2.5 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                        <Percent className="h-5 w-5 sm:h-8 sm:w-8" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base sm:text-lg">{voucher.name}</h4>
                        <p className="text-sm sm:text-base text-gray-600">{voucher.description}</p>
                        <Badge className="mt-1.5 sm:mt-2 text-xs">{voucher.code}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {currentTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Riwayat Pesanan</h2>
            {!user ? (
              <Card className="p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Silakan login untuk melihat riwayat pesanan</p>
                <Button
                  className="bg-gradient-to-r from-red-500 to-orange-500"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Login Sekarang
                </Button>
              </Card>
            ) : orders.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Belum ada pesanan</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                          <span className="font-semibold text-sm sm:text-base">{order.orderNumber}</span>
                        </div>
                        <Badge
                          className={
                            order.orderStatus === 'completed'
                              ? 'bg-green-600'
                              : order.orderStatus === 'shipped'
                              ? 'bg-blue-600'
                              : order.paymentStatus === 'paid'
                              ? 'bg-green-600'
                              : 'bg-yellow-600'
                          }
                        >
                          {order.orderStatus === 'completed'
                            ? 'Selesai'
                            : order.orderStatus === 'shipped'
                            ? 'Dikirim'
                            : order.paymentStatus === 'paid'
                            ? 'Sudah Bayar'
                            : 'Diproses'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {order.paymentMethod}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{order.items.length} item</span>
                        <span className="font-bold text-red-600">Rp {order.finalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsOrderDetailOpen(true)
                          }}
                        >
                          Lihat Detail
                        </Button>
                        {order.paymentMethod === 'QRIS' && order.paymentStatus === 'pending' && (
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => generateQRIS(order.finalAmount, order.orderNumber)}
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            Bayar QRIS
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {currentTab === 'account' && (
          user ? (
            <ProfilePage user={user} vouchers={vouchers} onLogout={handleLogout} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-12 text-center shadow-xl border-gray-200">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <User className="h-12 w-12 text-red-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Selamat Datang!</h3>
                <p className="text-gray-600 mb-6">Silakan login untuk mengakses akun dan semua fitur menarik kami.</p>
                <Button
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-lg px-8 py-3 shadow-lg"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Login Sekarang
                </Button>
              </Card>
            </motion.div>
          )
        )}

        {currentTab === 'redeem' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Tukar Poin</h2>
            {user ? (
              <div className="space-y-4">
                {/* Points Card */}
                <Card className="bg-gradient-to-r from-red-500 to-orange-500 border-0">
                  <CardContent className="p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm">Poin Anda</p>
                        <h3 className="text-4xl font-bold mt-1">{user.points}</h3>
                      </div>
                      <div className="text-6xl">🎁</div>
                    </div>
                    <p className="text-white/80 text-xs mt-2">
                      Tukar poin Anda untuk mendapatkan produk gratis!
                    </p>
                  </CardContent>
                </Card>

                {/* Redemption Options */}
                {pointRedemptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pointRedemptions.map((redemption) => (
                      <Card
                        key={redemption.id}
                        className="overflow-hidden hover:shadow-lg transition-all"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                              {redemption.productImage || '🎁'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-1">
                                {redemption.name}
                              </h4>
                              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                {redemption.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                                  <Star className="h-3 w-3 mr-1" />
                                  {redemption.pointsRequired} Poin
                                </Badge>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                                  onClick={() => handleRedeemPoints(redemption.id)}
                                  disabled={
                                    isRedeeming || user.points < redemption.pointsRequired
                                  }
                                >
                                  {isRedeeming ? 'Memproses...' : 'Tukar'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Belum ada menu penukaran tersedia</p>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Silakan login untuk menukar poin</p>
                <Button
                  className="bg-gradient-to-r from-red-500 to-orange-500"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Login Sekarang
                </Button>
              </Card>
            )}
          </motion.div>
        )}
      </main>

      {/* Chat Dialog */}
      {user && (
        <UserChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userId={user.id}
          userName={user.name}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
        <DialogContent className="max-w-sm p-6">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-bold text-gray-800">👋 Konfirmasi Logout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Apakah Anda yakin ingin logout? Anda tidak akan lagi dapat mengakses akun dan melakukan transaksi.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsLogoutConfirmOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={confirmLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-[18rem] p-3">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-bold text-gray-800">✏️ Edit Profil</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <form onSubmit={handleSaveProfile} className="space-y-2.5 pr-1">
            {/* Profile Photo */}
            <div>
              <Label className="block text-[10px] font-medium text-gray-700 mb-1">Foto Profil</Label>
              <div className="flex items-center gap-2">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profilePhotoPreview || undefined} />
                  <AvatarFallback className="text-xs bg-red-100 text-red-600 font-bold">
                    {editProfileData.name?.charAt(0).toUpperCase() || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                    id="profile-photo-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('profile-photo-input')?.click()}
                    className="h-6 text-[10px] px-2"
                  >
                    Upload
                  </Button>
                  {profilePhotoPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProfilePhotoPreview(null)}
                      className="h-6 text-[10px] px-1.5"
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name" className="block text-[10px] font-medium text-gray-700 mb-1">Nama</Label>
              <Input
                id="name"
                value={editProfileData.name}
                onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                placeholder="Nama lengkap"
                required
                className="text-xs h-7"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="block text-[10px] font-medium text-gray-700 mb-1">Telepon</Label>
              <Input
                id="phone"
                type="tel"
                value={editProfileData.phone}
                onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="text-xs h-7"
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="block text-[10px] font-medium text-gray-700 mb-1">Alamat</Label>
              <Textarea
                id="address"
                value={editProfileData.address}
                onChange={(e) => setEditProfileData({ ...editProfileData, address: e.target.value })}
                placeholder="Alamat lengkap"
                rows={2}
                className="text-xs resize-none h-16"
              />
            </div>

            {/* Theme */}
            <div>
              <Label className="block text-[10px] font-medium text-gray-700 mb-1">Tema</Label>
              <RadioGroup
                value={editProfileData.theme}
                onValueChange={(value: 'light' | 'dark') => setEditProfileData({ ...editProfileData, theme: value })}
              >
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="light" className="h-3.5 w-3.5" />
                    <span className="text-[10px]">Light ☀️</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="dark" className="h-3.5 w-3.5" />
                    <span className="text-[10px]">Dark 🌙</span>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Notification Sound */}
            <div>
              <Label className="block text-[10px] font-medium text-gray-700 mb-1">Nada Notifikasi</Label>
              <div className="space-y-1.5">
                <RadioGroup
                  value={editProfileData.notificationSound}
                  onValueChange={(value) => setEditProfileData({ ...editProfileData, notificationSound: value })}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="default" className="h-3.5 w-3.5" />
                      <span className="text-[10px] flex-1">Default 🔔</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => playNotificationSound('default')}
                        className="h-5 w-5 p-0"
                      >
                        <Volume2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="chime" className="h-3.5 w-3.5" />
                      <span className="text-[10px] flex-1">Chime 🔔</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => playNotificationSound('chime')}
                        className="h-5 w-5 p-0"
                      >
                        <Volume2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="silent" className="h-3.5 w-3.5" />
                      <span className="text-[10px] flex-1">Silent 🔕</span>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-7 text-[10px]"
                onClick={() => {
                  setIsEditProfileOpen(false)
                  setProfilePhotoPreview(null)
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 h-7 text-[10px] bg-gradient-to-r from-red-500 to-orange-500"
              >
                <Save className="h-2.5 w-2.5 mr-1" />
                Simpan
              </Button>
            </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 dark:bg-slate-900/95 shadow-lg z-40">
        <div className="container mx-auto px-1 max-w-md">
          <div className="flex items-center justify-around py-3">
            {[
              { id: 'home', icon: Home, label: 'Beranda' },
              { id: 'products', icon: Package, label: 'Belanja', notification: cartNotification },
              { id: 'redeem', icon: Gift, label: 'Tukar' },
              { id: 'orders', icon: FileText, label: 'Pesanan', notification: orderNotifications },
              { id: 'account', icon: User, label: 'Akun' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className="relative flex flex-col items-center gap-0.5 px-2.5 py-3 rounded-lg transition-all"
              >
                {item.notification > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0 -right-0 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[18px] flex items-center justify-center shadow-md"
                  >
                    {item.notification > 9 ? '9+' : item.notification}
                  </motion.div>
                )}
                <item.icon
                  className={`h-6 w-6 sm:h-7 sm:w-7 ${
                    currentTab === item.id ? 'text-red-600' : 'text-slate-400'
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-[11px] font-medium ${
                    currentTab === item.id ? 'text-red-600' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-[420px] max-h-[95vh] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-6 py-5">
            <DialogHeader className="space-y-0">
              <DialogTitle className="flex items-center gap-3 text-white text-xl">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                Keranjang Belanja
                {cart.length > 0 && (
                  <Badge className="bg-white/20 text-white border-0 ml-2">
                    {cart.length} item
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
          </div>
          <ScrollArea className="max-h-[55vh] px-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                  <ShoppingCart className="h-12 w-12 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-600 mb-2">Keranjang kosong</p>
                <p className="text-sm">Mulai belanja untuk mengisi keranjang Anda</p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {cart.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-slate-100 dark:border-slate-600 hover:shadow-lg transition-all group"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-50 to-violet-50 dark:from-pink-950/20 dark:to-violet-950/20 rounded-xl flex items-center justify-center overflow-hidden shadow-inner relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6" rx="8"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" fill="%23dc2626" text="📦" dy="15"/%3E%3C/svg%3E'
                          }}
                        />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                      {item.isFree && (
                        <Badge className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg">
                          GRATIS
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white text-base leading-tight">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-pink-600 dark:text-pink-400 font-bold text-lg">
                            Rp {(item.discountPrice || item.price).toLocaleString()}
                          </p>
                          {item.discountPrice && item.discountPrice < item.price && (
                            <p className="text-slate-400 text-sm line-through">
                              Rp {item.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950"
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </Button>
                        <span className="font-semibold text-slate-800 dark:text-white w-9 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 ml-auto rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
          {cart.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-800 dark:text-white">Rp {cartTotal.toLocaleString()}</span>
                </div>
                {selectedVoucher && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Diskon Voucher
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">-Rp {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800 dark:text-white">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
                    Rp {finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-2 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => {
                    clearCart()
                    toast.success('Keranjang dikosongkan')
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Kosongkan
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 shadow-lg shadow-pink-500/25 font-semibold"
                  onClick={() => {
                    setIsCartOpen(false)
                    handleOpenCheckout()
                  }}
                >
                  Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[95vh] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-pink-600 via-violet-600 to-purple-600 px-6 py-5">
            <DialogHeader className="space-y-0">
              <DialogTitle className="flex items-center gap-3 text-white text-xl">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CreditCard className="h-6 w-6" />
                </div>
                Checkout
              </DialogTitle>
              <p className="text-purple-100 text-sm mt-1 pl-11">Lengkapi data untuk pesanan Anda</p>
            </DialogHeader>
          </div>
          <ScrollArea className="max-h-[60vh] px-4">
            <div className="space-y-5 py-4">
              {/* Order Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-600">
                <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Ringkasan Pesanan
                </h4>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="text-sm text-slate-800 dark:text-white font-medium">
                          {item.name} x{item.quantity}
                        </span>
                        {item.isFree && (
                          <Badge className="ml-2 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            GRATIS
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-4">
                        Rp {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {pointVoucher && (
                    <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        {pointVoucher.productName} (Gratis)
                      </span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Rp 0</span>
                    </div>
                  )}
                </div>
                <Separator className="my-4 bg-slate-200 dark:bg-slate-600" />
                <div className="space-y-2">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>Subtotal</span>
                    <span>Rp {cartTotal.toLocaleString()}</span>
                  </div>
                  {selectedVoucher && !pointVoucher && (
                    <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Diskon Voucher
                      </span>
                      <span>-Rp {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl font-bold text-slate-800 dark:text-white">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
                      Rp {finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Voucher Section */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800">
                <Label className="mb-3 block text-sm font-semibold text-amber-800 dark:text-amber-200">
                  🎁 Kode Voucher
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode voucher"
                    value={selectedVoucher || (pointVoucher ? pointVoucher.code : '')}
                    onChange={async (e) => {
                      const code = e.target.value.toUpperCase().trim()

                      if (code === '') {
                        setSelectedVoucher('')
                        setPointVoucher(null)
                        return
                      }

                      setSelectedVoucher(code)

                      if (code.length >= 6 && user && token) {
                        setIsApplyingVoucher(true)
                        try {
                          const res = await fetch('/api/voucher/validate', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              code,
                              userId: user.id,
                              cartTotal,
                            }),
                          })

                          const data = await res.json()

                          if (res.ok && data.success) {
                            if (data.type === 'point_voucher') {
                              setPointVoucher(data.voucher)
                              toast.success(`✅ Voucher poin valid! ${data.voucher.productName} akan ditambahkan gratis`)
                            } else if (data.type === 'discount_voucher') {
                              toast.success(`✅ Voucher diskon valid! ${data.voucher.name}`)
                            }
                          } else {
                            toast.error(data.error || 'Voucher tidak valid')
                            setPointVoucher(null)
                          }
                        } catch (error) {
                          toast.error('Gagal memvalidasi voucher')
                          setPointVoucher(null)
                        } finally {
                          setIsApplyingVoucher(false)
                        }
                      }
                    }}
                    disabled={isApplyingVoucher || !!pointVoucher}
                    className="h-11"
                  />
                  {(selectedVoucher || pointVoucher) && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedVoucher('')
                        setPointVoucher(null)
                      }}
                      className="h-11 w-11 rounded-xl border-2"
                      disabled={isApplyingVoucher}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                {isApplyingVoucher && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mt-2">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Memvalidasi voucher...
                  </div>
                )}
                {pointVoucher && (
                  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {pointVoucher.productName} akan ditambahkan gratis! ({pointVoucher.pointsRequired} poin)
                    </p>
                  </div>
                )}
                {selectedVoucher && !pointVoucher && vouchers.some(v => v.code === selectedVoucher) && (
                  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Voucher diskon berhasil diterapkan!
                    </p>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-600">
                <h4 className="font-bold text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Informasi Penerima
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Penerima</Label>
                    <Input
                      value={checkoutData.customerName}
                      onChange={(e) => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                      placeholder="Nama lengkap"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">No. HP</Label>
                    <Input
                      type="tel"
                      value={checkoutData.customerPhone}
                      onChange={(e) => setCheckoutData({ ...checkoutData, customerPhone: e.target.value })}
                      placeholder="081234567890"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Alamat Pengiriman</Label>
                    <Textarea
                      value={checkoutData.customerAddress}
                      onChange={(e) => setCheckoutData({ ...checkoutData, customerAddress: e.target.value })}
                      placeholder="Alamat lengkap pengiriman"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan (Opsional)</Label>
                    <Textarea
                      value={checkoutData.notes}
                      onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                      placeholder="Catatan untuk pesanan"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gradient-to-br from-pink-50 to-violet-50 dark:from-pink-950/30 dark:to-violet-950/30 p-5 rounded-2xl border border-pink-200 dark:border-pink-800">
                <Label className="mb-4 block text-sm font-semibold text-pink-800 dark:text-pink-200">
                  💳 Metode Pembayaran
                </Label>
                <RadioGroup
                  value={checkoutData.paymentMethod}
                  onValueChange={(value) => setCheckoutData({ ...checkoutData, paymentMethod: value })}
                  className="space-y-3"
                >
                  <div className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                    checkoutData.paymentMethod === 'COD' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-400' 
                      : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                  }`}>
                    <RadioGroupItem value="COD" id="cod" className="border-2" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-slate-800 dark:text-white">COD (Bayar di Tempat)</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Bayar saat barang sampai</p>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                    checkoutData.paymentMethod === 'QRIS' 
                      ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-500 dark:border-violet-400' 
                      : 'border-slate-200 dark:border-slate-600 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-950/20'
                  }`}>
                    <RadioGroupItem value="QRIS" id="qris" className="border-2" />
                    <Label htmlFor="qris" className="flex-1 cursor-pointer space-y-1">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        <span className="font-semibold text-slate-800 dark:text-white">QRIS</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Scan QR Code untuk bayar</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 shadow-lg shadow-pink-500/25 font-semibold text-base"
                onClick={handleCheckout}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Konfirmasi Order
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Voucher Redeem Modal */}
      <Dialog open={isRedeemModalOpen} onOpenChange={setIsRedeemModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">🎉 Penukaran Berhasil!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            {/* Product Info */}
            {redeemedRedemption && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center text-4xl">
                    {redeemedRedemption.productImage || '🎁'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-1">Produk yang didapat:</p>
                    <p className="font-semibold text-gray-800 text-lg">{redeemedRedemption.productName}</p>
                  </div>
                </div>
                <div className="flex justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span>{redeemedRedemption.pointsUsed} Poin digunakan</span>
                  </div>
                </div>
              </div>
            )}
            {/* Voucher Code */}
            <div className="bg-white border-2 border-dashed border-red-300 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Kode Voucher Anda:</p>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-red-600 tracking-wider break-all">
                  {redeemedVoucherCode}
                </p>
              </div>
            </div>
            {/* Info */}
            <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Voucher sekali pakai</p>
                  <p className="text-xs text-gray-500">Voucher hanya dapat digunakan satu kali saja</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Gunakan saat checkout</p>
                  <p className="text-xs text-gray-500">Masukkan kode voucher di halaman keranjang saat checkout</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Gift className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Produk gratis otomatis</p>
                  <p className="text-xs text-gray-500">Produk akan ditambahkan otomatis ke pesanan Anda</p>
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              onClick={() => {
                setIsRedeemModalOpen(false)
                navigator.clipboard?.writeText(redeemedVoucherCode)
                toast.success('Kode voucher disalin!')
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Salin Kode Voucher
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Modal */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">No. Order</span>
                  <span className="font-semibold">{selectedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tanggal</span>
                  <div className="text-right">
                    <div className="font-semibold">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(selectedOrder.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Metode Pembayaran</span>
                  <span className="font-semibold">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    className={
                      selectedOrder.orderStatus === 'completed'
                        ? 'bg-green-600'
                        : selectedOrder.orderStatus === 'shipped'
                        ? 'bg-blue-600'
                        : selectedOrder.paymentStatus === 'paid'
                        ? 'bg-green-600'
                        : 'bg-yellow-600'
                    }
                  >
                    {selectedOrder.orderStatus === 'completed'
                      ? 'Selesai'
                      : selectedOrder.orderStatus === 'shipped'
                      ? 'Dikirim'
                      : selectedOrder.paymentStatus === 'paid'
                      ? 'Sudah Bayar'
                      : 'Diproses'}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Item Pesanan</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-red-600">Rp {selectedOrder.finalAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Poin yang didapat</span>
                  <span>+{Math.floor(selectedOrder.finalAmount / 1000)} Poin</span>
                </div>
              </div>
            </ScrollArea>
          )}
          {/* Print Receipt Button - Bottom Right */}
          {selectedOrder && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handlePrintReceipt}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 gap-2"
              >
                <Printer className="h-4 w-4" />
                Cetak Struk
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QRIS Payment Modal */}
      <Dialog
        open={isQRISModalOpen}
        onOpenChange={(open) => {
          setIsQRISModalOpen(open)
          if (!open) {
            setUploadedPaymentProof(null)
            setIsProcessingPayment(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[280px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Pembayaran QRIS</DialogTitle>
          </DialogHeader>
          {qrisData && (
            <div className="space-y-1.5">
              <div className="text-center">
                <p className="text-gray-600 mb-1 text-[10px]">Scan QR untuk bayar</p>
                <div className="bg-white p-1 rounded border border-gray-200 inline-block">
                  <img
                    src={qrisData.qrCode}
                    alt="QRIS QR Code"
                    className="w-32 h-32 object-contain"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-1.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-gray-600 text-[9px]">Merchant:</span>
                  <span className="font-semibold text-[9px]">{qrisData.merchantName}</span>
                </div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-gray-600 text-[9px]">NMID:</span>
                  <span className="font-mono text-[9px]">{qrisData.nmId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-[9px]">Jumlah:</span>
                  <span className="font-bold text-red-600 text-xs">Rp {Number(qrisData.amount).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-1">
                <p className="text-[9px] text-yellow-800">
                  Scan QR di e-wallet/banking
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-1">
                <p className="text-[9px] text-blue-800">
                  ⏱️ Auto-detect: cek tiap 3 detik
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-1 mt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-6 text-[9px]"
                  onClick={() => {
                    navigator.clipboard.writeText(qrisData.nmId)
                    toast.success('NMID disalin!')
                  }}
                >
                  Copy NMID
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-6 text-[9px]"
                  onClick={() => setIsPaymentUploadModalOpen(true)}
                >
                  Sudah Bayar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Upload Modal */}
      <Dialog open={isPaymentUploadModalOpen} onOpenChange={setIsPaymentUploadModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Upload Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
              <input
                type="file"
                id="payment-proof-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handlePaymentProofUpload(file)
                  }
                }}
                disabled={isProcessingPayment}
              />
              <label
                htmlFor="payment-proof-upload"
                className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="text-3xl mb-2">📸</div>
                <p className="text-xs text-center text-gray-600 mb-1">
                  {isProcessingPayment ? 'Sedang memproses...' : 'Upload bukti pembayaran'}
                </p>
                <p className="text-[10px] text-center text-gray-400">
                  JPG, PNG (Maks. 5MB)
                </p>
              </label>
            </div>

            {uploadedPaymentProof && !isProcessingPayment && (
              <div className="text-center">
                <p className="text-xs text-green-600 mb-2">
                  ✅ File terpilih: {uploadedPaymentProof.name}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadedPaymentProof(null)}
                  className="text-xs h-7"
                >
                  Ganti File
                </Button>
              </div>
            )}

            <p className="text-[10px] text-gray-500 text-center">
              Sistem akan otomatis membaca tanggal transaksi dan memverifikasi kecocokan
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={() => {
                  setIsPaymentUploadModalOpen(false)
                  setUploadedPaymentProof(null)
                }}
              >
                Batal
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={() => {
                  setIsPaymentUploadModalOpen(false)
                  setIsQRISModalOpen(false)
                  toast.success('Pembayaran dikonfirmasi manual')
                  fetchOrdersFromApi()
                }}
              >
                Konfirmasi Manual
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[380px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl shadow-black/10">
          <DialogHeader className="sr-only">
            <DialogTitle>{isLogin ? 'Login' : 'Daftar'}</DialogTitle>
          </DialogHeader>
          {/* Premium Background - Putih */}
          <div className="absolute inset-0 bg-white -z-10"></div>

          {/* Decorative Glow */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-orange-500/8 rounded-full blur-3xl -z-10"></div>

          {/* Premium Close Button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 backdrop-blur-sm border border-gray-200 transition-all duration-300"
          >
            <X className="w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors" />
          </button>

          <div className="relative p-5 sm:p-6">
            {/* Premium Logo/Icon Section */}
            <div className="text-center mb-4 sm:mb-5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 relative"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl blur-lg opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-red-400 rounded-2xl blur-md opacity-30"></div>
                {/* Main Icon */}
                <div className="relative w-full h-full bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40 border border-white">
                  {isLogin ? (
                    <motion.div
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm font-light">
                  {isLogin
                    ? 'Sign in to access your account'
                    : 'Start your journey with us today'
                  }
                </p>
              </motion.div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-3 sm:space-y-4"
                >
                  <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
                    {/* Premium Email Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label htmlFor="login-email" className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <Input
                          id="login-email"
                          type="email"
                          value={authData.email}
                          onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                          placeholder="your@email.com"
                          required
                          className="h-12 sm:h-13 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-sm sm:text-base"
                        />
                      </div>
                    </motion.div>

                    {/* Premium Password Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="login-password" className="text-xs sm:text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPasswordOpen(true)
                            setIsAuthModalOpen(false)
                          }}
                          className="text-[10px] sm:text-xs text-orange-500 hover:text-orange-700 font-medium hover:underline transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <Input
                          id="login-password"
                          type="password"
                          value={authData.password}
                          onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                          placeholder="•••••••"
                          required
                          className="h-11 sm:h-12 pl-10 sm:pl-12 pr-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-sm sm:text-base"
                        />
                      </div>
                    </motion.div>

                    {/* Premium Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-11 sm:h-12 bg-gradient-to-r from-orange-600 via-red-500 to-orange-700 hover:from-orange-700 hover:via-red-600 hover:to-orange-800 text-white font-semibold text-sm sm:text-base shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] border border-white/20"
                      >
                        <span className="relative z-10">Sign In</span>
                      </Button>
                    </motion.div>
                  </form>

                  {/* Premium Divider */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="relative my-4 sm:my-5"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">Or continue with</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                  </motion.div>

                  {/* Register Link */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="text-center"
                  >
                    <p className="text-xs sm:text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(false)
                          setAuthData({ email: '', password: '', name: '', phone: '', address: '' })
                        }}
                        className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-all inline-flex items-center gap-1.5 group"
                      >
                        Create Account
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-3 sm:space-y-4"
                >
                  <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
                    {/* Premium Name Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label htmlFor="register-name" className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                        Full Name
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <Input
                          id="register-name"
                          value={authData.name}
                          onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                          className="h-10 sm:h-11 pl-10 sm:pl-12 pr-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-xs sm:text-sm"
                        />
                      </div>
                    </motion.div>

                    {/* Premium Email Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      <Label htmlFor="register-email" className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <Input
                          id="register-email"
                          type="email"
                          value={authData.email}
                          onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                          placeholder="your@email.com"
                          required
                          className="h-10 sm:h-11 pl-10 sm:pl-12 pr-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-xs sm:text-sm"
                        />
                      </div>
                    </motion.div>

                    {/* Premium Phone Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Label htmlFor="register-phone" className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                        Phone Number
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <Input
                          id="register-phone"
                          type="tel"
                          value={authData.phone}
                          onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                          placeholder="081234567890"
                          className="h-10 sm:h-11 pl-10 sm:pl-12 pr-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-xs sm:text-sm"
                        />
                      </div>
                    </motion.div>

                    {/* Premium Address Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 }}
                    >
                      <Label htmlFor="register-address" className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                        Full Address
                      </Label>
                      <div className="relative group">
                        <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none z-10">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <Textarea
                          id="register-address"
                          value={authData.address}
                          onChange={(e) => setAuthData({ ...authData, address: e.target.value })}
                          placeholder="Enter your full address"
                          rows={2}
                          className="pl-10 sm:pl-12 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-xs sm:text-sm resize-none"
                        />
                      </div>
                    </motion.div>

                    {/* Premium Password Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Label htmlFor="register-password" className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                        Password
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <Input
                          id="register-password"
                          type="password"
                          value={authData.password}
                          onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                          placeholder="Create password"
                          required
                          minLength={6}
                          className="h-10 sm:h-11 pl-10 sm:pl-12 pr-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-xs sm:text-sm"
                        />
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    </motion.div>

                    {/* Premium Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-10 sm:h-11 bg-gradient-to-r from-orange-600 via-red-500 to-orange-700 hover:from-orange-700 hover:via-red-600 hover:to-orange-800 text-white font-semibold text-xs sm:text-sm shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] border border-white/20"
                      >
                        <span className="relative z-10">Create Account</span>
                      </Button>
                    </motion.div>
                  </form>

                  {/* Premium Divider */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="relative my-4 sm:my-5"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">Or continue with</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                  </motion.div>

                  {/* Login Link */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85 }}
                    className="text-center"
                  >
                    <p className="text-xs sm:text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(true)
                          setAuthData({ email: '', password: '', name: '', phone: '', address: '' })
                        }}
                        className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-all inline-flex items-center gap-1.5 group"
                      >
                        Sign In
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              Lupa Password
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Masukkan email dan 6 digit terakhir nomor HP Anda untuk verifikasi
            </p>
            <div>
              <Label className="mb-1 block">Email</Label>
              <Input
                type="email"
                value={forgotPasswordData.email}
                onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">6 Digit Terakhir No. HP</Label>
              <Input
                type="text"
                value={forgotPasswordData.phoneLastSix}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setForgotPasswordData({ ...forgotPasswordData, phoneLastSix: value })
                }}
                placeholder="678901"
                required
                maxLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-orange-500"
              disabled={isVerifying}
            >
              {isVerifying ? 'Memverifikasi...' : 'Verifikasi'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              Ganti Password
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Masukkan password baru Anda
            </p>
            <div>
              <Label className="mb-1 block">Password Baru</Label>
              <Input
                type="password"
                value={resetPasswordData.newPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label className="mb-1 block">Konfirmasi Password</Label>
              <Input
                type="password"
                value={resetPasswordData.confirmPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                placeholder="Ulangi password baru"
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-orange-500"
              disabled={isResetting}
            >
              {isResetting ? 'Mengubah...' : 'Ganti Password'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isBarcodeModalOpen} onOpenChange={setIsBarcodeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              Barcode Member
            </DialogTitle>
          </DialogHeader>
          {user && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-orange-200">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      <User className="h-4 w-4" />
                      {user.name || 'Pelanggan'}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-inner">
                    <div className="flex justify-center mb-4">
                      <Barcode
                        value={user.phone || user.id}
                        width={3}
                        height={80}
                        displayValue={false}
                        background="white"
                        lineColor="#1F2937"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-bold text-gray-800 tracking-widest">
                        {user.phone || user.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID Member: {user.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-orange-200">
                    <div className="text-center">
                      <div className="text-2xl">💳</div>
                      <div className="text-sm font-semibold text-gray-800">{user.points}</div>
                      <div className="text-xs text-gray-500">Poin</div>
                    </div>
                    <div className="w-px h-10 bg-orange-200"></div>
                    <div className="text-center">
                      <div className="text-2xl">🎯</div>
                      <div className="text-sm font-semibold text-gray-800">{user.stampCount}</div>
                      <div className="text-xs text-gray-500">Stamp</div>
                    </div>
                    <div className="w-px h-10 bg-orange-200"></div>
                    <div className="text-center">
                      <div className="text-2xl">⭐</div>
                      <div className="text-sm font-semibold text-gray-800">{user.starCount}</div>
                      <div className="text-xs text-gray-500">Star</div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-orange-100 rounded-lg text-center">
                    <p className="text-sm font-semibold text-orange-800">
                      Scan barcode ini saat checkout untuk mendapatkan poin
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Store Address Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-center text-lg font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Alamat Toko
            </DialogTitle>
          </DialogHeader>
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border border-orange-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <Store className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-gray-800">Ayam Geprek Sambal Ijo</h3>
                </div>
              </div>

              <Separator className="bg-orange-200" />

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500 font-semibold">Alamat</p>
                    <p className="text-sm text-gray-800 leading-tight">Jl. Medan - Banda Aceh, Simpang Camat, Gampong Tijue, 24151</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Telepon</p>
                    <p className="text-sm text-gray-800">085260812758</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Jam Operasional</p>
                    <p className="text-sm text-gray-800">Sen-Jum: 09:00-21:00 | Sab-Min: 10:00-22:00</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-orange-200" />

              <div className="flex flex-wrap gap-1.5 justify-center">
                <Badge variant="outline" className="bg-white text-xs py-1">🍗 Dine-in</Badge>
                <Badge variant="outline" className="bg-white text-xs py-1">🏠 Delivery</Badge>
                <Badge variant="outline" className="bg-white text-xs py-1">📦 Takeaway</Badge>
                <Badge variant="outline" className="bg-white text-xs py-1">💳 QRIS</Badge>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Update Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ubah Email
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Masukkan email baru dan password Anda saat ini
            </p>
            <div>
              <Label className="mb-1 block">Email Baru</Label>
              <Input
                type="email"
                value={emailUpdateData.newEmail}
                onChange={(e) => setEmailUpdateData({ ...emailUpdateData, newEmail: e.target.value })}
                placeholder="contoh@email.com"
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">Password Saat Ini</Label>
              <Input
                type="password"
                value={emailUpdateData.currentPassword}
                onChange={(e) => setEmailUpdateData({ ...emailUpdateData, currentPassword: e.target.value })}
                placeholder="Masukkan password Anda"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
              disabled={isUpdatingEmail}
            >
              {isUpdatingEmail ? 'Mengubah...' : 'Ubah Email'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Phone Modal */}
      <Dialog open={isPhoneModalOpen} onOpenChange={setIsPhoneModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ubah Nomor Telepon
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePhone} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Masukkan nomor telepon baru dan password Anda saat ini
            </p>
            <div>
              <Label className="mb-1 block">Nomor Telepon Baru</Label>
              <Input
                type="tel"
                value={phoneUpdateData.newPhone}
                onChange={(e) => setPhoneUpdateData({ ...phoneUpdateData, newPhone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">Password Saat Ini</Label>
              <Input
                type="password"
                value={phoneUpdateData.currentPassword}
                onChange={(e) => setPhoneUpdateData({ ...phoneUpdateData, currentPassword: e.target.value })}
                placeholder="Masukkan password Anda"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
              disabled={isUpdatingPhone}
            >
              {isUpdatingPhone ? 'Mengubah...' : 'Ubah Nomor Telepon'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Address Modal */}
      <Dialog open={isUpdateAddressModal} onOpenChange={setIsUpdateAddressModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ubah Alamat
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAddress} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Masukkan alamat baru dan password Anda saat ini
            </p>
            <div>
              <Label className="mb-1 block">Alamat Baru</Label>
              <Textarea
                value={addressUpdateData.newAddress}
                onChange={(e) => setAddressUpdateData({ ...addressUpdateData, newAddress: e.target.value })}
                placeholder="Masukkan alamat lengkap Anda"
                required
                rows={4}
              />
            </div>
            <div>
              <Label className="mb-1 block">Password Saat Ini</Label>
              <Input
                type="password"
                value={addressUpdateData.currentPassword}
                onChange={(e) => setAddressUpdateData({ ...addressUpdateData, currentPassword: e.target.value })}
                placeholder="Masukkan password Anda"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
              disabled={isUpdatingAddress}
            >
              {isUpdatingAddress ? 'Mengubah...' : 'Ubah Alamat'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Modal */}
      <Dialog open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Syarat & Ketentuan
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">1. Pendahuluan</h3>
                <p className="text-sm text-gray-600">
                  Selamat datang di Ayam Geprek Sambal Ijo. Dengan menggunakan aplikasi ini, Anda setuju untuk mematuhi syarat dan ketentuan ini. Harap baca dengan seksama sebelum melanjutkan.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">2. Pendaftaran Akun</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Untuk menggunakan layanan penuh, Anda harus mendaftar akun. Anda bertanggung jawab untuk:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Menyediakan informasi yang akurat dan lengkap</li>
                  <li>Menjaga kerahasiaan password akun Anda</li>
                  <li>Menginformasikan segala pelanggaran keamanan</li>
                  <li>Tidak membagikan akun Anda kepada orang lain</li>
                </ul>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">3. Pesanan dan Pembayaran</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Aturan mengenai pesanan dan pembayaran:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Harga produk dapat berubah sewaktu-waktu</li>
                  <li>Pembayaran dapat dilakukan melalui COD atau QRIS</li>
                  <li>Setelah pesanan dibuat, tidak dapat dibatalkan</li>
                  <li>Stok produk terbatas dan tidak dijamin ketersediaannya</li>
                </ul>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">4. Program Poin dan Voucher</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Ketentuan program poin dan voucher:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Poin didapatkan dari setiap pembelian</li>
                  <li>Voucher memiliki masa berlaku tertentu</li>
                  <li>Voucher tidak dapat digabungkan</li>
                  <li>Voucher sekali pakai tidak dapat digunakan ulang</li>
                  <li>Poin kedaluwarsa setelah 1 tahun</li>
                </ul>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">5. Privasi dan Keamanan</h3>
                <p className="text-sm text-gray-600">
                  Kami menghargai privasi Anda. Data pribadi yang Anda berikan akan digunakan sesuai dengan Kebijakan Privasi kami. Kami tidak akan menjual atau menyewakan data Anda kepada pihak ketiga.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">6. Batasan Tanggung Jawab</h3>
                <p className="text-sm text-gray-600">
                  Ayam Geprek Sambal Ijo tidak bertanggung jawab atas kerugian langsung atau tidak langsung yang timbul dari penggunaan layanan ini, termasuk namun tidak terbatas pada kerugian keuntungan bisnis, data, atau kerusakan perangkat.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">7. Perubahan Syarat</h3>
                <p className="text-sm text-gray-600">
                  Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Penggunaan lanjutan dari layanan ini setelah perubahan berarti Anda menerima syarat yang telah direvisi.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">8. Kontak</h3>
                <p className="text-sm text-gray-600">
                  Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami melalui email atau nomor telepon yang tertera di halaman kontak.
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={isPrivacyModalOpen} onOpenChange={setIsPrivacyModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Kebijakan Privasi
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">1. Pengumpulan Informasi</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Kami mengumpulkan informasi berikut saat Anda menggunakan aplikasi:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Informasi pendaftaran (nama, email, nomor telepon, alamat)</li>
                  <li>Informasi pesanan dan riwayat pembelian</li>
                  <li>Informasi poin dan reward</li>
                  <li>Informasi perangkat dan penggunaan aplikasi</li>
                </ul>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">2. Penggunaan Informasi</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Kami menggunakan informasi yang dikumpulkan untuk:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Memproses dan mengelola pesanan Anda</li>
                  <li>Meningkatkan layanan dan pengalaman pengguna</li>
                  <li>Mengirim notifikasi tentang pesanan dan promo</li>
                  <li>Mengelola program poin dan reward</li>
                  <li>Mencegah penipuan dan keamanan akun</li>
                </ul>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">3. Keamanan Data</h3>
                <p className="text-sm text-gray-600">
                  Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi Anda dari akses tidak sah, perubahan, penghancuran, atau pengungkapan yang tidak disengaja. Namun, tidak ada metode transmisi melalui internet atau penyimpanan elektronik yang 100% aman.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">4. Berbagi Informasi</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami mungkin membagikan informasi Anda dalam keadaan berikut:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Dengan penyedia layanan untuk memproses pesanan</li>
                  <li>Jika diwajibkan oleh hukum atau peraturan</li>
                  <li>Untuk melindungi hak dan properti kami</li>
                  <li>Dengan persetujuan Anda yang eksplisit</li>
                </ul>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">5. Hak Anda</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Anda memiliki hak untuk:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Mengakses informasi pribadi Anda</li>
                  <li>Memperbarui informasi yang salah</li>
                  <li>Menghapus akun dan data pribadi</li>
                  <li>Menolak penerimaan notifikasi promosi</li>
                  <li>Meminta salinan data pribadi Anda</li>
                </ul>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">6. Cookie dan Teknologi</h3>
                <p className="text-sm text-gray-600">
                  Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman pengguna, menganalisis tren, dan mengelola aplikasi. Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi dengan baik.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">7. Perubahan Kebijakan</h3>
                <p className="text-sm text-gray-600">
                  Kami berhak mengubah kebijakan privasi ini sewaktu-waktu. Perubahan akan dipublikasikan di aplikasi dan akan efektif segera setelah publikasi.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-lg text-gray-800 mb-2">8. Kontak</h3>
                <p className="text-sm text-gray-600">
                  Jika Anda memiliki pertanyaan atau kekhawatiran tentang kebijakan privasi ini, atau ingin mengajukan keluhan, silakan hubungi kami melalui email atau nomor telepon yang tertera.
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
