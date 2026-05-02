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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { POS } from '@/components/admin/POS'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { UserChatDialog } from '@/components/UserChatDialog'

// Mock data - using product IDs from database
const mockProducts = [
  {
    id: 'cmok8z92g0008l9tmj547udj5',
    name: 'Ayam Geprek Original',
    price: 15000,
    discountPrice: null,
    discountPercent: null,
    category: 'Makanan',
    image: '🍗',
    stock: 50,
    barcode: 'AG001',
  },
  {
    id: 'cmok8z92i000al9tmtv04aoyn',
    name: 'Ayam Geprek Keju',
    price: 18000,
    discountPrice: 15000,
    discountPercent: 17,
    category: 'Makanan',
    image: '🧀',
    stock: 30,
    barcode: 'AG002',
  },
  {
    id: 'cmok8z92k000cl9tmjo7tdo9y',
    name: 'Nasi Pecel Ayam',
    price: 20000,
    discountPrice: null,
    discountPercent: null,
    category: 'Makanan',
    image: '🍛',
    stock: 40,
    barcode: 'NP001',
  },
  {
    id: 'cmok8z92m000el9tmc7bluwiq',
    name: 'Es Teh Manis',
    price: 5000,
    discountPrice: null,
    discountPercent: null,
    category: 'Minuman',
    image: '🧊',
    stock: 100,
    barcode: 'ET001',
  },
  {
    id: 'cmok8z92n000gl9tmfb1hhbst',
    name: 'Es Jeruk Peras',
    price: 8000,
    discountPrice: null,
    discountPercent: null,
    category: 'Minuman',
    image: '🍊',
    stock: 80,
    barcode: 'EJ001',
  },
  {
    id: 'cmok8z92p000il9tmbhu75gv0',
    name: 'Kopi Susu Gula Aren',
    price: 12000,
    discountPrice: null,
    discountPercent: null,
    category: 'Minuman',
    image: '☕',
    stock: 60,
    barcode: 'KS001',
  },
  {
    id: 'cmok8z92q000kl9tmgxz2cbc5',
    name: 'Keripik Singkong',
    price: 10000,
    discountPrice: null,
    discountPercent: null,
    category: 'Snack',
    image: '🍠',
    stock: 50,
    barcode: 'KS002',
  },
  {
    id: 'cmok8z92r000ml9tmm6p1onbq',
    name: 'Kerupuk Udang',
    price: 12000,
    discountPrice: 10000,
    discountPercent: 17,
    category: 'Snack',
    image: '🦐',
    stock: 40,
    barcode: 'KU001',
  },
  {
    id: 'cmok8z92t000ol9tmmsag6wb4',
    name: 'Sambal Ijo Botol',
    price: 25000,
    discountPrice: null,
    discountPercent: null,
    category: 'Bumbu',
    image: '🌶️',
    stock: 30,
    barcode: 'SI001',
  },
  {
    id: 'cmok8z92u000ql9tmoqdxfzz7',
    name: 'Sambal Merah',
    price: 20000,
    discountPrice: null,
    discountPercent: null,
    category: 'Bumbu',
    image: '🔴',
    stock: 35,
    barcode: 'SM001',
  },
  {
    id: 'cmok8z92v000sl9tm5e4nz4cb',
    name: 'Bumbu Rendang',
    price: 8000,
    discountPrice: null,
    discountPercent: null,
    category: 'Bumbu',
    image: '🥘',
    stock: 45,
    barcode: 'BR001',
  },
  {
    id: 'cmok8z92w000ul9tmt4vb8lvu',
    name: 'Minyak Goreng 2L',
    price: 35000,
    discountPrice: 30000,
    discountPercent: 14,
    category: 'Kebutuhan Rumah',
    image: '🫗',
    stock: 25,
    barcode: 'MG001',
  },
]

const categories = [
  { id: 'all', name: 'Semua', icon: '🛒' },
  { id: 'makanan', name: 'Makanan', icon: '🍽️' },
  { id: 'minuman', name: 'Minuman', icon: '🥤' },
  { id: 'snack', name: 'Snack', icon: '🍿' },
  { id: 'bumbu', name: 'Bumbu', icon: '🌶️' },
  { id: 'kebutuhan-rumah', name: 'Kebutuhan Rumah', icon: '🏠' },
]

const mockOrders = [
  {
    id: 'ORD001',
    orderNumber: 'ORD1704067200000',
    totalAmount: 65000,
    finalAmount: 65000,
    paymentMethod: 'COD',
    paymentStatus: 'paid',
    orderStatus: 'completed',
    createdAt: '2024-01-15T10:30:00',
    items: [
      { name: 'Ayam Geprek Keju', quantity: 2, price: 15000 },
      { name: 'Es Teh Manis', quantity: 2, price: 5000 },
      { name: 'Sambal Ijo Botol', quantity: 1, price: 25000 },
    ],
  },
  {
    id: 'ORD002',
    orderNumber: 'ORD1704067300000',
    totalAmount: 30000,
    finalAmount: 30000,
    paymentMethod: 'QRIS',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    createdAt: '2024-01-14T14:45:00',
    items: [
      { name: 'Nasi Pecel Ayam', quantity: 1, price: 20000 },
      { name: 'Kopi Susu Gula Aren', quantity: 1, price: 12000 },
    ],
  },
]

const vouchers = [
  { code: 'DISKON10', name: 'Diskon 10%', description: 'Min. belanja Rp 50.000', value: 10 },
  { code: 'HEMAT20K', name: 'Hemat Rp 20.000', description: 'Min. belanja Rp 100.000', value: 20000 },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isQRISModalOpen, setIsQRISModalOpen] = useState(false)
  const [showFloatingBarcode, setShowFloatingBarcode] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [qrisData, setQrisData] = useState<any>(null)
  const [uploadedPaymentProof, setUploadedPaymentProof] = useState<File | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isPaymentUploadModalOpen, setIsPaymentUploadModalOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false)
  const [redeemedVoucherCode, setRedeemedVoucherCode] = useState('')
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

  useEffect(() => {
    try {
      setMounted(true)
      checkAuth()
    } catch (error) {
      console.error('Error during mount:', error)
      setMounted(true) // Ensure mounted is set even on error
    }
  }, [])

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' })
      logout()
      toast.success('Logout berhasil')
      setOrders([])
    } catch (error) {
      logout()
      setOrders([])
    }
  }

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
  const [selectedVoucher, setSelectedVoucher] = useState<string>('')

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

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase().includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.discountPrice || item.price
    return sum + price * item.quantity
  }, 0)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate discount
  let discountAmount = 0
  if (selectedVoucher) {
    const voucher = vouchers.find((v) => v.code === selectedVoucher)
    if (voucher && cartTotal >= 50000) {
      discountAmount = typeof voucher.value === 'number' && voucher.value > 100
        ? voucher.value
        : Math.floor(cartTotal * (voucher.value / 100))
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

  // Handle validate point voucher
  const handleApplyPointVoucher = async (code: string) => {
    if (!user || !token) {
      toast.error('Silakan login terlebih dahulu')
      return
    }

    setIsApplyingVoucher(true)
    try {
      const res = await fetch('/api/point-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setPointVoucher(data.voucher)
        toast.success(`Voucher berhasil! ${data.voucher.productName} akan ditambahkan ke keranjang`)
      } else {
        toast.error(data.error || 'Gagal memvalidasi voucher')
        setPointVoucher(null)
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
      setPointVoucher(null)
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  // Fetch orders when user changes or tab changes to orders
  useEffect(() => {
    if (user && currentTab === 'orders') {
      const controller = new AbortController()
      const signal = controller.signal

      // Wrap in setTimeout to avoid synchronous setState
      setTimeout(() => fetchOrdersFromApi(signal), 0)

      return () => {
        controller.abort()
      }
    }
  }, [user, currentTab])

  // Fetch point redemptions when tab changes to redeem
  useEffect(() => {
    if (currentTab === 'redeem') {
      setTimeout(() => fetchPointRedemptions(), 0)
    }
  }, [currentTab])

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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-red-600 to-orange-500 shadow-md">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                <svg viewBox="0 0 100 100" className="w-6 h-6">
                  <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DC2626" stopOpacity={1} />
                      <stop offset="100%" stopColor="#F97316" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="chickenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FCD34D" stopOpacity={1} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity={1} />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <circle cx="50" cy="50" r="46" fill="url(#logoGrad)" filter="url(#glow)" opacity="0.15" />
                  <circle cx="50" cy="50" r="44" fill="url(#logoGrad)" />
                  
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
                  <ellipse cx="50" cy="52" rx="20" ry="18" fill="url(#chickenGrad)" stroke="#B45309" strokeWidth="1.5" />
                  
                  {/* Crispy effect */}
                  <ellipse cx="50" cy="52" rx="18" ry="16" fill="none" stroke="#FCD34D" strokeWidth="2" strokeDasharray="3 3" opacity="0.3" />
                  
                  {/* Head */}
                  <circle cx="50" cy="42" r="11" fill="url(#chickenGrad)" stroke="#B45309" strokeWidth="1.5" />
                  
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
                  <path d="M30 48 Q25 42 28 50 Q32 48 30 48 Z" fill="url(#chickenGrad)" stroke="#B45309" strokeWidth="1" />
                  <path d="M70 48 Q75 42 72 50 Q68 48 70 48 Z" fill="url(#chickenGrad)" stroke="#B45309" strokeWidth="1" />
                  
                  {/* Feet */}
                  <path d="M42 68 L40 75 L44 75 L42 68 Z" fill="#F97316" />
                  <path d="M58 68 L56 75 L60 75 L58 68 Z" fill="#F97316" />
                  
                  {/* Spicy accent glow */}
                  <circle cx="50" cy="52" r="25" fill="url(#flameGrad)" opacity="0.08" />
                  
                  {/* Small spice particles */}
                  <circle cx="35" cy="35" r="2" fill="#FCD34D" opacity="0.6" />
                  <circle cx="65" cy="35" r="2" fill="#FCD34D" opacity="0.6" />
                  <circle cx="42" cy="30" r="1.5" fill="#F97316" opacity="0.5" />
                  <circle cx="58" cy="30" r="1.5" fill="#F97316" opacity="0.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-xs font-bold text-white tracking-wide">AYAM GEPREK SAMBAL IJO</h1>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="flex items-center gap-1 text-white/90 text-[10px] hover:text-white transition-colors cursor-pointer"
                >
                  <MapPin className="h-2.5 w-2.5" />
                  <span className="truncate max-w-[150px]">Jl. Medan - Banda Aceh, Simpang Camat, Gampong Tijue, 24151</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {user?.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={() => setShowAdminDashboard(true)}
                >
                  <Store className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 relative h-8 w-8"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-yellow-400 text-red-900 text-[9px] font-bold">
                    {cartCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={() => user ? setIsChatOpen(true) : setIsAuthModalOpen(true)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={() => (user ? handleLogout() : setIsAuthModalOpen(true))}
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari produk..."
                className="pl-9 h-8 text-xs bg-white/90 border-0 focus:ring-1 focus:ring-orange-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        {currentTab === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Member Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 border-0 shadow-xl overflow-hidden relative">
                {/* Decorative pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                {/* Floating Barcode Widget */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-4 right-4 z-10"
                  >
                    <div className="relative">
                      <AnimatePresence>
                        {showFloatingBarcode && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="mb-3"
                          >
                            <Card className="bg-white border-2 border-orange-300 shadow-xl overflow-hidden w-64">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                                      <User className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm text-gray-800">{user.name || 'Pelanggan'}</p>
                                      <p className="text-xs text-gray-500">{user.memberLevel}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3">
                                  <div className="flex justify-center mb-2">
                                    <Barcode
                                      value={user.phone || user.id}
                                      width={1.5}
                                      height={40}
                                      displayValue={false}
                                      background="transparent"
                                      lineColor="#1F2937"
                                    />
                                  </div>
                                  <p className="text-center text-xs font-bold text-gray-800 tracking-wider">
                                    {user.phone || user.id}
                                  </p>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                  <div className="text-center">
                                    <div className="text-lg">💳</div>
                                    <div className="text-xs font-semibold text-gray-800">{user.points}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg">🎯</div>
                                    <div className="text-xs font-semibold text-gray-800">{user.stampCount}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg">⭐</div>
                                    <div className="text-xs font-semibold text-gray-800">{user.starCount}</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setShowFloatingBarcode(!showFloatingBarcode)}
                          className="h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl border-2 border-orange-300"
                        >
                          <AnimatePresence mode="wait">
                            {showFloatingBarcode ? (
                              <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <XCircle className="h-5 w-5 text-red-600" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="barcode"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <QrCode className="h-5 w-5 text-red-600" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                <CardContent className="p-5 relative">
                  {user ? (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-white">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" />
                            <p className="text-sm opacity-90">Halo, {user.name || 'Pelanggan'}!</p>
                          </div>
                          <h2 className="text-xl font-bold flex items-center gap-2">
                            Member {user.memberLevel}
                            <Badge className="bg-yellow-400 text-yellow-900 text-xs font-bold">
                              {user.memberLevel}
                            </Badge>
                          </h2>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                          <div className="flex items-center gap-1 text-white">
                            <Star className="h-5 w-5 fill-yellow-300" />
                            <span className="font-bold text-lg">{user.points}</span>
                          </div>
                          <p className="text-white/80 text-xs text-center">Poin</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                          <div className="text-2xl mb-1">💳</div>
                          <div className="text-white font-bold text-lg">{user.points}</div>
                          <div className="text-white/80 text-xs">Total Poin</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                          <div className="text-2xl mb-1">🎯</div>
                          <div className="text-white font-bold text-lg">{user.stampCount}</div>
                          <div className="text-white/80 text-xs">Stamp</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                          <div className="text-2xl mb-1">⭐</div>
                          <div className="text-white font-bold text-lg">{user.starCount}</div>
                          <div className="text-white/80 text-xs">Star</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="flex items-center justify-between text-white/90 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            <span>ID Member: {user.id.slice(0, 8).toUpperCase()}</span>
                          </div>
                          <Badge className="bg-white/20 text-white text-xs">
                            {user.memberLevel}
                          </Badge>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-white hover:bg-white/20"
                          onClick={() => setCurrentTab('account')}
                        >
                          Lihat Detail Member
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-5xl mb-3">👤</div>
                      <h3 className="text-xl font-bold text-white mb-2">Bergabung Menjadi Member</h3>
                      <p className="text-white/90 text-sm mb-4">
                        Dapatkan poin, stamp, dan star untuk setiap pembelian!
                      </p>
                      <Button
                        className="bg-white text-red-600 hover:bg-gray-100 font-bold"
                        onClick={() => setIsAuthModalOpen(true)}
                      >
                        Daftar / Login Sekarang
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

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
            <div className="mb-6">
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl min-w-[70px] transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 shadow hover:shadow-md'
                      }`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-xs font-medium">{category.name}</span>
                    </motion.button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Products Grid */}
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
                        <div className="aspect-square bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-6xl">
                          {product.image}
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
                              Rp {product.discountPrice || product.price.toLocaleString()}
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
                              discountPrice: product.discountPrice || undefined,
                              quantity: 1,
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

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Tidak ada produk ditemukan</p>
              </div>
            )}
          </motion.div>
        )}

        {currentTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Semua Produk</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-6xl">
                        {product.image}
                      </div>
                      {product.discountPercent && (
                        <Badge className="absolute top-2 right-2 bg-red-600 text-white font-bold">
                          -{product.discountPercent}%
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-red-600">
                            Rp {product.discountPrice || product.price.toLocaleString()}
                          </p>
                          {product.discountPrice && (
                            <p className="text-xs text-gray-400 line-through">
                              Rp {product.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500"
                        onClick={() => {
                          addToCart({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            discountPrice: product.discountPrice || undefined,
                            quantity: 1,
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
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                        <Percent className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{voucher.name}</h4>
                        <p className="text-sm text-gray-600">{voucher.description}</p>
                        <Badge className="mt-2">{voucher.code}</Badge>
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
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-red-600" />
                          <span className="font-semibold">{order.orderNumber}</span>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Akun Saya</h2>
            {user ? (
              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-red-500 to-orange-500 border-0">
                  <CardContent className="p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                        👤
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{user.name || 'Pelanggan'}</h3>
                        <p className="text-white/80">{user.email}</p>
                        <Badge className="mt-2 bg-yellow-400 text-red-900 font-bold">
                          {user.memberLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Loyalty Points
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-red-600">{user.points}</div>
                        <div className="text-sm text-gray-600">Poin</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-orange-600">{user.stampCount}</div>
                        <div className="text-sm text-gray-600">Stamp</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-yellow-600">{user.starCount}</div>
                        <div className="text-sm text-gray-600">Star</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsAuthModalOpen(false)}>
                      <UserIcon className="h-5 w-5 mr-3" />
                      Edit Profil
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsAuthModalOpen(false)}>
                      <MapPin className="h-5 w-5 mr-3" />
                      Alamat Pengiriman
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsAuthModalOpen(false)}>
                      <Settings className="h-5 w-5 mr-3" />
                      Pengaturan
                    </Button>
                    <Separator />
                    <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Silakan login untuk melihat akun Anda</p>
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {[
              { id: 'home', icon: Home, label: 'Beranda' },
              { id: 'products', icon: Package, label: 'Belanja' },
              { id: 'redeem', icon: Gift, label: 'Tukar' },
              { id: 'orders', icon: FileText, label: 'Pesanan' },
              { id: 'account', icon: User, label: 'Akun' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  currentTab === item.id
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-red-600" />
              Keranjang Belanja
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] px-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Keranjang kosong</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center text-3xl">
                      📦
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-red-600 font-bold">
                        Rp {(item.discountPrice || item.price).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 ml-auto text-red-600 hover:text-red-700"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {cart.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="space-y-2 mb-4">
                {selectedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon Voucher</span>
                    <span>-Rp {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-xl text-red-600">Rp {finalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    clearCart()
                    toast.success('Keranjang dikosongkan')
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Kosongkan
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  onClick={() => {
                    setIsCartOpen(false)
                    handleOpenCheckout()
                  }}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Checkout Sekarang
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Checkout</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Ringkasan Pesanan</h4>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                        {item.isFree && <Badge className="ml-2 bg-green-500 text-white">GRATIS</Badge>}
                      </span>
                      <span>Rp {((item.discountPrice || item.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {pointVoucher && (
                    <div className="flex justify-between text-sm text-green-600 bg-green-50 p-2 rounded">
                      <span>🎁 {pointVoucher.productName} (Gratis)</span>
                      <span>Rp 0</span>
                    </div>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold">
                  <span>Subtotal</span>
                  <span>Rp {cartTotal.toLocaleString()}</span>
                </div>
                {selectedVoucher && !pointVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon Voucher</span>
                    <span>-Rp {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-red-600">
                  <span>Total</span>
                  <span>Rp {finalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Point Voucher */}
              <div>
                <Label className="mb-2 block">Voucher Poin (Opsional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode voucher poin"
                    value={pointVoucher ? pointVoucher.code : ''}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase().trim()
                      if (code.length >= 10) {
                        handleApplyPointVoucher(code)
                      } else if (code === '') {
                        setPointVoucher(null)
                      }
                    }}
                    disabled={!!pointVoucher || isApplyingVoucher}
                  />
                  {pointVoucher && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPointVoucher(null)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {isApplyingVoucher && (
                  <p className="text-xs text-gray-500 mt-1">Memvalidasi voucher...</p>
                )}
                {pointVoucher && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700">
                      ✅ {pointVoucher.productName} akan ditambahkan gratis!
                    </p>
                  </div>
                )}
              </div>

              {/* Regular Voucher */}
              <div>
                <Label className="mb-2 block">Voucher Diskon (Opsional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode voucher diskon"
                    value={selectedVoucher}
                    onChange={(e) => setSelectedVoucher(e.target.value.toUpperCase())}
                    disabled={!!pointVoucher}
                  />
                  {selectedVoucher && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedVoucher('')}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {selectedVoucher && cartTotal < 50000 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Minimum belanja Rp 50.000 untuk menggunakan voucher
                  </p>
                )}
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <div>
                  <Label className="mb-1 block">Nama Penerima</Label>
                  <Input
                    value={checkoutData.customerName}
                    onChange={(e) => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">No. HP</Label>
                  <Input
                    type="tel"
                    value={checkoutData.customerPhone}
                    onChange={(e) => setCheckoutData({ ...checkoutData, customerPhone: e.target.value })}
                    placeholder="081234567890"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Alamat Pengiriman</Label>
                  <Textarea
                    value={checkoutData.customerAddress}
                    onChange={(e) => setCheckoutData({ ...checkoutData, customerAddress: e.target.value })}
                    placeholder="Alamat lengkap pengiriman"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Catatan (Opsional)</Label>
                  <Textarea
                    value={checkoutData.notes}
                    onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                    placeholder="Catatan untuk pesanan"
                    rows={2}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="mb-2 block">Metode Pembayaran</Label>
                <RadioGroup
                  value={checkoutData.paymentMethod}
                  onValueChange={(value) => setCheckoutData({ ...checkoutData, paymentMethod: value })}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="COD" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        <span className="font-medium">COD (Bayar di Tempat)</span>
                      </div>
                      <p className="text-xs text-gray-500">Bayar saat barang sampai</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="QRIS" id="qris" />
                    <Label htmlFor="qris" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">QRIS</span>
                      </div>
                      <p className="text-xs text-gray-500">Scan QR Code untuk bayar</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                onClick={handleCheckout}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
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
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Kode Voucher Anda:</p>
              <div className="bg-white border-2 border-dashed border-red-300 rounded-lg p-4">
                <p className="text-2xl font-bold text-red-600 tracking-wider">
                  {redeemedVoucherCode}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>✅ Voucher sekali pakai</p>
              <p>✅ Gunakan di keranjang saat checkout</p>
              <p>✅ Produk gratis akan ditambahkan otomatis</p>
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
                  <span>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              {isLogin ? 'Login' : 'Daftar'}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
              <TabsTrigger value="demo">Demo</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label className="mb-1 block">Email</Label>
                  <Input
                    type="email"
                    value={authData.email}
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Password</Label>
                  <Input
                    type="password"
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordOpen(true)
                    setIsAuthModalOpen(false)
                  }}
                  className="w-full text-sm text-red-600 hover:text-red-700 hover:underline text-left"
                >
                  Lupa Password?
                </button>
                <Button type="submit" className="w-full bg-gradient-to-r from-red-500 to-orange-500">
                  Login
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label className="mb-1 block">Nama Lengkap</Label>
                  <Input
                    value={authData.name}
                    onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Email</Label>
                  <Input
                    type="email"
                    value={authData.email}
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label className="mb-1 block">No. HP</Label>
                  <Input
                    type="tel"
                    value={authData.phone}
                    onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                    placeholder="081234567890"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Alamat</Label>
                  <Textarea
                    value={authData.address}
                    onChange={(e) => setAuthData({ ...authData, address: e.target.value })}
                    placeholder="Alamat lengkap"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Password</Label>
                  <Input
                    type="password"
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-red-500 to-orange-500">
                  Daftar
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="demo">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Demo Accounts</h3>
                      <p className="text-xs text-gray-600">Gunakan akun ini untuk mencoba aplikasi</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-500">Admin</Badge>
                        <span className="text-xs text-gray-500">Akses penuh dashboard</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-semibold text-gray-700">Email:</span> admin@ayamgeprek.com</p>
                        <p className="text-sm"><span className="font-semibold text-gray-700">Password:</span> admin123</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-500">Customer</Badge>
                        <span className="text-xs text-gray-500">Akses pembelian pelanggan</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-semibold text-gray-700">Email:</span> customer@gmail.com</p>
                        <p className="text-sm"><span className="font-semibold text-gray-700">Password:</span> user123</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <p className="text-xs text-gray-600 text-center">
                      💡 Klik tombol salin di samping untuk menyalin kredensial
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsLogin(true)}
                    className="w-full"
                  >
                    Kembali ke Login
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Barcode Modal */}
      {/* Forgot Password Modal */}
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
    </div>
  )
}
