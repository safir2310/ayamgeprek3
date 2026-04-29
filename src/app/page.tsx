'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
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
import { POS } from '@/components/POS'

// Mock data
const mockProducts = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
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
    id: '6',
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
    id: '7',
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
    id: '8',
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
    id: '9',
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
    id: '10',
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
    id: '11',
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
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedVoucher, setSelectedVoucher] = useState('')
  const [authData, setAuthData] = useState({ email: '', password: '', name: '', phone: '', address: '' })
  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'COD',
    notes: '',
  })
  const [showPOS, setShowPOS] = useState(false)

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
  } = useStore()

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

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
    } catch (error) {
      logout()
    }
  }

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
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart,
          ...checkoutData,
          voucherCode: selectedVoucher || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        clearCart()
        setIsCheckoutOpen(false)
        toast.success(`Order ${data.order.orderNumber} berhasil dibuat!`)
        if (data.order.paymentMethod === 'QRIS' && data.order.qrCode) {
          toast.info(`Scan QR Code untuk pembayaran`)
        }
        setCurrentTab('orders')
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

  if (!mounted) return null

  if (showPOS) {
    return <POS onBack={() => setShowPOS(false)} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-orange-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-red-600 to-orange-500 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
                🍗
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Ayam Geprek Sambal Ijo</h1>
                <p className="text-xs text-white/80">Jl. Medan - Banda Aceh • 085260812758</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowPOS(!showPOS)}
                >
                  <Store className="h-6 w-6" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-yellow-400 text-red-900 text-xs font-bold">
                    {cartCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => (user ? handleLogout() : setIsAuthModalOpen(true))}
              >
                <User className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari produk..."
                className="pl-10 bg-white/90 border-0 focus:ring-2 focus:ring-orange-300"
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
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 border-0 shadow-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <p className="text-sm opacity-90">Halo, {user.name || 'Pelanggan'}!</p>
                        <h2 className="text-2xl font-bold">Level: {user.memberLevel}</h2>
                      </div>
                      <div className="text-right text-white">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-300" />
                          <span className="font-bold">{user.points} Poin</span>
                        </div>
                        <div className="text-sm opacity-90">{user.stampCount} Stamp • {user.starCount} Star</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

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
            {mockOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Belum ada pesanan</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {mockOrders.map((order) => (
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
                              : 'bg-yellow-600'
                          }
                        >
                          {order.orderStatus === 'completed'
                            ? 'Selesai'
                            : order.orderStatus === 'shipped'
                            ? 'Dikirim'
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
                      <Button
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => {
                          setSelectedOrder(order)
                          setIsOrderDetailOpen(true)
                        }}
                      >
                        Lihat Detail
                      </Button>
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
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {[
              { id: 'home', icon: Home, label: 'Beranda' },
              { id: 'products', icon: Package, label: 'Belanja' },
              { id: 'promo', icon: Flame, label: 'Promo' },
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
              <Button
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                onClick={() => {
                  setIsCartOpen(false)
                  setIsCheckoutOpen(true)
                }}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Checkout Sekarang
              </Button>
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
                      <span>{item.name} x{item.quantity}</span>
                      <span>Rp {((item.discountPrice || item.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold">
                  <span>Subtotal</span>
                  <span>Rp {cartTotal.toLocaleString()}</span>
                </div>
                {selectedVoucher && (
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

              {/* Voucher */}
              <div>
                <Label className="mb-2 block">Voucher (Opsional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode voucher"
                    value={selectedVoucher}
                    onChange={(e) => setSelectedVoucher(e.target.value.toUpperCase())}
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
                        : 'bg-yellow-600'
                    }
                  >
                    {selectedOrder.orderStatus === 'completed'
                      ? 'Selesai'
                      : selectedOrder.orderStatus === 'shipped'
                      ? 'Dikirim'
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

      {/* Auth Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              {isLogin ? 'Login' : 'Daftar'}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
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
                <Button type="submit" className="w-full bg-gradient-to-r from-red-500 to-orange-500">
                  Login
                </Button>
              </form>
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <p className="font-semibold mb-1">Demo Account:</p>
                <p className="text-xs">Admin: admin@ayamgeprek.com / admin123</p>
                <p className="text-xs">User: customer@gmail.com / user123</p>
              </div>
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
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
