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
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-600" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.73 1.05-1.42 1.78-3.14 2.06-4.97.16.56.22 1.15.22 1.75 0 3.58-2.28 6.69-5.53 7.63.96.52 2.06.83 3.24.83.58 0 1.13-.06 1.65-.17-.95 2.22-3.13 3.79-5.66 3.79-1.57 0-3.06-.53-4.27-1.49l1.17-.95c.69-.57 1.63-.65 2.42-.22.67.37 1.44.54 2.22.51zM8.5 9.5l1.5 1.5 1.5-1.5-1.5-1.5-1.5 1.5z"/>
                  <path d="M19 13c0 2.92-1.56 5.47-3.9 6.87 1.05-1.25 1.45-2.93 1.01-4.55-.35-1.28-1.35-2.23-2.59-2.53-.91-.22-1.88-.09-2.67.36L10 13.65V11c0-1.1-.9-2-2-2V6.34C6.27 7.2 5 9.46 5 12c0 3.31 2.69 6 6 6h2c.35 0 .69-.03 1.02-.09-1.15-.89-1.93-2.23-2.11-3.73-.02-.15-.02-.31-.02-.46l.01-.24c.01-.15.03-.3.06-.44l.79-3.17c.08-.31-.12-.61-.42-.67-.07-.02-.15-.02-.22 0L10.03 11c-.18.05-.36.13-.31.31l.8 3.2c.01.05.01.1 0 .15l-.01.24c0 .15.01.31.02.46.19 1.58.99 3.01 2.2 3.97-.34.06-.69.09-1.04.09-2.48 0-4.5-2.02-4.5-4.5 0-1.63.89-3.05 2.2-3.83L9.23 6.2c.08-.33-.13-.65-.46-.73-.07-.02-.15-.02-.22 0L7.3 6.1c-.18.05-.36.14-.31.32l1.18 4.74c.18.72.62 1.35 1.23 1.8-.59.73-1.03 1.63-1.18 2.63-.03.21-.03.43 0 .64.09.6.29 1.18.63 1.69.1.63.23 1.25.38 1.82z" opacity="0.3"/>
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
