'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  TrendingUp,
  ArrowRight,
  LogOut,
  Store,
  BarChart3,
  RefreshCw,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  ArrowUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface StatCard {
  title: string
  value: string
  change: string
  positive: boolean
  icon: any
  color: string
}

interface DatabaseSyncData {
  stats: {
    totalUsers: number
    totalProducts: number
    totalOrders: number
    totalVouchers: number
    todayOrders: number
    todayRevenue: number
    pendingOrders: number
    completedOrders: number
    totalRevenue: number
  }
  recentOrders: any[]
  topProducts: any[]
  topCustomers: any[]
  lastSync: string
}

export function AdminDashboard({ onBack }: { onBack?: () => void }) {
  const { user } = useStore()
  const [showPOS, setShowPOS] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncData, setSyncData] = useState<DatabaseSyncData | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Total Pendapatan',
      value: 'Rp 15.450.000',
      change: '+12.5%',
      positive: true,
      icon: CreditCard,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Order',
      value: '248',
      change: '+8.2%',
      positive: true,
      icon: ShoppingBag,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Produk Terjual',
      value: '1.234',
      change: '+15.3%',
      positive: true,
      icon: Package,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Pelanggan Aktif',
      value: '89',
      change: '+5.7%',
      positive: true,
      icon: Users,
      color: 'from-orange-500 to-red-500',
    },
  ])

  const quickActions = [
    {
      title: 'Point of Sale',
      description: 'Transaksi kasir',
      icon: Store,
      color: 'bg-gradient-to-br from-red-500 to-orange-500',
      onClick: () => setShowPOS(true),
    },
    {
      title: 'Kelola Produk',
      description: 'Tambah, edit, hapus produk',
      icon: Package,
      color: 'bg-gradient-to-br from-blue-500 to-purple-500',
      onClick: () => {},
    },
    {
      title: 'Daftar Pesanan',
      description: 'Lihat semua pesanan',
      icon: ShoppingBag,
      color: 'bg-gradient-to-br from-green-500 to-teal-500',
      onClick: () => {},
    },
    {
      title: 'Kelola User',
      description: 'Kelola pelanggan',
      icon: Users,
      color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      onClick: () => {},
    },
    {
      title: 'Laporan Penjualan',
      description: 'Analisis dan laporan',
      icon: BarChart3,
      color: 'bg-gradient-to-br from-pink-500 to-rose-500',
      onClick: () => {},
    },
    {
      title: 'Sinkronisasi Database',
      description: 'Sinkronisasi ke seluruh halaman',
      icon: Database,
      color: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      onClick: handleSync,
    },
  ]

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/admin/sync')
      const data = await res.json()

      if (data.success) {
        setSyncData(data.data)
        setLastSyncTime(new Date().toLocaleString('id-ID'))

        // Update stats with real data
        setStats([
          {
            title: 'Total Pendapatan',
            value: `Rp ${(data.data.stats.totalRevenue / 1000000).toFixed(3)} Juta`,
            change: '+0%',
            positive: true,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-500',
          },
          {
            title: 'Total Order',
            value: data.data.stats.totalOrders.toString(),
            change: '+0%',
            positive: true,
            icon: ShoppingBag,
            color: 'from-blue-500 to-cyan-500',
          },
          {
            title: 'Produk Terjual',
            value: data.data.stats.totalProducts.toString(),
            change: '+0%',
            positive: true,
            icon: Package,
            color: 'from-purple-500 to-pink-500',
          },
          {
            title: 'Pelanggan Aktif',
            value: data.data.stats.totalUsers.toString(),
            change: '+0%',
            positive: true,
            icon: Users,
            color: 'from-orange-500 to-red-500',
          },
        ])

        toast.success('✅ Database berhasil disinkronisasi!')
      } else {
        toast.error('Gagal sinkronisasi database')
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Terjadi kesalahan saat sinkronisasi')
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    // Auto sync on mount
    handleSync()
  }, [])

  if (showPOS) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setShowPOS(false)}
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Point of Sale</h1>
                <p className="text-xs text-white/80">Ayam Geprek Sambal Ijo</p>
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 text-center text-gray-500">
          <Store className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>POS Component akan dimuat di sini</p>
          <p className="text-sm mt-2">Klik tombol kembali untuk ke Dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onBack}
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <svg viewBox="0 0 100 100" className="w-8 h-8">
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
                  <path d="M25 55 Q20 45 28 35 Q35 40 32 55 Z" fill="#F97316" opacity="0.3" />
                  <path d="M75 55 Q80 45 72 35 Q65 40 68 55 Z" fill="#F97316" opacity="0.3" />
                  <circle cx="22" cy="62" r="4" fill="#DC2626" opacity="0.4" />
                  <circle cx="78" cy="62" r="4" fill="#DC2626" opacity="0.4" />
                  <ellipse cx="15" cy="70" rx="6" ry="12" fill="#DC2626" transform="rotate(-30 15 70)" />
                  <ellipse cx="85" cy="70" rx="6" ry="12" fill="#DC2626" transform="rotate(30 85 70)" />
                  <ellipse cx="20" cy="75" rx="4" ry="10" fill="#EF4444" transform="rotate(-45 20 75)" />
                  <ellipse cx="80" cy="75" rx="4" ry="10" fill="#EF4444" transform="rotate(45 80 75)" />
                  <ellipse cx="50" cy="52" rx="20" ry="18" fill="url(#chickenGrad2)" stroke="#B45309" strokeWidth="1.5" />
                  <ellipse cx="50" cy="52" rx="18" ry="16" fill="none" stroke="#FCD34D" strokeWidth="2" strokeDasharray="3 3" opacity="0.3" />
                  <circle cx="50" cy="42" r="11" fill="url(#chickenGrad2)" stroke="#B45309" strokeWidth="1.5" />
                  <path d="M50 31 Q45 25 48 28 Q50 26 52 28 Q55 25 50 31 Z" fill="#DC2626" />
                  <path d="M45 28 L40 26 L47 29 Z" fill="#F97316" opacity="0.8" />
                  <path d="M55 28 L60 26 L53 29 Z" fill="#F97316" opacity="0.8" />
                  <ellipse cx="46" cy="40" rx="3" ry="3.5" fill="#FFF" />
                  <ellipse cx="54" cy="40" rx="3" ry="3.5" fill="#FFF" />
                  <circle cx="46" cy="40" r="1.5" fill="#1F2937" />
                  <circle cx="54" cy="40" r="1.5" fill="#1F2937" />
                  <path d="M50 44 L47 48 L53 48 Z" fill="#F97316" stroke="#B45309" strokeWidth="0.5" />
                  <path d="M48 48 L50 46 L52 48 Z" fill="#FBBF24" opacity="0.5" />
                  <ellipse cx="50" cy="51" rx="3" ry="4" fill="#EF4444" opacity="0.8" />
                  <path d="M30 48 Q25 42 28 50 Q32 48 30 48 Z" fill="url(#chickenGrad2)" stroke="#B45309" strokeWidth="1" />
                  <path d="M70 48 Q75 42 72 50 Q68 48 70 48 Z" fill="url(#chickenGrad2)" stroke="#B45309" strokeWidth="1" />
                  <path d="M42 68 L40 75 L44 75 L42 68 Z" fill="#F97316" />
                  <path d="M58 68 L56 75 L60 75 L58 68 Z" fill="#F97316" />
                  <circle cx="50" cy="52" r="25" fill="url(#flameGrad2)" opacity="0.08" />
                  <circle cx="35" cy="35" r="2" fill="#FCD34D" opacity="0.6" />
                  <circle cx="65" cy="35" r="2" fill="#FCD34D" opacity="0.6" />
                  <circle cx="42" cy="30" r="1.5" fill="#F97316" opacity="0.5" />
                  <circle cx="58" cy="30" r="1.5" fill="#F97316" opacity="0.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold">ADMIN DASHBOARD</h1>
                <p className="text-xs text-white/80">Ayam Geprek Sambal Ijo</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right text-sm">
              <p className="font-semibold">{user?.name || 'Admin'}</p>
              <p className="text-xs text-white/80">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              👤
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang, {user?.name || 'Admin'}!</h2>
          <p className="text-gray-600">Berikut ringkasan aktivitas toko hari ini</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <Badge className={stat.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {stat.change}
                    </Badge>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className={`p-4 rounded-xl ${action.color} text-white shadow-md hover:shadow-xl transition-all duration-300`}
              >
                <action.icon className="h-6 w-6 mx-auto mb-2" />
                <p className="text-xs font-semibold text-center leading-tight">{action.title}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Database Sync Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-red-600" />
                  Status Sinkronisasi Database
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sinkronisasi...' : 'Sinkronisasi Manual'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {syncData ? (
                  <>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{syncData.stats.totalUsers}</p>
                      <p className="text-xs text-gray-600">Total User</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{syncData.stats.totalProducts}</p>
                      <p className="text-xs text-gray-600">Total Produk</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{syncData.stats.totalOrders}</p>
                      <p className="text-xs text-gray-600">Total Order</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{syncData.stats.totalVouchers}</p>
                      <p className="text-xs text-gray-600">Total Voucher</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">{syncData.stats.todayOrders}</p>
                      <p className="text-xs text-gray-600">Order Hari Ini</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        Rp {syncData.stats.todayRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Pendapatan Hari Ini</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-600">{syncData.stats.pendingOrders}</p>
                      <p className="text-xs text-gray-600">Order Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-pink-600">{syncData.stats.completedOrders}</p>
                      <p className="text-xs text-gray-600">Order Selesai</p>
                    </div>
                  </>
                ) : (
                  <div className="col-span-4 text-center py-8 text-gray-500">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>Memuat data database...</p>
                  </div>
                )}
              </div>

              {lastSyncTime && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      Sinkronisasi Terakhir: <span className="font-semibold">{lastSyncTime}</span>
                    </p>
                  </div>
                  <Badge className={isSyncing ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                    {isSyncing ? 'Sedang Sinkronisasi' : 'Terbaru'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-red-600" />
                    Pesanan Terbaru
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {syncData ? syncData.recentOrders.length : 0} Pesanan
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {syncData && syncData.recentOrders.length > 0 ? (
                    syncData.recentOrders.slice(0, 5).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {order.customerName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{order.orderNumber} • {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">Rp {order.finalAmount.toLocaleString()}</p>
                          <Badge
                            className={
                              order.orderStatus === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : order.orderStatus === 'shipped'
                                ? 'bg-blue-100 text-blue-700'
                                : order.orderStatus === 'processing'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {order.orderStatus === 'completed'
                              ? 'Selesai'
                              : order.orderStatus === 'shipped'
                              ? 'Dikirim'
                              : order.orderStatus === 'processing'
                              ? 'Diproses'
                              : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Belum ada pesanan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  Produk Terlaris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {syncData && syncData.topProducts.length > 0 ? (
                    syncData.topProducts.map((product: any, index: number) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl">
                            {product.image || '📦'}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.soldCount} terjual</p>
                          </div>
                        </div>
                        {index < 3 && (
                          <div className="flex items-center gap-1 text-green-600">
                            <ArrowUp className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Belum ada produk</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>© 2024 Ayam Geprek Sambal Ijo. Admin Dashboard v1.0</p>
        </div>
      </footer>
    </div>
  )
}
