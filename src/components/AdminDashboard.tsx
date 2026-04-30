'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface StatCard {
  title: string
  value: string
  change: string
  positive: boolean
  icon: any
  color: string
}

export function AdminDashboard({ onBack }: { onBack?: () => void }) {
  const { user } = useStore()
  const [showPOS, setShowPOS] = useState(false)
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
      title: 'Pengaturan',
      description: 'Konfigurasi sistem',
      icon: LayoutDashboard,
      color: 'bg-gradient-to-br from-gray-500 to-gray-600',
      onClick: () => {},
    },
  ]

  const recentOrders = [
    { id: 'ORD001', customer: 'Budi Santoso', total: 65000, status: 'completed', time: '10:30' },
    { id: 'ORD002', customer: 'Siti Aminah', total: 32000, status: 'shipped', time: '11:45' },
    { id: 'ORD003', customer: 'Ahmad Rizki', total: 89000, status: 'processing', time: '13:20' },
    { id: 'ORD004', customer: 'Dewi Sartika', total: 45000, status: 'completed', time: '14:15' },
    { id: 'ORD005', customer: 'Eko Prasetyo', total: 125000, status: 'pending', time: '15:00' },
  ]

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
                  </defs>
                  <circle cx="50" cy="50" r="45" fill="url(#logoGrad2)" />
                  <path d="M50 25 L35 40 L40 30 Z M50 25 L65 40 L60 30 Z M45 40 L35 35 L38 32 Z M55 40 L65 35 L62 32 Z" fill="#FFF" opacity="0.9" />
                  <path d="M30 50 Q25 45 28 40 Q35 42 32 50 Z" fill="#FFD700" opacity="0.8" />
                  <path d="M70 50 Q75 45 72 40 Q65 42 68 50 Z" fill="#FFD700" opacity="0.8" />
                  <ellipse cx="50" cy="55" rx="15" ry="20" fill="#FFF" opacity="0.95" />
                  <circle cx="50" cy="50" r="8" fill="#DC2626" opacity="0.2" />
                  <circle cx="46" cy="48" r="2" fill="#DC2626" />
                  <circle cx="54" cy="48" r="2" fill="#DC2626" />
                  <path d="M50 53 L47 56 L53 56 Z" fill="#F97316" />
                  <circle cx="50" cy="75" r="3" fill="#FFD700" opacity="0.6" />
                  <circle cx="40" cy="72" r="2" fill="#FFD700" opacity="0.5" />
                  <circle cx="60" cy="72" r="2" fill="#FFD700" opacity="0.5" />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-red-600" />
                    Pesanan Terbaru
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    Lihat Semua
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {order.customer.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{order.customer}</p>
                          <p className="text-xs text-gray-500">{order.id} • {order.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">Rp {order.total.toLocaleString()}</p>
                        <Badge
                          className={
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-700'
                              : order.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {order.status === 'completed'
                            ? 'Selesai'
                            : order.status === 'shipped'
                            ? 'Dikirim'
                            : order.status === 'processing'
                            ? 'Diproses'
                            : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  Produk Terlaris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Ayam Geprek Original', sales: 156, icon: '🍗' },
                    { name: 'Es Teh Manis', sales: 132, icon: '🧊' },
                    { name: 'Ayam Geprek Keju', sales: 98, icon: '🧀' },
                    { name: 'Sambal Ijo Botol', sales: 87, icon: '🌶️' },
                    { name: 'Kopi Susu Gula Aren', sales: 76, icon: '☕' },
                  ].map((product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl">
                        {product.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sales} terjual</p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
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
